const supabase = require('../config/supabase');

const TABLA = 'areas_interes_exalumno';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerAreasInteresExalumno = async () => {

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

const obtenerAreaInteresExalumnoPorId = async (id) => {

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

const crearAreaInteresExalumno = async (dataRelacion) => {

    const nuevaRelacion = {
        IdExalumno: dataRelacion.IdExalumno,
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

const actualizarAreaInteresExalumno = async (id, dataRelacion) => {

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

const eliminarAreaInteresExalumno = async (id) => {

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
// OBTENER ÁREAS POR EXALUMNO
// ======================================================

const obtenerAreasPorExalumno = async (idExalumno) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdExalumno', idExalumno);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER EXALUMNOS POR ÁREA TEMÁTICA
// ======================================================

const obtenerExalumnosPorArea = async (idAreaTematica) => {

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
    obtenerAreasInteresExalumno,
    obtenerAreaInteresExalumnoPorId,
    crearAreaInteresExalumno,
    actualizarAreaInteresExalumno,
    eliminarAreaInteresExalumno,
    obtenerAreasPorExalumno,
    obtenerExalumnosPorArea
};