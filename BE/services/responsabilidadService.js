const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'responsabilidades';


// ======================================================
// OBTENER TODAS LAS RESPONSABILIDADES
// ======================================================

const obtenerResponsabilidades = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER RESPONSABILIDAD POR ID
// ======================================================

const obtenerResponsabilidadPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR RESPONSABILIDAD
// ======================================================

const crearResponsabilidad = async (responsabilidadData) => {

    const nuevaResponsabilidad = {
        nombre: responsabilidadData.nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaResponsabilidad])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR RESPONSABILIDAD
// ======================================================

const actualizarResponsabilidad = async (id, responsabilidadData) => {

    const datosActualizar = Object.assign({}, responsabilidadData, {
        updated_at: new Date()
    });

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ELIMINAR RESPONSABILIDAD
// ======================================================

const eliminarResponsabilidad = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

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
        .ilike('nombre', `%${nombre}%`);

    if (error) throw mapDbError(error);

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
