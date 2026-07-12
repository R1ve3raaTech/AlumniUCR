const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'areas_interes_empleo';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerAreasInteresEmpleo = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerAreaInteresEmpleoPorId = async (id) => {

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

const crearAreaInteresEmpleo = async (dataRelacion) => {

    const nuevaRelacion = {
        id_empleo: dataRelacion.id_empleo,
        id_area_tematica: dataRelacion.id_area_tematica
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

const actualizarAreaInteresEmpleo = async (id, dataRelacion) => {

    const datosActualizar = Object.assign({}, dataRelacion, { updated_at: new Date() });

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

const eliminarAreaInteresEmpleo = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return { mensaje: 'Relación eliminada correctamente' };
};


// ======================================================
// OBTENER ÁREAS POR EMPLEO
// ======================================================

const obtenerAreasPorEmpleo = async (idEmpleo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_empleo', idEmpleo);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER EMPLEOS POR ÁREA TEMÁTICA
// ======================================================

const obtenerEmpleosPorArea = async (idAreaTematica) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_area_tematica', idAreaTematica);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerAreasInteresEmpleo,
    obtenerAreaInteresEmpleoPorId,
    crearAreaInteresEmpleo,
    actualizarAreaInteresEmpleo,
    eliminarAreaInteresEmpleo,
    obtenerAreasPorEmpleo,
    obtenerEmpleosPorArea,
};
