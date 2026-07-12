const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'responsabilidades_empleo';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerResponsabilidadesEmpleo = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerResponsabilidadEmpleoPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearResponsabilidadEmpleo = async (relacionData) => {

    const nuevaRelacion = {
        id_empleo: relacionData.id_empleo,
        id_responsabilidad: relacionData.id_responsabilidad
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaRelacion])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarResponsabilidadEmpleo = async (id, relacionData) => {

    const datosActualizar = Object.assign({}, relacionData, { updated_at: new Date() });

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
// ELIMINAR RELACIÓN
// ======================================================

const eliminarResponsabilidadEmpleo = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

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
        .eq('id_empleo', idEmpleo);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER EMPLEOS POR RESPONSABILIDAD
// ======================================================

const obtenerEmpleosPorResponsabilidad = async (idResponsabilidad) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_responsabilidad', idResponsabilidad);

    if (error) throw mapDbError(error);

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
