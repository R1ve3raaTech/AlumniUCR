const supabase = require('../config/supabase');

const TABLA = 'carreras_usuario';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerCarrerasUsuario = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerCarreraUsuarioPorId = async (id) => {

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
// CREAR RELACIÓN
// ======================================================

const crearCarreraUsuario = async (carreraUsuarioData) => {

    const nuevaRelacion = {
        IdCarrera: carreraUsuarioData.IdCarrera,
        IdUsuario: carreraUsuarioData.IdUsuario,
        IdSede: carreraUsuarioData.IdSede,
        AnoGraduacion: carreraUsuarioData.AnoGraduacion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaRelacion])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarCarreraUsuario = async (id, carreraUsuarioData) => {

    const datosActualizar = {
        ...carreraUsuarioData,
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
// ELIMINAR RELACIÓN
// ======================================================

const eliminarCarreraUsuario = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Relación eliminada correctamente'
    };
};


// ======================================================
// OBTENER CARRERAS POR USUARIO
// ======================================================

const obtenerCarrerasPorUsuario = async (idUsuario) => {

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
// OBTENER USUARIOS POR CARRERA
// ======================================================

const obtenerUsuariosPorCarrera = async (idCarrera) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdCarrera', idCarrera);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER USUARIOS POR SEDE
// ======================================================

const obtenerUsuariosPorSede = async (idSede) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdSede', idSede);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerCarrerasUsuario,
    obtenerCarreraUsuarioPorId,
    crearCarreraUsuario,
    actualizarCarreraUsuario,
    eliminarCarreraUsuario,
    obtenerCarrerasPorUsuario,
    obtenerUsuariosPorCarrera,
    obtenerUsuariosPorSede
};