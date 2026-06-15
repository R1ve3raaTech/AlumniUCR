const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'areas_interes_exalumno';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerAreasInteresExalumno = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw mapDbError(error);
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
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearAreaInteresExalumno = async (dataRelacion) => {

    const nuevaRelacion = {
        id_exalumno: dataRelacion.id_exalumno,
        id_area_tematica: dataRelacion.id_area_tematica
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaRelacion])
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarAreaInteresExalumno = async (id, dataRelacion) => {

    const datosActualizar = Object.assign({}, dataRelacion, { updated_at: new Date() });

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
// ELIMINAR RELACIÓN
// ======================================================

const eliminarAreaInteresExalumno = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) {
        throw mapDbError(error);
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
        .eq('id_exalumno', idExalumno);

    if (error) {
        throw mapDbError(error);
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
        .eq('id_area_tematica', idAreaTematica);

    if (error) {
        throw mapDbError(error);
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
