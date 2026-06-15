const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'aplicantes_empleo';


// ======================================================
// OBTENER TODOS LOS APLICANTES
// ======================================================

const obtenerAplicantes = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER APLICANTE POR ID
// ======================================================

const obtenerAplicantePorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR APLICANTE
// ======================================================

const crearAplicante = async (aplicanteData) => {

    const nuevoAplicante = {
        idusuario: aplicanteData.IdUsuario,
        idempleo: aplicanteData.IdEmpleo,
        estado: aplicanteData.Estado || 'pendiente'
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoAplicante])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR APLICANTE
// ======================================================

const actualizarAplicante = async (id, aplicanteData) => {

    const datosActualizar = Object.assign({}, aplicanteData, { updated_at: new Date() });

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
// ELIMINAR APLICANTE
// ======================================================

const eliminarAplicante = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Aplicante eliminado correctamente'
    };
};


// ======================================================
// OBTENER APLICANTES POR EMPLEO
// ======================================================

const obtenerAplicantesPorEmpleo = async (idEmpleo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_empleo', idEmpleo);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER APLICANTES POR USUARIO
// ======================================================

const obtenerAplicantesPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario', idUsuario);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR TODOS LOS SERVICES
// ======================================================

module.exports = {
    obtenerAplicantes,
    obtenerAplicantePorId,
    crearAplicante,
    actualizarAplicante,
    eliminarAplicante,
    obtenerAplicantesPorEmpleo,
    obtenerAplicantesPorUsuario
};
