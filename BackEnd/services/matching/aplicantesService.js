const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');
const {
    enviarCorreoSeleccionAplicante,
    enviarCorreoDescarteAplicante,
} = require('../common/email.service');

const TABLA = 'aplicantes_empleo';


// ======================================================
// OBTENER TODOS LOS APLICANTES (admin)
// ======================================================

const obtenerAplicantes = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER APLICANTE POR ID
// ======================================================

const obtenerAplicantePorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR APLICANTE (RF-13: estudiante aplica a posición)
// fix: nombres de campos en snake_case para coincidir con la BD
// + nuevos campos: mensaje_presentacion, id_curriculum_version
// ======================================================

const crearAplicante = async (aplicanteData) => {

    // RF-13: "Un estudiante no puede aplicar dos veces a la misma posición".
    const { data: existente, error: errorExistente } = await supabase
        .from(TABLA)
        .select('id')
        .eq('id_usuario', aplicanteData.id_usuario)
        .eq('id_empleo', aplicanteData.id_empleo)
        .maybeSingle();

    if (errorExistente) throw mapDbError(errorExistente);
    if (existente) {
        const err = new Error('Ya aplicaste a esta posición anteriormente.');
        err.statusCode = 409;
        throw err;
    }

    const nuevoAplicante = {
        id_usuario: aplicanteData.id_usuario,
        id_empleo: aplicanteData.id_empleo,
        estado: aplicanteData.estado || 'enviada',
        mensaje_presentacion: aplicanteData.mensaje_presentacion || null,
        id_curriculum_version: aplicanteData.id_curriculum_version || null,
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoAplicante])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR APLICANTE (exalumno cambia estado)
// ======================================================

const actualizarAplicante = async (id, aplicanteData) => {

    const datosActualizar = Object.assign({}, aplicanteData, { updated_at: new Date() });

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ELIMINAR APLICANTE (admin)
// ======================================================

const eliminarAplicante = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return { mensaje: 'Aplicante eliminado correctamente' };
};


// ======================================================
// OBTENER APLICANTES POR EMPLEO (exalumno ve sus aplicantes)
// Incluye datos del usuario que aplicó
// ======================================================

