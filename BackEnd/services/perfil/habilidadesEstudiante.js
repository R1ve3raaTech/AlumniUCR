const supabase = require('../../config/supabase');

const TABLA = 'habilidades_estudiante';


// ======================================================
// OBTENER TODAS LAS HABILIDADES
// ======================================================

const obtenerHabilidadesEstudiante = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER HABILIDAD POR ID
// ======================================================

const obtenerHabilidadPorId = async (id) => {

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
// CREAR HABILIDAD
// ======================================================

const crearHabilidad = async (habilidadData) => {

    const nuevaHabilidad = {
        IdUsuario: habilidadData.IdUsuario,
        Tecnicas: habilidadData.Tecnicas,
        Blandas: habilidadData.Blandas,
        Idiomas: habilidadData.Idiomas
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaHabilidad])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR HABILIDAD
// ======================================================

const actualizarHabilidad = async (id, habilidadData) => {

    const datosActualizar = {
        ...habilidadData,
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
// ELIMINAR HABILIDAD
// ======================================================

const eliminarHabilidad = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Habilidad eliminada correctamente'
    };
};


// ======================================================
// OBTENER HABILIDADES POR USUARIO
// ======================================================

const obtenerHabilidadesPorUsuario = async (idUsuario) => {

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
// BUSCAR HABILIDADES TÉCNICAS
// ======================================================

const buscarHabilidadesTecnicas = async (tecnica) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('Tecnicas', `%${tecnica}%`);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// BUSCAR IDIOMAS
// ======================================================

const buscarIdiomas = async (idioma) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('Idiomas', `%${idioma}%`);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerHabilidadesEstudiante,
    obtenerHabilidadPorId,
    crearHabilidad,
    actualizarHabilidad,
    eliminarHabilidad,
    obtenerHabilidadesPorUsuario,
    buscarHabilidadesTecnicas,
    buscarIdiomas
};