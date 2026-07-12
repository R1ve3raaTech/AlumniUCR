const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'habilidades_estudiante';


// ======================================================
// OBTENER TODAS LAS HABILIDADES
// ======================================================

const obtenerHabilidadesEstudiante = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER HABILIDAD POR ID
// ======================================================

const obtenerHabilidadPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR HABILIDAD
// ======================================================

const crearHabilidad = async (habilidadData) => {

    const nuevaHabilidad = {
        id_usuario: habilidadData.id_usuario,
        tecnicas: habilidadData.tecnicas,
        blandas: habilidadData.blandas,
        idiomas: habilidadData.idiomas
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaHabilidad])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR HABILIDAD
// ======================================================

const actualizarHabilidad = async (id, habilidadData) => {

    const datosActualizar = Object.assign({}, habilidadData, { updated_at: new Date() });

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
// ELIMINAR HABILIDAD
// ======================================================

const eliminarHabilidad = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Habilidad eliminada correctamente'
    };
};


// ======================================================
// OBTENER HABILIDADES POR USUARIO
// ======================================================

const obtenerHabilidadesPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario', idUsuario);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// BUSCAR HABILIDADES TÉCNICAS
// ======================================================

const buscarHabilidadesTecnicas = async (tecnica) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('tecnicas', `%${tecnica}%`);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// BUSCAR IDIOMAS
// ======================================================

const buscarIdiomas = async (idioma) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('idiomas', `%${idioma}%`);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerHabilidadesEstudiante,
    obtenerHabilidadPorId,
    crearHabilidad,
    actualizarHabilidad,
    eliminarHabilidad,
    obtenerHabilidadesPorUsuario,
    buscarHabilidadesTecnicas,
    buscarIdiomas
};
