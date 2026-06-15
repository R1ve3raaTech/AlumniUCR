const supabase = require('../config/supabase');

const TABLA = 'certificaciones_estudiante';


// ======================================================
// OBTENER TODAS LAS CERTIFICACIONES
// ======================================================

const obtenerCertificacionesEstudiante = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER CERTIFICACIÓN POR ID
// ======================================================

const obtenerCertificacionPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('Id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// CREAR CERTIFICACIÓN
// ======================================================

const crearCertificacion = async (certificacionData) => {

    const nuevaCertificacion = {
        IdUsuario: certificacionData.IdUsuario,
        Nombre: certificacionData.Nombre,
        Institucion: certificacionData.Institucion,
        Fecha: certificacionData.Fecha,
        URLVerificacion: certificacionData.URLVerificacion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaCertificacion])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR CERTIFICACIÓN
// ======================================================

const actualizarCertificacion = async (id, certificacionData) => {

    const datosActualizar = {
        ...certificacionData,
        UpdatedAt: new Date()
    };

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('Id', id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ELIMINAR CERTIFICACIÓN
// ======================================================

const eliminarCertificacion = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

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
        .eq('IdUsuario', idUsuario);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// BUSCAR CERTIFICACIONES POR NOMBRE
// ======================================================

const buscarCertificacionesPorNombre = async (nombre) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('Nombre', `%${nombre}%`);

    if (error) {
        throw new Error(error.message);
    }

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