const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'proyecto_necesidades';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerProyectoNecesidades = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerProyectoNecesidadPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearProyectoNecesidad = async (relacionData) => {

    const nuevaRelacion = {
        id_proyecto: relacionData.id_proyecto,
        id_necesidad: relacionData.id_necesidad
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaRelacion])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarProyectoNecesidad = async (id, relacionData) => {

    const datosActualizar = Object.assign({}, relacionData, {
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
// ELIMINAR RELACIÓN
// ======================================================

const eliminarProyectoNecesidad = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Relación eliminada correctamente'
    };
};


// ======================================================
// OBTENER NECESIDADES POR PROYECTO
// ======================================================

const obtenerNecesidadesPorProyecto = async (idProyecto) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_proyecto', idProyecto);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER PROYECTOS POR NECESIDAD
// ======================================================

const obtenerProyectosPorNecesidad = async (idNecesidad) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_necesidad', idNecesidad);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerProyectoNecesidades,
    obtenerProyectoNecesidadPorId,
    crearProyectoNecesidad,
    actualizarProyectoNecesidad,
    eliminarProyectoNecesidad,
    obtenerNecesidadesPorProyecto,
    obtenerProyectosPorNecesidad
};
