const supabase = require('../../config/supabase');

const TABLA = 'aplicantes_empleo';


// ======================================================
// OBTENER TODOS LOS APLICANTES
// ======================================================

const obtenerAplicantes = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER APLICANTE POR ID
// ======================================================

const obtenerAplicantePorId = async (id) => {

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
// CREAR APLICANTE
// ======================================================

const crearAplicante = async (aplicanteData) => {

    const nuevoAplicante = {
        IdUsuario: aplicanteData.IdUsuario,
        IdEmpleo: aplicanteData.IdEmpleo,
        Estado: aplicanteData.Estado || 'pendiente'
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoAplicante])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR APLICANTE
// ======================================================

const actualizarAplicante = async (id, aplicanteData) => {

    const datosActualizar = {
        ...aplicanteData,
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
// ELIMINAR APLICANTE
// ======================================================

const eliminarAplicante = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

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
        .eq('IdEmpleo', idEmpleo);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER APLICANTES POR USUARIO
// ======================================================

const obtenerAplicantesPorUsuario = async (idUsuario) => {

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