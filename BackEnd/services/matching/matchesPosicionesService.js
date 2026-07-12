// Servicio de Matching Extendido — Posiciones (RF-10/13).
// Conecta estudiantes con posiciones de empleo/pasantía publicadas por exalumnos.
//
// Scoring (0-100):
//   35 pts — Carrera del estudiante ↔ sector de la posición
//             (coincidencia entre facultad del estudiante y sectores del puesto)
//   35 pts — Habilidades del CV ↔ habilidades requeridas
//             (intersección proporcional, ambas en JSON-string)
//   20 pts — Áreas de interés en común
//             (areas_interes_proyecto vs areas_interes_empleo, misma lógica RF-06)
//   10 pts — Tipo de apoyo buscado coincide
//             (busca_empleo/busca_pasantia vs puestos_empleo.tipo)
//
// Solo aparecen en /mis-matches si score > 50 (criterio explícito del PDF)

const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'matches_posiciones';


// ======================================================
// MAPA FACULTAD → SECTORES
// Necesario para el criterio 1 (carrera↔sector).
// Basado en las 14 facultades UCR y los 18 sectores del catálogo.
// ======================================================

const MAPA_FACULTAD_SECTORES = {
    1:  [17],        // Facultad de Artes → Medios y Comunicación
    2:  [3, 17],     // Facultad de Letras → Educación, Medios y Comunicación
    3:  [1, 18],     // Facultad de Ciencias → Tecnología e Informática, Investigación y Academia
    4:  [6, 12],     // Facultad de Ciencias Agroalimentarias → Agroindustria, Energía y Servicios Públicos
    5:  [4, 15],     // Facultad de Ciencias Económicas → Banca y Finanzas, Consultoría y Servicios Profesionales
    6:  [11, 17],    // Facultad de Ciencias Sociales → ONG, Medios y Comunicación
    7:  [16],        // Facultad de Derecho → Legal y Jurídico
    8:  [3],         // Facultad de Educación → Educación
    9:  [2],         // Facultad de Farmacia → Salud y Servicios Médicos
    10: [1, 7, 9],   // Facultad de Ingeniería → Tecnología, Construcción e Infraestructura, Manufactura
    11: [2],         // Facultad de Medicina → Salud y Servicios Médicos
    12: [2, 18],     // Facultad de Microbiología → Salud, Investigación y Academia
    13: [2],         // Facultad de Odontología → Salud y Servicios Médicos
    14: [3, 18],     // Facultad de Humanidades → Educación, Investigación y Academia
};


// ======================================================
// ALGORITMO DE SCORING (RF-10/13)
// ======================================================

const calcularScore = (
    infoEstudiante,
    puesto,
    carrerasEstudiante,
    carrerasData,
    habilidadesEstudiante,
    areasProyecto,
    areasEmpleo,
    sectoresEmpleo
) => {

    let score = 0;

    // 1. Carrera estudiante ↔ sector de la posición (35 pts)
    // Obtener facultades del estudiante → mapear a sectores → comparar con sectores del puesto
    const sectoresDelPuesto = new Set(sectoresEmpleo.map(s => s.id_sector));
    const facultadesDelEstudiante = new Set();

    carrerasEstudiante.forEach(cu => {
        const carrera = carrerasData.get(cu.id_carrera);
        if (carrera) facultadesDelEstudiante.add(carrera.id_facultad);
    });

    let sectorCoincide = false;
    facultadesDelEstudiante.forEach(idFacultad => {
        const sectoresDeFacultad = MAPA_FACULTAD_SECTORES[idFacultad] || [];
        if (sectoresDeFacultad.some(s => sectoresDelPuesto.has(s))) {
            sectorCoincide = true;
        }
    });
    if (sectorCoincide) score += 35;

    // 2. Habilidades del CV ↔ habilidades requeridas (35 pts — proporcional)
    try {
        const habilidadesCV = habilidadesEstudiante?.tecnicas
            ? JSON.parse(habilidadesEstudiante.tecnicas).map(h => h.nombre?.toLowerCase())
            : [];
        const habilidadesPuesto = puesto.habilidades
            ? JSON.parse(puesto.habilidades).map(h => h.toLowerCase ? h.toLowerCase() : h)
            : [];

        if (habilidadesPuesto.length > 0 && habilidadesCV.length > 0) {
            const setPuesto = new Set(habilidadesPuesto);
            const interseccion = habilidadesCV.filter(h => setPuesto.has(h));
            score += Math.round((interseccion.length / habilidadesPuesto.length) * 35);
        }
    } catch (e) {
        // Si el JSON no es válido, se omite este criterio silenciosamente
    }

    // 3. Áreas de interés en común (20 pts — misma lógica RF-06)
    const setAreasProyecto = new Set(areasProyecto.map(a => a.id_area_tematica));
    const setAreasEmpleo = new Set(areasEmpleo.map(a => a.id_area_tematica));
    const interseccionAreas = [...setAreasProyecto].filter(a => setAreasEmpleo.has(a));
    if (setAreasProyecto.size > 0) {
        score += Math.round((interseccionAreas.length / setAreasProyecto.size) * 20);
    }

    // 4. Tipo de apoyo buscado coincide (10 pts)
    const tipoCoincide = (
        (infoEstudiante.busca_empleo && puesto.tipo === 'empleo') ||
        (infoEstudiante.busca_pasantia && puesto.tipo === 'pasantia')
    );
    if (tipoCoincide) score += 10;

    return score;
};


// ======================================================
// GENERAR MATCHES DE POSICIONES (para un estudiante)
// Calcular scores contra todas las posiciones activas
// y persistir en matches_posiciones
// ======================================================

