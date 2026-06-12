const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'facultades';


// ======================================================
// OBTENER TODAS LAS FACULTADES
// ======================================================

const obtenerFacultades = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw mapDbError(error);
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
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// CREAR FACULTAD
// ======================================================

const crearFacultad = async (facultadData) => {

    const nuevaFacultad = {
        nombre: facultadData.nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaFacultad])
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ACTUALIZAR FACULTAD
// ======================================================

const actualizarFacultad = async (id, facultadData) => {

    const datosActualizar = Object.assign({}, facultadData, {
        updated_at: new Date()
    });

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
// ELIMINAR FACULTAD
// ======================================================

const eliminarFacultad = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) {
        throw mapDbError(error);
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
    obtenerFacultades,
    obtenerFacultadPorId,
    crearFacultad,
    actualizarFacultad,
    eliminarFacultad,
    buscarFacultadesPorNombre
};
