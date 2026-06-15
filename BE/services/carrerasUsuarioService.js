const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'carreras_usuario';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerCarrerasUsuario = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw mapDbError(error);
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
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearCarreraUsuario = async (carreraUsuarioData) => {

    const nuevaRelacion = {
        id_carrera: carreraUsuarioData.id_carrera,
        id_usuario: carreraUsuarioData.id_usuario,
        id_sede: carreraUsuarioData.id_sede,
        ano_graduacion: carreraUsuarioData.ano_graduacion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaRelacion])
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarCarreraUsuario = async (id, carreraUsuarioData) => {

    const datosActualizar = Object.assign({}, carreraUsuarioData, { updated_at: new Date() });

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarCarreraUsuario = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) {
        throw mapDbError(error);
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
        .eq('id_usuario', idUsuario);

    if (error) {
        throw mapDbError(error);
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
        .eq('id_carrera', idCarrera);

    if (error) {
        throw mapDbError(error);
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
        .eq('id_sede', idSede);

    if (error) {
        throw mapDbError(error);
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
