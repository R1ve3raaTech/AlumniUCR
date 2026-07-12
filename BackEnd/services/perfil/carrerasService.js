const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'carreras';


// ======================================================
// OBTENER TODAS LAS CARRERAS
// ======================================================

const obtenerCarreras = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// OBTENER CARRERA POR ID
// ======================================================

const obtenerCarreraPorId = async (id) => {

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
// CREAR CARRERA
// ======================================================

const crearCarrera = async (carreraData) => {

    const nuevaCarrera = {
        nombre: carreraData.nombre,
        id_facultad: carreraData.id_facultad
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaCarrera])
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ACTUALIZAR CARRERA
// ======================================================

const actualizarCarrera = async (id, carreraData) => {

    const datosActualizar = Object.assign({}, carreraData, { updated_at: new Date() });

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
// ELIMINAR CARRERA
// ======================================================

const eliminarCarrera = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) {
        throw mapDbError(error);
    }

    return {
        mensaje: 'Carrera eliminada correctamente'
    };
};


// ======================================================
// OBTENER CARRERAS POR FACULTAD
// ======================================================

const obtenerCarrerasPorFacultad = async (idFacultad) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_facultad', idFacultad);

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// BUSCAR CARRERAS POR NOMBRE
// ======================================================

const buscarCarrerasPorNombre = async (nombre) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('nombre', `%${nombre}%`);

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerCarreras,
    obtenerCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera,
    obtenerCarrerasPorFacultad,
    buscarCarrerasPorNombre
};