const obtenerAplicantesPorEmpleo = async (idEmpleo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*, usuarios(nombre, correo_electronico)')
        .eq('id_empleo', idEmpleo)
        .order('created_at', { ascending: true });

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER APLICANTES POR USUARIO (admin)
// ======================================================

const obtenerAplicantesPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario', idUsuario);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// RF-13: MIS APLICACIONES (estudiante ve su historial)
// Incluye datos de la posición para mostrar en la vista
// ======================================================

const obtenerMisAplicaciones = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select(`
            id,
            estado,
            mensaje_presentacion,
            id_curriculum_version,
            created_at,
            updated_at,
            puestos_empleo (
                id,
                titulo_puesto,
                tipo,
                modalidad,
                empresa,
                fecha_limite,
                estado
            )
        `)
        .eq('id_usuario', idUsuario)
        .order('created_at', { ascending: false });

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// RF-13: RETIRAR APLICACIÓN
// Solo permitido si estado = 'enviada'
// ======================================================

const retirarAplicacion = async (id, idUsuario) => {

    // Verificar que la aplicación existe, pertenece al usuario y está en estado 'enviada'
    const { data: aplicacion, error: errorBusqueda } = await supabase
        .from(TABLA)
        .select('id, estado, id_usuario')
        .eq('id', id)
        .maybeSingle();

    if (errorBusqueda) throw mapDbError(errorBusqueda);

    if (!aplicacion) {
        const err = new Error('Aplicación no encontrada');
        err.statusCode = 404;
        throw err;
    }

    if (aplicacion.id_usuario !== idUsuario) {
        const err = new Error('No tienes permiso para retirar esta aplicación');
        err.statusCode = 403;
        throw err;
    }

    if (aplicacion.estado !== 'enviada') {
        const err = new Error('Solo puedes retirar una aplicación en estado "enviada"');
        err.statusCode = 400;
        throw err;
    }

    const { error: errorDelete } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (errorDelete) throw mapDbError(errorDelete);

    return { mensaje: 'Aplicación retirada correctamente' };
};


// ======================================================
// RF-13: APLICANTES DE UNA POSICIÓN (exalumno gestiona)
// Con score de compatibilidad si existe en matches_posiciones
// ======================================================

const obtenerAplicantesPorPosicion = async (idPosicion) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select(`
            id,
            estado,
            mensaje_presentacion,
            id_curriculum_version,
            created_at,
            usuarios (
                id,
                nombre,
                correo_electronico
            )
        `)
        .eq('id_empleo', idPosicion)
        .order('created_at', { ascending: true });

    if (error) throw mapDbError(error);

    // Enriquecer con score de compatibilidad si existe en matches_posiciones
    if (data && data.length > 0) {
        const idsEstudiantes = data.map(a => a.usuarios?.id).filter(Boolean);

        const { data: scores } = await supabase
            .from('matches_posiciones')
            .select('id_estudiante, score_match')
            .eq('id_posicion', idPosicion)
            .in('id_estudiante', idsEstudiantes);

        const scoreMap = {};
        if (scores) {
            scores.forEach(s => { scoreMap[s.id_estudiante] = s.score_match; });
        }

        return data.map(a => ({
            ...a,
            score_compatibilidad: scoreMap[a.usuarios?.id] ?? null,
        }));
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

// ======================================================
// RF-13: SELECCIONAR CANDIDATO (exalumno)
// Notifica al seleccionado y descarta automáticamente al resto
// ======================================================

const seleccionarCandidato = async (idAplicacion, idExalumno) => {

    const { data: aplicacion, error: errorLectura } = await supabase
        .from(TABLA)
        .select('id, id_empleo, id_usuario, estado')
        .eq('id', idAplicacion)
        .maybeSingle();

    if (errorLectura) throw mapDbError(errorLectura);
    if (!aplicacion) { const err = new Error('Aplicación no encontrada'); err.statusCode = 404; throw err; }

    const { data: puesto } = await supabase
        .from('puestos_empleo')
        .select('id, titulo_puesto, empresa, id_usuario')
        .eq('id', aplicacion.id_empleo)
        .maybeSingle();

    if (!puesto || puesto.id_usuario !== idExalumno) {
        const err = new Error('No tienes permiso para seleccionar candidatos en esta posición');
        err.statusCode = 403; throw err;
    }

    // 1. Marcar el candidato como seleccionado
    const { data: seleccionado, error: errorSeleccion } = await supabase
        .from(TABLA)
        .update({ estado: 'seleccionado', updated_at: new Date() })
        .eq('id', idAplicacion)
        .select()
        .single();

    if (errorSeleccion) throw mapDbError(errorSeleccion);

    // 2. Descartar automáticamente a los demás aplicantes
    const { data: descartados } = await supabase
        .from(TABLA)
        .update({ estado: 'descartado', updated_at: new Date() })
        .eq('id_empleo', aplicacion.id_empleo)
        .neq('id', idAplicacion)
        .in('estado', ['enviada', 'en_revision'])
        .select('id_usuario');

    // 3. Notificaciones por email (no bloqueantes)
    try {
        const [exalumnoRes, estudianteSeleccionadoRes] = await Promise.all([
            supabase.from('usuarios').select('nombre').eq('id', idExalumno).maybeSingle(),
            supabase.from('usuarios').select('nombre, correo_electronico').eq('id', aplicacion.id_usuario).maybeSingle(),
        ]);

        if (estudianteSeleccionadoRes.data) {
            await enviarCorreoSeleccionAplicante({
                correo_estudiante: estudianteSeleccionadoRes.data.correo_electronico,
                nombre_estudiante: estudianteSeleccionadoRes.data.nombre,
                titulo_puesto: puesto.titulo_puesto,
                empresa: puesto.empresa,
                nombre_exalumno: exalumnoRes.data?.nombre || 'El exalumno',
            });
        }

        if (descartados?.length) {
            const idsDescartados = descartados.map(d => d.id_usuario);
            const { data: usuariosDescartados } = await supabase
                .from('usuarios').select('nombre, correo_electronico').in('id', idsDescartados);
            await Promise.all((usuariosDescartados || []).map(u =>
                enviarCorreoDescarteAplicante({
                    correo_estudiante: u.correo_electronico,
                    nombre_estudiante: u.nombre,
                    titulo_puesto: puesto.titulo_puesto,
                })
            ));
        }
    } catch (emailErr) {
        console.warn('⚠️ No se pudieron enviar correos de selección/descarte:', emailErr.message);
    }

    return seleccionado;
};


module.exports = {
    obtenerAplicantes,
    obtenerAplicantePorId,
    crearAplicante,
    actualizarAplicante,
    eliminarAplicante,
    obtenerAplicantesPorEmpleo,
    obtenerAplicantesPorUsuario,
    // RF-13 nuevos
    obtenerMisAplicaciones,
    retirarAplicacion,
    obtenerAplicantesPorPosicion,
    seleccionarCandidato,
};