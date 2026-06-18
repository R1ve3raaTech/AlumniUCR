// Servicio de Matching Mentoría (RF-06).
// Implementa el algoritmo completo de scoring 0-100 del PDF y
// persiste los resultados en la tabla matches_mentoria.
//
// Scoring:
//   30 pts — Misma carrera UCR (coincidencia exacta)
//   30 pts — Áreas de interés en común (proporcional a la intersección)
//   20 pts — Sector del exalumno ↔ área temática del proyecto
//   20 pts — Tipo de apoyo ofrecido ↔ buscado
//
// Estados: sugerido → contactado → activo → cerrado

const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');
const {
    enviarCorreoNuevoContacto,
    enviarCorreoMatchActivo,
    enviarCorreoMatchActivoAdmin,
} = require('./email.service');

const TABLA = 'matches_mentoria';

// RF-06: trae nombre/correo/rol de los dos usuarios de un match (exalumno y
// estudiante) para las notificaciones por correo. Devuelve un mapa por id.
async function obtenerDatosUsuarios(ids) {
    const { data } = await supabase
        .from('usuarios')
        .select('id, nombre, correo_electronico, roles(nombre)')
        .in('id', ids);
    const mapa = {};
    for (const u of data || []) {
        mapa[u.id] = {
            nombre: u.nombre || 'Usuario',
            correo: u.correo_electronico,
            rol: u.roles?.nombre?.toLowerCase() || '',
        };
    }
    return mapa;
}


// ======================================================
// ALGORITMO DE SCORING (RF-06)
// ======================================================

const calcularScore = (exalumno, estudiante, areasExalumno, areasEstudiante, carrerasExalumno, carrerasEstudiante, sectoresExalumno, areasProyecto) => {

    let score = 0;

    // 1. Misma carrera UCR (30 pts) — coincidencia exacta de id_carrera
    const setCarrerasExalumno = new Set(carrerasExalumno.map(c => c.id_carrera));
    const setCarrerasEstudiante = new Set(carrerasEstudiante.map(c => c.id_carrera));
    const mismaCarrera = [...setCarrerasExalumno].some(c => setCarrerasEstudiante.has(c));
    if (mismaCarrera) score += 30;

    // 2. Áreas de interés en común (30 pts — proporcional)
    // "misma lógica que el matching de mentoría" del PDF:
    // proporcional = (intersección / total_áreas_estudiante) * 30
    const setAreasExalumno = new Set(areasExalumno.map(a => a.id_area_tematica));
    const setAreasEstudiante = new Set(areasEstudiante.map(a => a.id_area_tematica));
    const interseccionAreas = [...setAreasEstudiante].filter(a => setAreasExalumno.has(a));
    if (setAreasEstudiante.size > 0) {
        score += Math.round((interseccionAreas.length / setAreasEstudiante.size) * 30);
    }

    // 3. Sector del exalumno ↔ área temática del proyecto (20 pts)
    // Si algún sector del exalumno coincide con algún área del proyecto
    const setAreasProyecto = new Set(areasProyecto.map(a => a.id_area_tematica));
    const setSectoresExalumno = new Set(sectoresExalumno.map(s => s.id_sector));
    // Usamos áreas_interes como puente entre sectores y áreas temáticas
    // Si comparten al menos 1 área en común entre sector↔área del proyecto
    const sectorCoinciде = [...setAreasProyecto].some(a => setSectoresExalumno.has(a));
    if (sectorCoinciде) score += 20;

    // 4. Tipo de apoyo ofrecido ↔ buscado (20 pts)
    // Al menos 1 tipo coincide entre lo que ofrece el exalumno y lo que busca el estudiante
    const apoyoCoincide = (
        (exalumno.ofrece_mentoria && estudiante.busca_mentoria) ||
        (exalumno.ofrece_empleo && estudiante.busca_empleo) ||
        (exalumno.ofrece_pasantia && estudiante.busca_pasantia) ||
        (exalumno.ofrece_donacion && estudiante.busca_financiamiento)
    );
    if (apoyoCoincide) score += 20;

    return score;
};


// ======================================================
// GENERAR MATCHES (llamar al completar perfil)
// Calcula scores y persiste en matches_mentoria
// ======================================================

