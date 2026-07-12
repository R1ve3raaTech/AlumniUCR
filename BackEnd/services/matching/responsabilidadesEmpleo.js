const supabase = require('../../config/supabase');

const TABLA = 'responsabilidades_empleo';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerResponsabilidadesEmpleo = async () => {

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

const obtenerResponsabilidadEmpleoPorId = async (id) => {

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

const crearResponsabilidadEmpleo = async (relacionData) => {

    const nuevaRelacion = {
        IdEmpleo: relacionData.IdEmpleo,
        IdResponsabilidad: relacionData.IdResponsabilidad
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

const actualizarResponsabilidadEmpleo = async (id, relacionData) => {

    const datosActualizar = {
        ...relacionData,
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

const eliminarResponsabilidadEmpleo = async (id) => {

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
// OBTENER RESPONSABILIDADES POR EMPLEO
// ======================================================

const obtenerResponsabilidadesPorEmpleo = async (idEmpleo) => {

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
// OBTENER EMPLEOS POR RESPONSABILIDAD
// ======================================================

const obtenerEmpleosPorResponsabilidad = async (idResponsabilidad) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdResponsabilidad', idResponsabilidad);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerResponsabilidadesEmpleo,
    obtenerResponsabilidadEmpleoPorId,
    crearResponsabilidadEmpleo,
    actualizarResponsabilidadEmpleo,
    eliminarResponsabilidadEmpleo,
    obtenerResponsabilidadesPorEmpleo,
    obtenerEmpleosPorResponsabilidad
};