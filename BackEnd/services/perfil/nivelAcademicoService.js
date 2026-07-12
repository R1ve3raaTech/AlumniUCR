const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'nivel_academico';


// ======================================================
// OBTENER TODOS LOS NIVELES ACADÉMICOS
// ======================================================

const obtenerNivelesAcademicos = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// OBTENER NIVEL ACADÉMICO POR ID
// ======================================================

const obtenerNivelAcademicoPorId = async (id) => {

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
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerNivelesAcademicos,
    obtenerNivelAcademicoPorId
};