const generarMatchesPorUsuario = async (idUsuario, rol) => {

    // Cargar datos base según el rol del usuario que completó perfil
    const [
        exalumnosRes,
        estudiantesRes,
        areasExalumnosRes,
        areasProyectosRes,
        carrerasUsuariosRes,
        sectoresExalumnosRes,
        infoEstudiantesRes,
        infoExalumnosRes,
        proyectosRes,
    ] = await Promise.all([
        supabase.from('usuarios').select('id').eq('id_rol', 2), // exalumnos
        supabase.from('usuarios').select('id').eq('id_rol', 1), // estudiantes
        supabase.from('areas_interes_exalumno').select('id_exalumno, id_area_tematica'),
        supabase.from('areas_interes_proyecto').select('id_proyecto, id_area_tematica'),
        supabase.from('carreras_usuario').select('id_usuario, id_carrera'),
        supabase.from('sectores_exalumno').select('id_exalumno, id_sector'),
        supabase.from('informacion_estudiante').select('id_usuario, busca_financiamiento, busca_mentoria, busca_empleo, busca_pasantia, perfil_completo, pausado'),
        supabase.from('informacion_exalumno').select('id_usuario, ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_donacion, estado'),
        supabase.from('proyecto_graduacion').select('id, id_estudiante, proyecto_finalizado'),
    ]);

    // Construir mapas para acceso rápido
    const areasExalumnoMap = new Map();
    areasExalumnosRes.data?.forEach(a => {
        if (!areasExalumnoMap.has(a.id_exalumno)) areasExalumnoMap.set(a.id_exalumno, []);
        areasExalumnoMap.get(a.id_exalumno).push(a);
    });

    const areasProyectoMap = new Map();
    areasProyectosRes.data?.forEach(a => {
        if (!areasProyectoMap.has(a.id_proyecto)) areasProyectoMap.set(a.id_proyecto, []);
        areasProyectoMap.get(a.id_proyecto).push(a);
    });

    const carrerasMap = new Map();
    carrerasUsuariosRes.data?.forEach(c => {
        if (!carrerasMap.has(c.id_usuario)) carrerasMap.set(c.id_usuario, []);
        carrerasMap.get(c.id_usuario).push(c);
    });

    const sectoresExalumnoMap = new Map();
    sectoresExalumnosRes.data?.forEach(s => {
        if (!sectoresExalumnoMap.has(s.id_exalumno)) sectoresExalumnoMap.set(s.id_exalumno, []);
        sectoresExalumnoMap.get(s.id_exalumno).push(s);
    });

    const infoEstudianteMap = new Map(infoEstudiantesRes.data?.map(e => [e.id_usuario, e]) || []);
    const infoExalumnoMap = new Map(infoExalumnosRes.data?.map(e => [e.id_usuario, e]) || []);
    const proyectoPorEstudiante = new Map(proyectosRes.data?.map(p => [p.id_estudiante, p]) || []);

    // Determinar qué pares calcular según el rol
    // Si es exalumno: calcular matches de ese exalumno con todos los estudiantes
    // Si es estudiante: calcular matches de ese estudiante con todos los exalumnos
    const pares = [];

    if (rol === 'exalumno') {
        const infoExa = infoExalumnoMap.get(idUsuario);
        if (!infoExa || !infoExa.estado) return { generados: 0 }; // perfil incompleto

        estudiantesRes.data?.forEach(est => {
            const infoEst = infoEstudianteMap.get(est.id);
            if (!infoEst || !infoEst.perfil_completo || infoEst.pausado) return;
            pares.push({ id_exalumno: idUsuario, id_estudiante: est.id });
        });
    } else {
        const infoEst = infoEstudianteMap.get(idUsuario);
        if (!infoEst || !infoEst.perfil_completo || infoEst.pausado) return { generados: 0 };

        exalumnosRes.data?.forEach(exa => {
            const infoExa = infoExalumnoMap.get(exa.id);
            if (!infoExa || !infoExa.estado) return; // perfil incompleto
            pares.push({ id_exalumno: exa.id, id_estudiante: idUsuario });
        });
    }

    // Calcular score para cada par y guardar si > 0
    const matchesAInsertar = [];

    for (const par of pares) {
        const infoExa = infoExalumnoMap.get(par.id_exalumno);
        const infoEst = infoEstudianteMap.get(par.id_estudiante);
        const proyecto = proyectoPorEstudiante.get(par.id_estudiante);

        if (!infoExa || !infoEst || !proyecto || proyecto.proyecto_finalizado) continue;

        const areasExa = areasExalumnoMap.get(par.id_exalumno) || [];
        const areasEst = areasProyectoMap.get(proyecto.id) || [];
        const carrerasExa = carrerasMap.get(par.id_exalumno) || [];
        const carrerasEst = carrerasMap.get(par.id_estudiante) || [];
        const sectoresExa = sectoresExalumnoMap.get(par.id_exalumno) || [];

        const score = calcularScore(
            infoExa, infoEst,
            areasExa, areasEst,
            carrerasExa, carrerasEst,
            sectoresExa, areasEst
        );

        if (score > 0) {
            matchesAInsertar.push({
                id_exalumno: par.id_exalumno,
                id_estudiante: par.id_estudiante,
                score_match: score,
                estado: 'sugerido',
                iniciado_por: 'plataforma',
            });
        }
    }

    if (matchesAInsertar.length === 0) return { generados: 0 };

    // Upsert: si ya existe el par, actualiza el score
    const { error } = await supabase
        .from(TABLA)
        .upsert(matchesAInsertar, {
            onConflict: 'id_exalumno,id_estudiante',
            ignoreDuplicates: false,
        });

    if (error) throw mapDbError(error);

    return { generados: matchesAInsertar.length };
};


