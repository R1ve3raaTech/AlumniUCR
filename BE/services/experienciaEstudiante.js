const supabase = require('../config/supabase');

const TABLA = 'experiencia_estudiante';


// ======================================================
// OBTENER TODAS LAS EXPERIENCIAS
// ======================================================

const obtenerExperienciasEstudiante = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER EXPERIENCIA POR ID
// ======================================================

const obtenerExperienciaPorId = async (id) => {

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
// CREAR EXPERIENCIA
// ======================================================

const crearExperiencia = async (experienciaData) => {

    const nuevaExperiencia = {
        Tipo: experienciaData.Tipo,
        IdUsuario: experienciaData.IdUsuario,
        Titulo: experienciaData.Titulo,
        Organizacion: experienciaData.Organizacion,
        FechaInicio: experienciaData.FechaInicio,
        FechaFin: experienciaData.FechaFin,
        Descripcion: experienciaData.Descripcion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaExperiencia])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR EXPERIENCIA
// ======================================================

const actualizarExperiencia = async (id, experienciaData) => {

    const datosActualizar = {
        ...experienciaData,
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
// ELIMINAR EXPERIENCIA
// ======================================================

const eliminarExperiencia = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Experiencia eliminada correctamente'
    };
};


// ======================================================
// OBTENER EXPERIENCIAS POR USUARIO
// ======================================================

const obtenerExperienciasPorUsuario = async (idUsuario) => {

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
// OBTENER EXPERIENCIAS POR TIPO
// ======================================================

const obtenerExperienciasPorTipo = async (tipo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('Tipo', tipo);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// BUSCAR EXPERIENCIAS POR ORGANIZACIÓN
// ======================================================

const buscarExperienciasPorOrganizacion = async (organizacion) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('Organizacion', `%${organizacion}%`);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerExperienciasEstudiante,
    obtenerExperienciaPorId,
    crearExperiencia,
    actualizarExperiencia,
    eliminarExperiencia,
    obtenerExperienciasPorUsuario,
    obtenerExperienciasPorTipo,
    buscarExperienciasPorOrganizacion
};