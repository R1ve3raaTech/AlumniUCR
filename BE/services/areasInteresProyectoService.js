const supabase = require('../config/supabase');

const TABLA = 'areas_interes_proyecto';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerAreasInteresProyecto = async () => {

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

const obtenerAreaInteresProyectoPorId = async (id) => {

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

const crearAreaInteresProyecto = async (dataRelacion) => {

    const nuevaRelacion = {
        IdProyecto: dataRelacion.IdProyecto,
        IdAreaTematica: dataRelacion.IdAreaTematica
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

const actualizarAreaInteresProyecto = async (id, dataRelacion) => {

    const datosActualizar = {
        ...dataRelacion,
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

const eliminarAreaInteresProyecto = async (id) => {

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
// OBTENER ÁREAS POR PROYECTO
// ======================================================

const obtenerAreasPorProyecto = async (idProyecto) => {

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
// OBTENER PROYECTOS POR ÁREA TEMÁTICA
// ======================================================

const obtenerProyectosPorArea = async (idAreaTematica) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdAreaTematica', idAreaTematica);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerAreasInteresProyecto,
    obtenerAreaInteresProyectoPorId,
    crearAreaInteresProyecto,
    actualizarAreaInteresProyecto,
    eliminarAreaInteresProyecto,
    obtenerAreasPorProyecto,
    obtenerProyectosPorArea
};