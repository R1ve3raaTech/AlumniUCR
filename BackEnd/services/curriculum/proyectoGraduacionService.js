const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');
// RF-03: guardar el proyecto puede completar (o invalidar) el perfil del estudiante.
const { recalcularPerfilCompleto } = require('../perfil/informacionEstudianteService');

const TABLA = 'proyecto_graduacion';


// ======================================================
// OBTENER TODOS LOS PROYECTOS
// ======================================================

const obtenerProyectosGraduacion = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER PROYECTO POR ID
// ======================================================

const obtenerProyectoGraduacionPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR PROYECTO
// ======================================================

const crearProyectoGraduacion = async (proyectoData) => {

    const nuevoProyecto = {
        id_estudiante: proyectoData.id_estudiante,
        titulo_proyecto: proyectoData.titulo_proyecto,
        descripcion: proyectoData.descripcion,
        id_tipo_proyecto: proyectoData.id_tipo_proyecto,
        porcentaje_avance: proyectoData.porcentaje_avance,
        proyecto_finalizado: proyectoData.proyecto_finalizado
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoProyecto])
        .select()
        .single();

    if (error) throw mapDbError(error);

    await recalcularPerfilCompleto(proyectoData.id_estudiante).catch(() => {});

    return data;
};


// ======================================================
// ACTUALIZAR PROYECTO
// ======================================================

const actualizarProyectoGraduacion = async (id, proyectoData) => {

    const datosActualizar = Object.assign({}, proyectoData, { updated_at: new Date() });

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    if (data?.id_estudiante) await recalcularPerfilCompleto(data.id_estudiante).catch(() => {});

    return data;
};


// ======================================================
// ELIMINAR PROYECTO
// ======================================================

const eliminarProyectoGraduacion = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Proyecto de graduación eliminado correctamente'
    };
};


// ======================================================
// OBTENER PROYECTOS POR USUARIO
// ======================================================

const obtenerProyectosPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_estudiante', idUsuario);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER PROYECTOS FINALIZADOS
// ======================================================

const obtenerProyectosFinalizados = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('proyecto_finalizado', true);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// BUSCAR PROYECTOS POR ÁREA TEMÁTICA
// ======================================================

const buscarProyectosPorArea = async (areaTematica) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*, areas_interes_proyecto!inner(id_area_tematica)')
        .eq('areas_interes_proyecto.id_area_tematica', areaTematica);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerProyectosGraduacion,
    obtenerProyectoGraduacionPorId,
    crearProyectoGraduacion,
    actualizarProyectoGraduacion,
    eliminarProyectoGraduacion,
    obtenerProyectosPorUsuario,
    obtenerProyectosFinalizados,
    buscarProyectosPorArea
};
