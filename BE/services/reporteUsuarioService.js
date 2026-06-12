const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'reportes_usuarios';


// ======================================================
// OBTENER TODOS LOS REPORTES
// ======================================================

const obtenerReportesUsuarios = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER REPORTE POR ID
// ======================================================

const obtenerReportePorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR REPORTE
// ======================================================

const crearReporteUsuario = async (reporteData) => {

    const nuevoReporte = {
        id_usuario_reportado: reporteData.id_usuario_reportado,
        id_usuario_emisor: reporteData.id_usuario_emisor,
        motivo: reporteData.motivo,
        descripcion: reporteData.descripcion
    };

    if (reporteData.resuelto !== undefined) {
        nuevoReporte.resuelto = reporteData.resuelto;
    }

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoReporte])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR REPORTE
// ======================================================

const actualizarReporteUsuario = async (id, reporteData) => {

    const datosActualizar = Object.assign({}, reporteData, { updated_at: new Date() });

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
// ELIMINAR REPORTE
// ======================================================

const eliminarReporteUsuario = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Reporte eliminado correctamente'
    };
};


// ======================================================
// OBTENER REPORTES POR USUARIO REPORTADO
// ======================================================

const obtenerReportesPorUsuarioReportado = async (idUsuarioReportado) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario_reportado', idUsuarioReportado);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER REPORTES POR USUARIO EMISOR
// ======================================================

const obtenerReportesPorUsuarioEmisor = async (idUsuarioEmisor) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario_emisor', idUsuarioEmisor);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// BUSCAR REPORTES POR MOTIVO
// ======================================================

const buscarReportesPorMotivo = async (motivo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('motivo', `%${motivo}%`);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerReportesUsuarios,
    obtenerReportePorId,
    crearReporteUsuario,
    actualizarReporteUsuario,
    eliminarReporteUsuario,
    obtenerReportesPorUsuarioReportado,
    obtenerReportesPorUsuarioEmisor,
    buscarReportesPorMotivo
};
