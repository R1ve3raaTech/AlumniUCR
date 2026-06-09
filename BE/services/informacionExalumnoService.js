const supabase = require('../config/supabase');

const TABLA = 'informacion_exalumno';


// ======================================================
// OBTENER TODA LA INFORMACIÓN DE EXALUMNOS
// ======================================================

const obtenerInformacionExalumnos = async () => {

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

const obtenerInformacionExalumnoPorUsuario = async (idUsuario) => {

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
// CREAR INFORMACIÓN DE EXALUMNO
// ======================================================

const crearInformacionExalumno = async (infoData) => {

    const nuevaInformacion = {
        IdUsuario: infoData.IdUsuario,
        FotoPerfil: infoData.FotoPerfil,
        Pais: infoData.Pais,
        Ciudad: infoData.Ciudad,
        URLLinkedIn: infoData.URLLinkedIn,
        Biografia: infoData.Biografia,
        Empresa: infoData.Empresa,
        Cargo: infoData.Cargo,
        AnosExperiencia: infoData.AnosExperiencia,
        OfreceMentoria: infoData.OfreceMentoria,
        HorasDisponiblesMes: infoData.HorasDisponiblesMes,
        OfreceEmpleo: infoData.OfreceEmpleo,
        OfrecePasantia: infoData.OfrecePasantia,
        OfreceColaboracion: infoData.OfreceColaboracion,
        OfreceDonacion: infoData.OfreceDonacion,
        Estado: infoData.Estado,
        MontoMaximoDonacion: infoData.MontoMaximoDonacion,
        Moneda: infoData.Moneda
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
// ACTUALIZAR INFORMACIÓN DE EXALUMNO
// ======================================================

const actualizarInformacionExalumno = async (idUsuario, infoData) => {

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
// ELIMINAR INFORMACIÓN DE EXALUMNO
// ======================================================

const eliminarInformacionExalumno = async (idUsuario) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('IdUsuario', idUsuario);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Información del exalumno eliminada correctamente'
    };
};


// ======================================================
// OBTENER EXALUMNOS QUE OFRECEN MENTORÍA
// ======================================================

const obtenerExalumnosMentores = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('OfreceMentoria', true);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER EXALUMNOS QUE OFRECEN EMPLEO
// ======================================================

const obtenerExalumnosOfrecenEmpleo = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('OfreceEmpleo', true);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER EXALUMNOS QUE OFRECEN PASANTÍAS
// ======================================================

const obtenerExalumnosOfrecenPasantia = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('OfrecePasantia', true);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER EXALUMNOS QUE OFRECEN DONACIONES
// ======================================================

const obtenerExalumnosOfrecenDonacion = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('OfreceDonacion', true);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerInformacionExalumnos,
    obtenerInformacionExalumnoPorUsuario,
    crearInformacionExalumno,
    actualizarInformacionExalumno,
    eliminarInformacionExalumno,
    obtenerExalumnosMentores,
    obtenerExalumnosOfrecenEmpleo,
    obtenerExalumnosOfrecenPasantia,
    obtenerExalumnosOfrecenDonacion
};