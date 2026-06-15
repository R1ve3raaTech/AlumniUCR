const supabase = require('../config/supabase');

const TABLA = 'proyecto_graduacion';


// ======================================================
// OBTENER TODOS LOS PROYECTOS
// ======================================================

const obtenerProyectosGraduacion = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER PROYECTO POR ID
// ======================================================

const obtenerProyectoGraduacionPorId = async (id) => {

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
// CREAR PROYECTO
// ======================================================

const crearProyectoGraduacion = async (proyectoData) => {

    const nuevoProyecto = {
        IdUsuario: proyectoData.IdUsuario,
        TituloProyecto: proyectoData.TituloProyecto,
        Descripcion: proyectoData.Descripcion,
        IdTipoProyecto: proyectoData.IdTipoProyecto,
        AreaTematica: proyectoData.AreaTematica,
        PorcentajeAvance: proyectoData.PorcentajeAvance,
        ProyectoFinalizado: proyectoData.ProyectoFinalizado
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoProyecto])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR PROYECTO
// ======================================================

const actualizarProyectoGraduacion = async (id, proyectoData) => {

    const datosActualizar = {
        ...proyectoData,
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
// ELIMINAR PROYECTO
// ======================================================

const eliminarProyectoGraduacion = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

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
        .eq('IdUsuario', idUsuario);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER PROYECTOS FINALIZADOS
// ======================================================

const obtenerProyectosFinalizados = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('ProyectoFinalizado', true);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// BUSCAR PROYECTOS POR ÁREA TEMÁTICA
// ======================================================

const buscarProyectosPorArea = async (areaTematica) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('AreaTematica', `%${areaTematica}%`);

    if (error) {
        throw new Error(error.message);
    }

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