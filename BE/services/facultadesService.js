const supabase = require('../config/supabase');

const TABLA = 'facultades';


// ======================================================
// OBTENER TODAS LAS FACULTADES
// ======================================================

const obtenerFacultades = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER FACULTAD POR ID
// ======================================================

const obtenerFacultadPorId = async (id) => {

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
// CREAR FACULTAD
// ======================================================

const crearFacultad = async (facultadData) => {

    const nuevaFacultad = {
        Nombre: facultadData.Nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaFacultad])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR FACULTAD
// ======================================================

const actualizarFacultad = async (id, facultadData) => {

    const datosActualizar = {
        ...facultadData,
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
// ELIMINAR FACULTAD
// ======================================================

const eliminarFacultad = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Facultad eliminada correctamente'
    };
};


// ======================================================
// BUSCAR FACULTADES POR NOMBRE
// ======================================================

const buscarFacultadesPorNombre = async (nombre) => {

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
    obtenerFacultades,
    obtenerFacultadPorId,
    crearFacultad,
    actualizarFacultad,
    eliminarFacultad,
    buscarFacultadesPorNombre
};