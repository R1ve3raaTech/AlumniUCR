const supabase = require('../config/supabase');

const TABLA = 'areas_interes';


// ======================================================
// OBTENER TODAS LAS ÁREAS DE INTERÉS
// ======================================================

const obtenerAreasInteres = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER ÁREA DE INTERÉS POR ID
// ======================================================

const obtenerAreaInteresPorId = async (id) => {

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
// CREAR ÁREA DE INTERÉS
// ======================================================

const crearAreaInteres = async (areaData) => {

    const nuevaArea = {
        Nombre: areaData.Nombre,
        Descripcion: areaData.Descripcion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaArea])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR ÁREA DE INTERÉS
// ======================================================

const actualizarAreaInteres = async (id, areaData) => {

    const datosActualizar = {
        ...areaData,
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
// ELIMINAR ÁREA DE INTERÉS
// ======================================================

const eliminarAreaInteres = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Área de interés eliminada correctamente'
    };
};


// ======================================================
// BUSCAR ÁREAS POR NOMBRE
// ======================================================

const buscarAreasPorNombre = async (nombre) => {

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
    obtenerAreasInteres,
    obtenerAreaInteresPorId,
    crearAreaInteres,
    actualizarAreaInteres,
    eliminarAreaInteres,
    buscarAreasPorNombre
};