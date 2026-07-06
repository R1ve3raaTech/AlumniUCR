const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'informacion_estudiante';


// ======================================================
// OBTENER TODA LA INFORMACIÓN DE ESTUDIANTES
// ======================================================

const obtenerInformacionEstudiantes = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER INFORMACIÓN POR ID USUARIO
// ======================================================

const obtenerInformacionPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario', idUsuario)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// RECALCULAR PERFIL COMPLETO (RF-03)
// El flag lo decide el backend a partir del estado real de la base, no el
// frontend. Requisitos: información académica (carné, año de ingreso, nivel,
// al menos un tipo de apoyo buscado), al menos una carrera registrada y un
// proyecto de graduación con mínimo un área de interés.
// ======================================================

const recalcularPerfilCompleto = async (idUsuario) => {
    const [infoRes, carrerasRes, proyectoRes] = await Promise.all([
        supabase.from(TABLA)
            .select('carne, ano_ingreso, id_nivel_academico, busca_financiamiento, busca_mentoria, busca_empleo, busca_pasantia, perfil_completo')
            .eq('id_usuario', idUsuario)
            .maybeSingle(),
        supabase.from('carreras_usuario')
            .select('id_carrera')
            .eq('id_usuario', idUsuario)
            .limit(1),
        supabase.from('proyecto_graduacion')
            .select('id')
            .eq('id_estudiante', idUsuario)
            .maybeSingle(),
    ]);

    const info = infoRes.data;
    if (!info) return false;

    let areasProyecto = 0;
    if (proyectoRes.data) {
        const { count } = await supabase
            .from('areas_interes_proyecto')
            .select('*', { count: 'exact', head: true })
            .eq('id_proyecto', proyectoRes.data.id);
        areasProyecto = count || 0;
    }

    const completo = Boolean(
        info.carne &&
        info.ano_ingreso &&
        info.id_nivel_academico &&
        (info.busca_financiamiento || info.busca_mentoria || info.busca_empleo || info.busca_pasantia) &&
        (carrerasRes.data || []).length > 0 &&
        proyectoRes.data &&
        areasProyecto > 0,
    );

    if (completo !== info.perfil_completo) {
        await supabase.from(TABLA).update({ perfil_completo: completo }).eq('id_usuario', idUsuario);
    }
    return completo;
};


// ======================================================
// CREAR INFORMACIÓN DE ESTUDIANTE
// ======================================================

const crearInformacionEstudiante = async (infoData) => {

    const nuevaInformacion = {
        id_usuario: infoData.id_usuario,
        carne: infoData.carne,
        ano_ingreso: infoData.ano_ingreso,
        id_nivel_academico: infoData.id_nivel_academico,
        promedio_ponderado: infoData.promedio_ponderado,
        id_beca: infoData.id_beca,
        busca_financiamiento: infoData.busca_financiamiento,
        busca_mentoria: infoData.busca_mentoria,
        busca_empleo: infoData.busca_empleo,
        busca_pasantia: infoData.busca_pasantia,
        habilidades: infoData.habilidades,
        perfil_completo: infoData.perfil_completo,
        pausado: infoData.pausado,
        cursos_relevantes: infoData.cursos_relevantes
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaInformacion])
        .select()
        .single();

    if (error) throw mapDbError(error);

    // RF-03: el backend decide el flag según el estado real del perfil.
    await recalcularPerfilCompleto(infoData.id_usuario).catch(() => {});

    return data;
};


// ======================================================
// ACTUALIZAR INFORMACIÓN DE ESTUDIANTE
// ======================================================

const actualizarInformacionEstudiante = async (idUsuario, infoData) => {

    const datosActualizar = Object.assign({}, infoData, { updated_at: new Date() });

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('id_usuario', idUsuario)
        .select()
        .single();

    if (error) throw mapDbError(error);

    // RF-03: el backend decide el flag según el estado real del perfil.
    await recalcularPerfilCompleto(idUsuario).catch(() => {});

    return data;
};


// ======================================================
// ELIMINAR INFORMACIÓN DE ESTUDIANTE
// ======================================================

const eliminarInformacionEstudiante = async (idUsuario) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id_usuario', idUsuario);

    if (error) throw mapDbError(error);

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
        .eq('busca_empleo', true);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER ESTUDIANTES QUE BUSCAN PASANTÍA
// ======================================================

const obtenerEstudiantesBuscanPasantia = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('busca_pasantia', true);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER ESTUDIANTES QUE BUSCAN MENTORÍA
// ======================================================

const obtenerEstudiantesBuscanMentoria = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('busca_mentoria', true);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER ESTUDIANTES PARA EL DIRECTORIO (RF-05)
// Solo perfiles 100% completos y no pausados.
// ⚠️ NO incluir id_beca ni promedio_ponderado (RF-03: "NUNCA visible").
// ======================================================
const obtenerEstudiantesDirectorio = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('id_usuario, carne, ano_ingreso, id_nivel_academico, busca_financiamiento, busca_mentoria, busca_empleo, busca_pasantia, habilidades, cursos_relevantes')
        .eq('perfil_completo', true)
        .eq('pausado', false);

    if (error) throw mapDbError(error);

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
    recalcularPerfilCompleto,
    obtenerEstudiantesBuscanEmpleo,
    obtenerEstudiantesBuscanPasantia,
    obtenerEstudiantesBuscanMentoria,
    obtenerEstudiantesDirectorio
};