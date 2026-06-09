const supabase = require('../config/supabase');

const TABLA = 'carreras';


// ======================================================
// OBTENER TODAS LAS CARRERAS
// ======================================================

const obtenerCarreras = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
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
        .eq('Id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// CREAR CARRERA
// ======================================================

const crearCarrera = async (carreraData) => {

    const nuevaCarrera = {
        Nombre: carreraData.Nombre,
        IdFacultad: carreraData.IdFacultad
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaCarrera])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR CARRERA
// ======================================================

const actualizarCarrera = async (id, carreraData) => {

    const datosActualizar = {
        ...carreraData,
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
// ELIMINAR CARRERA
// ======================================================

const eliminarCarrera = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
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
        .eq('IdFacultad', idFacultad);

    if (error) {
        throw new Error(error.message);
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
    obtenerCarreras,
    obtenerCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera,
    obtenerCarrerasPorFacultad,
    buscarCarrerasPorNombre
};