const generarMatchesPosicionesPorEstudiante = async (idEstudiante) => {

    const [
        usuarioRes,
        infoEstRes,
        habilidadesRes,
        areasProyectoRes,
        proyectoRes,
        carrerasUsuarioRes,
        carrerasRes,
        puestosRes,
        sectoresEmpleoRes,
        areasEmpleoRes,
        publicadoresActivosRes,
    ] = await Promise.all([
        supabase.from('usuarios')
            .select('id, estado')
            .eq('id', idEstudiante)
            .maybeSingle(),
        supabase.from('informacion_estudiante')
            .select('id_usuario, busca_empleo, busca_pasantia, perfil_completo, pausado')
            .eq('id_usuario', idEstudiante)
            .maybeSingle(),
        supabase.from('habilidades_estudiante')
            .select('tecnicas')
            .eq('id_usuario', idEstudiante)
            .maybeSingle(),
        supabase.from('areas_interes_proyecto')
            .select('id_proyecto, id_area_tematica'),
        supabase.from('proyecto_graduacion')
            .select('id, id_estudiante')
            .eq('id_estudiante', idEstudiante)
            .eq('proyecto_finalizado', false)
            .maybeSingle(),
        supabase.from('carreras_usuario')
            .select('id_usuario, id_carrera')
            .eq('id_usuario', idEstudiante),
        supabase.from('carreras')
            .select('id, id_facultad'),
        supabase.from('puestos_empleo')
            .select('id, tipo, habilidades, id_usuario')
            .eq('estado', 'activo')
            .eq('pausada', false)
            .eq('eliminada', false),
        supabase.from('sectores_empleo')
            .select('id_empleo, id_sector'),
        supabase.from('areas_interes_empleo')
            .select('id_empleo, id_area_tematica'),
        // RF-09.1: exalumnos activos (las posiciones de suspendidos no matchean).
        supabase.from('usuarios')
            .select('id')
            .eq('id_rol', 2)
            .eq('estado', 'activo'),
    ]);

    // RF-09.1: un estudiante suspendido no genera ni aparece en matches.
    if (usuarioRes.data?.estado !== 'activo') {
        return { generados: 0 };
    }

    const infoEstudiante = infoEstRes.data;
    if (!infoEstudiante || !infoEstudiante.perfil_completo || infoEstudiante.pausado) {
        return { generados: 0 };
    }

    const publicadoresActivos = new Set((publicadoresActivosRes.data || []).map((u) => u.id));

    const proyecto = proyectoRes.data;
    const carrerasEstudiante = carrerasUsuarioRes.data || [];
    const carrerasData = new Map((carrerasRes.data || []).map(c => [c.id, c]));
    const habilidadesEstudiante = habilidadesRes.data;

    // Áreas del proyecto del estudiante
    const areasDelProyecto = proyecto
        ? (areasProyectoRes.data || []).filter(a => a.id_proyecto === proyecto.id)
        : [];

    // Mapas por posición
    const sectoresMap = new Map();
    (sectoresEmpleoRes.data || []).forEach(s => {
        if (!sectoresMap.has(s.id_empleo)) sectoresMap.set(s.id_empleo, []);
        sectoresMap.get(s.id_empleo).push(s);
    });

    const areasEmpleoMap = new Map();
    (areasEmpleoRes.data || []).forEach(a => {
        if (!areasEmpleoMap.has(a.id_empleo)) areasEmpleoMap.set(a.id_empleo, []);
        areasEmpleoMap.get(a.id_empleo).push(a);
    });

    // Calcular score para cada posición activa
    const matchesAInsertar = [];

    for (const puesto of (puestosRes.data || [])) {
        // RF-09.1: las posiciones publicadas por un exalumno suspendido no matchean.
        if (!publicadoresActivos.has(puesto.id_usuario)) continue;

        const sectoresEmpleo = sectoresMap.get(puesto.id) || [];
        const areasEmpleo = areasEmpleoMap.get(puesto.id) || [];

        const score = calcularScore(
            infoEstudiante,
            puesto,
            carrerasEstudiante,
            carrerasData,
            habilidadesEstudiante,
            areasDelProyecto,
            areasEmpleo,
            sectoresEmpleo
        );

        if (score > 0) {
            matchesAInsertar.push({
                id_estudiante: idEstudiante,
                id_posicion: puesto.id,
                score_match: score,
            });
        }
    }

    if (matchesAInsertar.length === 0) return { generados: 0 };

    // Upsert: si ya existe el par, actualiza el score
    const { error } = await supabase
        .from(TABLA)
        .upsert(matchesAInsertar, {
            onConflict: 'id_estudiante,id_posicion',
            ignoreDuplicates: false,
        });

    if (error) throw mapDbError(error);

    return { generados: matchesAInsertar.length };
};


// ======================================================
// MIS MATCHES DE POSICIONES (score > 50, junto con mentoría)
// El PDF dice: "Las posiciones con score > 50 aparecen en
// /mis-matches del estudiante junto con los matches de mentoría"
// ======================================================

const obtenerMisMatchesPosiciones = async (idEstudiante) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select(`
            id,
            score_match,
            created_at,
            puestos_empleo (
                id,
                titulo_puesto,
                tipo,
                modalidad,
                jornada,
                empresa,
                lugar_trabajo,
                fecha_limite,
                estado,
                usuarios ( estado )
            )
        `)
        .eq('id_estudiante', idEstudiante)
        .gt('score_match', 50)
        .order('score_match', { ascending: false });

    if (error) throw mapDbError(error);

    // RF-09.1: las posiciones de un exalumno suspendido no se muestran.
    return (data || []).filter((m) => m.puestos_empleo?.usuarios?.estado === 'activo');
};


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {
    generarMatchesPosicionesPorEstudiante,
    obtenerMisMatchesPosiciones,
};