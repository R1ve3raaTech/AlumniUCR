const supabase = require('../../config/supabase');

const TABLA = 'responsabilidades';


// ======================================================
// OBTENER TODAS LAS RESPONSABILIDADES
// ======================================================

const obtenerResponsabilidades = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER RESPONSABILIDAD POR ID
// ======================================================

const obtenerResponsabilidadPorId = async (id) => {

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
// CREAR RESPONSABILIDAD
// ======================================================

const crearResponsabilidad = async (responsabilidadData) => {

    const nuevaResponsabilidad = {
        Nombre: responsabilidadData.Nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaResponsabilidad])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR RESPONSABILIDAD
// ======================================================

const actualizarResponsabilidad = async (id, responsabilidadData) => {

    const datosActualizar = {
        ...responsabilidadData,
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
// ELIMINAR RESPONSABILIDAD
// ======================================================

const eliminarResponsabilidad = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Responsabilidad eliminada correctamente'
    };
};


// ======================================================
// BUSCAR RESPONSABILIDADES POR NOMBRE
// ======================================================

const buscarResponsabilidadesPorNombre = async (nombre) => {

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
    obtenerResponsabilidades,
    obtenerResponsabilidadPorId,
    crearResponsabilidad,
    actualizarResponsabilidad,
    eliminarResponsabilidad,
    buscarResponsabilidadesPorNombre
};