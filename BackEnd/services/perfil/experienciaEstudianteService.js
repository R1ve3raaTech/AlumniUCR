const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'experiencia_estudiante';


// ======================================================
// OBTENER TODAS LAS EXPERIENCIAS
// ======================================================

const obtenerExperienciasEstudiante = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER EXPERIENCIA POR ID
// ======================================================

const obtenerExperienciaPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR EXPERIENCIA
// ======================================================

const crearExperiencia = async (experienciaData) => {

    const nuevaExperiencia = {
        tipo: experienciaData.tipo,
        id_usuario: experienciaData.id_usuario,
        titulo: experienciaData.titulo,
        organizacion: experienciaData.organizacion,
        fecha_inicio: experienciaData.fecha_inicio,
        fecha_fin: experienciaData.fecha_fin,
        descripcion: experienciaData.descripcion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaExperiencia])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR EXPERIENCIA
// ======================================================

const actualizarExperiencia = async (id, experienciaData) => {

    const datosActualizar = Object.assign({}, experienciaData, { updated_at: new Date() });

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
// ELIMINAR EXPERIENCIA
// ======================================================

const eliminarExperiencia = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Experiencia eliminada correctamente'
    };
};


// ======================================================
// OBTENER EXPERIENCIAS POR USUARIO
// ======================================================

const obtenerExperienciasPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario', idUsuario);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER EXPERIENCIAS POR TIPO
// ======================================================

const obtenerExperienciasPorTipo = async (tipo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('tipo', tipo);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// BUSCAR EXPERIENCIAS POR ORGANIZACIÓN
// ======================================================

const buscarExperienciasPorOrganizacion = async (organizacion) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('organizacion', `%${organizacion}%`);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerExperienciasEstudiante,
    obtenerExperienciaPorId,
    crearExperiencia,
    actualizarExperiencia,
    eliminarExperiencia,
    obtenerExperienciasPorUsuario,
    obtenerExperienciasPorTipo,
    buscarExperienciasPorOrganizacion
};
