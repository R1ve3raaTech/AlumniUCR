const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'informacion_exalumno';


// ======================================================
// OBTENER TODA LA INFORMACIÓN DE EXALUMNOS
// ======================================================

const obtenerInformacionExalumnos = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER INFORMACIÓN POR ID USUARIO
// ======================================================

const obtenerInformacionExalumnoPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario', idUsuario)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR INFORMACIÓN DE EXALUMNO
// ======================================================

const crearInformacionExalumno = async (infoData) => {

    const nuevaInformacion = {
        id_usuario: infoData.id_usuario,
        foto_perfil: infoData.foto_perfil,
        pais: infoData.pais,
        ciudad: infoData.ciudad,
        url_linkedin: infoData.url_linkedin,
        biografia: infoData.biografia,
        empresa: infoData.empresa,
        cargo: infoData.cargo,
        anos_experiencia: infoData.anos_experiencia,
        ofrece_mentoria: infoData.ofrece_mentoria,
        horas_disponibles_mes: infoData.horas_disponibles_mes,
        ofrece_empleo: infoData.ofrece_empleo,
        ofrece_pasantia: infoData.ofrece_pasantia,
        ofrece_colaboracion: infoData.ofrece_colaboracion,
        ofrece_donacion: infoData.ofrece_donacion,
        estado: infoData.estado,
        monto_maximo_donacion: infoData.monto_maximo_donacion,
        moneda: infoData.moneda
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaInformacion])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR INFORMACIÓN DE EXALUMNO
// ======================================================

const actualizarInformacionExalumno = async (idUsuario, infoData) => {

    const datosActualizar = Object.assign({}, infoData, { updated_at: new Date() });

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('id_usuario', idUsuario)
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ELIMINAR INFORMACIÓN DE EXALUMNO
// ======================================================

const eliminarInformacionExalumno = async (idUsuario) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id_usuario', idUsuario);

    if (error) throw mapDbError(error);

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
        .eq('ofrece_mentoria', true);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER EXALUMNOS QUE OFRECEN EMPLEO
// ======================================================

const obtenerExalumnosOfrecenEmpleo = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('ofrece_empleo', true);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER EXALUMNOS QUE OFRECEN PASANTÍAS
// ======================================================

const obtenerExalumnosOfrecenPasantia = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('ofrece_pasantia', true);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER EXALUMNOS QUE OFRECEN DONACIONES
// ======================================================

const obtenerExalumnosOfrecenDonacion = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('ofrece_donacion', true);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER EXALUMNOS PARA EL DIRECTORIO (RF-04)
// Solo perfiles con estado = true (= "perfil_completo", ver nota
// en informacion.exalumno.controller.js).
// ⚠️ NO incluir monto_maximo_donacion ni moneda (RF-02: visible
// solo para el propio exalumno y el admin).
// ======================================================
const obtenerExalumnosDirectorio = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('id_usuario, foto_perfil, pais, ciudad, url_linkedin, biografia, empresa, cargo, anos_experiencia, ofrece_mentoria, horas_disponibles_mes, ofrece_empleo, ofrece_pasantia, ofrece_colaboracion, ofrece_donacion')
        .eq('estado', true);

    if (error) throw mapDbError(error);

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
    obtenerExalumnosOfrecenDonacion,
    obtenerExalumnosDirectorio
};