// ======================================================
// MIS MATCHES (usuario autenticado ve sus sugerencias)
// ======================================================

const obtenerMisMatches = async (idUsuario, rol) => {

    let query;

    if (rol === 'exalumno') {
        query = supabase
            .from(TABLA)
            .select(`
                id, score_match, estado, iniciado_por, resultado, created_at,
                usuarios!matches_mentoria_id_estudiante_fkey (
                    id, nombre, correo_electronico
                )
            `)
            .eq('id_exalumno', idUsuario)
            .neq('estado', 'cerrado')
            .order('score_match', { ascending: false });
    } else {
        query = supabase
            .from(TABLA)
            .select(`
                id, score_match, estado, iniciado_por, resultado, created_at,
                usuarios!matches_mentoria_id_exalumno_fkey (
                    id, nombre, correo_electronico
                )
            `)
            .eq('id_estudiante', idUsuario)
            .neq('estado', 'cerrado')
            .order('score_match', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CONTACTAR (sugerido → contactado)
// ======================================================

const contactarMatch = async (id, idUsuario) => {

    const { data: match, error: errorBusqueda } = await supabase
        .from(TABLA)
        .select('id, estado, id_exalumno, id_estudiante')
        .eq('id', id)
        .maybeSingle();

    if (errorBusqueda) throw mapDbError(errorBusqueda);
    if (!match) {
        const err = new Error('Match no encontrado');
        err.statusCode = 404;
        throw err;
    }

    // Solo el exalumno o el estudiante del match pueden contactar
    if (match.id_exalumno !== idUsuario && match.id_estudiante !== idUsuario) {
        const err = new Error('No tienes permiso para esta acción');
        err.statusCode = 403;
        throw err;
    }

    if (match.estado !== 'sugerido') {
        const err = new Error('Solo se puede contactar un match en estado "sugerido"');
        err.statusCode = 400;
        throw err;
    }

    const iniciado_por = match.id_exalumno === idUsuario ? 'exalumno' : 'estudiante';

    const { data, error } = await supabase
        .from(TABLA)
        .update({ estado: 'contactado', iniciado_por, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    // RF-06: notificar por correo a la otra parte (no bloqueante).
    try {
        const usuarios = await obtenerDatosUsuarios([match.id_exalumno, match.id_estudiante]);
        const destinatarioId = iniciado_por === 'exalumno' ? match.id_estudiante : match.id_exalumno;
        const remitenteId = iniciado_por === 'exalumno' ? match.id_exalumno : match.id_estudiante;
        const destinatario = usuarios[destinatarioId];
        if (destinatario?.correo) {
            await enviarCorreoNuevoContacto({
                nombre_remitente: usuarios[remitenteId]?.nombre,
                correo_destinatario: destinatario.correo,
                nombre_destinatario: destinatario.nombre,
                rol_remitente: iniciado_por,
            });
        }
    } catch (emailErr) {
        console.warn('⚠️ No se pudo notificar el nuevo contacto:', emailErr.message);
    }

    return data;
};


// ======================================================
// ACEPTAR (contactado → activo)
// ======================================================

const aceptarMatch = async (id, idUsuario) => {

    const { data: match, error: errorBusqueda } = await supabase
        .from(TABLA)
        .select('id, estado, id_exalumno, id_estudiante, iniciado_por')
        .eq('id', id)
        .maybeSingle();

    if (errorBusqueda) throw mapDbError(errorBusqueda);
    if (!match) {
        const err = new Error('Match no encontrado');
        err.statusCode = 404;
        throw err;
    }

    if (match.id_exalumno !== idUsuario && match.id_estudiante !== idUsuario) {
        const err = new Error('No tienes permiso para esta acción');
        err.statusCode = 403;
        throw err;
    }

    if (match.estado !== 'contactado') {
        const err = new Error('Solo se puede aceptar un match en estado "contactado"');
        err.statusCode = 400;
        throw err;
    }

    const { data, error } = await supabase
        .from(TABLA)
        .update({ estado: 'activo', resultado: 'en_progreso', updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    // RF-06: match activo → notificar a ambas partes y al admin (no bloqueante).
    try {
        const usuarios = await obtenerDatosUsuarios([match.id_exalumno, match.id_estudiante]);
        const exalumno = usuarios[match.id_exalumno];
        const estudiante = usuarios[match.id_estudiante];
        if (exalumno?.correo && estudiante?.correo) {
            await enviarCorreoMatchActivo({
                nombre_a: exalumno.nombre, correo_a: exalumno.correo,
                nombre_b: estudiante.nombre, correo_b: estudiante.correo,
            });
        }
        await enviarCorreoMatchActivoAdmin({
            nombre_exalumno: exalumno?.nombre,
            nombre_estudiante: estudiante?.nombre,
            score_match: data.score_match,
        });
    } catch (emailErr) {
        console.warn('⚠️ No se pudo notificar el match activo:', emailErr.message);
    }

    return data;
};


// ======================================================
// RECHAZAR (contactado → cerrado)
// RF-06: "Un exalumno rechazado no puede volver a solicitar
// conexión al mismo estudiante" — el registro queda en BD
// con estado='cerrado' y resultado='cancelado', evitando
// que se genere de nuevo por el algoritmo (UNIQUE constraint).
// ======================================================

const rechazarMatch = async (id, idUsuario) => {

    const { data: match, error: errorBusqueda } = await supabase
        .from(TABLA)
        .select('id, estado, id_exalumno, id_estudiante')
        .eq('id', id)
        .maybeSingle();

    if (errorBusqueda) throw mapDbError(errorBusqueda);
    if (!match) {
        const err = new Error('Match no encontrado');
        err.statusCode = 404;
        throw err;
    }

    if (match.id_exalumno !== idUsuario && match.id_estudiante !== idUsuario) {
        const err = new Error('No tienes permiso para esta acción');
        err.statusCode = 403;
        throw err;
    }

    if (match.estado !== 'contactado') {
        const err = new Error('Solo se puede rechazar un match en estado "contactado"');
        err.statusCode = 400;
        throw err;
    }

    const { data, error } = await supabase
        .from(TABLA)
        .update({ estado: 'cerrado', resultado: 'cancelado', updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER TODOS LOS MATCHES (admin con filtros)
// ======================================================

const obtenerTodosLosMatches = async (filtros = {}) => {

    let query = supabase
        .from(TABLA)
        .select(`
            id, score_match, estado, iniciado_por, resultado, notas_admin, created_at, updated_at,
            usuarios!matches_mentoria_id_exalumno_fkey ( id, nombre ),
            estudiante:usuarios!matches_mentoria_id_estudiante_fkey ( id, nombre )
        `)
        .order('created_at', { ascending: false });

    if (filtros.estado) query = query.eq('estado', filtros.estado);

    const { data, error } = await query;
    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR MATCH (admin: notas + estado)
// ======================================================

const actualizarMatch = async (id, datosActualizar) => {

    const datos = Object.assign({}, datosActualizar, { updated_at: new Date() });

    const { data, error } = await supabase
        .from(TABLA)
        .update(datos)
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {
    generarMatchesPorUsuario,
    obtenerMisMatches,
    contactarMatch,
    aceptarMatch,
    rechazarMatch,
    obtenerTodosLosMatches,
    actualizarMatch,
};