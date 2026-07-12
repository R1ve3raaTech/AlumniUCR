const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'certificaciones_estudiante';


// ======================================================
// OBTENER TODAS LAS CERTIFICACIONES
// ======================================================

const obtenerCertificacionesEstudiante = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER CERTIFICACIÓN POR ID
// ======================================================

const obtenerCertificacionPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR CERTIFICACIÓN
// ======================================================

const crearCertificacion = async (certificacionData) => {

    const nuevaCertificacion = {
        id_usuario: certificacionData.id_usuario,
        nombre: certificacionData.nombre,
        institucion: certificacionData.institucion,
        fecha: certificacionData.fecha,
        url_verificacion: certificacionData.url_verificacion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaCertificacion])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR CERTIFICACIÓN
// ======================================================

const actualizarCertificacion = async (id, certificacionData) => {

    const datosActualizar = Object.assign({}, certificacionData, { updated_at: new Date() });

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
// ELIMINAR CERTIFICACIÓN
// ======================================================

const eliminarCertificacion = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Certificación eliminada correctamente'
    };
};


// ======================================================
// OBTENER CERTIFICACIONES POR USUARIO
// ======================================================

const obtenerCertificacionesPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario', idUsuario);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// BUSCAR CERTIFICACIONES POR NOMBRE
// ======================================================

const buscarCertificacionesPorNombre = async (nombre) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('nombre', `%${nombre}%`);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerCertificacionesEstudiante,
    obtenerCertificacionPorId,
    crearCertificacion,
    actualizarCertificacion,
    eliminarCertificacion,
    obtenerCertificacionesPorUsuario,
    buscarCertificacionesPorNombre
};
