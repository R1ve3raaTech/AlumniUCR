const supabase = require('../../config/supabase');

const TABLA = 'informacion_estudiante';


// ======================================================
// OBTENER TODA LA INFORMACIÓN DE ESTUDIANTES
// ======================================================

const obtenerInformacionEstudiantes = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER INFORMACIÓN POR ID USUARIO
// ======================================================

const obtenerInformacionPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdUsuario', idUsuario)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// CREAR INFORMACIÓN DE ESTUDIANTE
// ======================================================

const crearInformacionEstudiante = async (infoData) => {

    const nuevaInformacion = {
        IdUsuario: infoData.IdUsuario,
        Carne: infoData.Carne,
        AnoIngreso: infoData.AnoIngreso,
        IdNivelAcademico: infoData.IdNivelAcademico,
        PromedioPonderado: infoData.PromedioPonderado,
        IdBeca: infoData.IdBeca,
        BuscaFinanciamiento: infoData.BuscaFinanciamiento,
        BuscaMentoria: infoData.BuscaMentoria,
        BuscaEmpleo: infoData.BuscaEmpleo,
        BuscaPasantia: infoData.BuscaPasantia,
        Habilidades: infoData.Habilidades,
        PerfilCompleto: infoData.PerfilCompleto,
        Pausado: infoData.Pausado,
        CursosRelevantes: infoData.CursosRelevantes
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaInformacion])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR INFORMACIÓN DE ESTUDIANTE
// ======================================================

const actualizarInformacionEstudiante = async (idUsuario, infoData) => {

    const datosActualizar = {
        ...infoData,
        UpdatedAt: new Date()
    };

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('IdUsuario', idUsuario)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ELIMINAR INFORMACIÓN DE ESTUDIANTE
// ======================================================

const eliminarInformacionEstudiante = async (idUsuario) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('IdUsuario', idUsuario);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Información del estudiante eliminada correctamente'
    };
};


// ======================================================
// OBTENER ESTUDIANTES QUE BUSCAN EMPLEO
// ======================================================

const obtenerEstudiantesBuscanEmpleo = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('BuscaEmpleo', true);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER ESTUDIANTES QUE BUSCAN PASANTÍA
// ======================================================

const obtenerEstudiantesBuscanPasantia = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('BuscaPasantia', true);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER ESTUDIANTES QUE BUSCAN MENTORÍA
// ======================================================

const obtenerEstudiantesBuscanMentoria = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('BuscaMentoria', true);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerInformacionEstudiantes,
    obtenerInformacionPorUsuario,
    crearInformacionEstudiante,
    actualizarInformacionEstudiante,
    eliminarInformacionEstudiante,
    obtenerEstudiantesBuscanEmpleo,
    obtenerEstudiantesBuscanPasantia,
    obtenerEstudiantesBuscanMentoria
};