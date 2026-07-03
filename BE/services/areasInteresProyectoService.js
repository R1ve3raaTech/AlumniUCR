const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'areas_interes_proyecto';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerAreasInteresProyecto = async () => {

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

const obtenerAreaInteresProyectoPorId = async (id) => {

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

const crearAreaInteresProyecto = async (dataRelacion) => {

    const nuevaRelacion = {
        id_proyecto: dataRelacion.id_proyecto,
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

    // RF-03: la primera área del proyecto puede completar el perfil del estudiante.
    const { data: proy } = await supabase
        .from('proyecto_graduacion')
        .select('id_estudiante')
        .eq('id', dataRelacion.id_proyecto)
        .maybeSingle();
    if (proy?.id_estudiante) {
        const { recalcularPerfilCompleto } = require('./informacionEstudianteService');
        await recalcularPerfilCompleto(proy.id_estudiante).catch(() => {});
    }

    return data;
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarAreaInteresProyecto = async (id, dataRelacion) => {

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

const eliminarAreaInteresProyecto = async (id) => {

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
// OBTENER ÁREAS POR PROYECTO
// ======================================================

const obtenerAreasPorProyecto = async (idProyecto) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_proyecto', idProyecto);

    if (error) {
        throw mapDbError(error);
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
    obtenerAreasInteresProyecto,
    obtenerAreaInteresProyectoPorId,
    crearAreaInteresProyecto,
    actualizarAreaInteresProyecto,
    eliminarAreaInteresProyecto,
    obtenerAreasPorProyecto,
    obtenerProyectosPorArea
};
