const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'areas_interes';


// ======================================================
// OBTENER TODAS LAS ÁREAS DE INTERÉS
// ======================================================

const obtenerAreasInteres = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw mapDbError(error);
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
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// CREAR ÁREA DE INTERÉS
// ======================================================

const crearAreaInteres = async (areaData) => {

    const nuevaArea = {
        nombre: areaData.nombre,
        descripcion: areaData.descripcion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaArea])
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ACTUALIZAR ÁREA DE INTERÉS
// ======================================================

const actualizarAreaInteres = async (id, areaData) => {

    const datosActualizar = Object.assign({}, areaData, { updated_at: new Date() });

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
// ELIMINAR ÁREA DE INTERÉS
// ======================================================

const eliminarAreaInteres = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) {
        throw mapDbError(error);
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
    obtenerAreasInteres,
    obtenerAreaInteresPorId,
    crearAreaInteres,
    actualizarAreaInteres,
    eliminarAreaInteres,
    buscarAreasPorNombre
};
