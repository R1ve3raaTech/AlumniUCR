const supabase = require('../../config/supabase');

const TABLA = 'proyecto_necesidades';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerProyectoNecesidades = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerProyectoNecesidadPorId = async (id) => {

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
// CREAR RELACIÓN
// ======================================================

const crearProyectoNecesidad = async (relacionData) => {

    const nuevaRelacion = {
        IdProyecto: relacionData.IdProyecto,
        IdNecesidad: relacionData.IdNecesidad
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaRelacion])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarProyectoNecesidad = async (id, relacionData) => {

    const datosActualizar = {
        ...relacionData,
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
// ELIMINAR RELACIÓN
// ======================================================

const eliminarProyectoNecesidad = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

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
        .eq('IdProyecto', idProyecto);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER PROYECTOS POR NECESIDAD
// ======================================================

const obtenerProyectosPorNecesidad = async (idNecesidad) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdNecesidad', idNecesidad);

    if (error) {
        throw new Error(error.message);
    }

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