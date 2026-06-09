const supabase = require('../config/supabase');

const TABLA = 'reportes_usuarios';


// ======================================================
// OBTENER TODOS LOS REPORTES
// ======================================================

const obtenerReportesUsuarios = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER REPORTE POR ID
// ======================================================

const obtenerReportePorId = async (id) => {

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
// CREAR REPORTE
// ======================================================

const crearReporteUsuario = async (reporteData) => {

    const nuevoReporte = {
        IdUsuarioReportado: reporteData.IdUsuarioReportado,
        IdUsuarioEmisor: reporteData.IdUsuarioEmisor,
        Motivo: reporteData.Motivo,
        Descripcion: reporteData.Descripcion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoReporte])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR REPORTE
// ======================================================

const actualizarReporteUsuario = async (id, reporteData) => {

    const datosActualizar = {
        ...reporteData,
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
// ELIMINAR REPORTE
// ======================================================

const eliminarReporteUsuario = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

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
        .eq('IdUsuarioReportado', idUsuarioReportado);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER REPORTES POR USUARIO EMISOR
// ======================================================

const obtenerReportesPorUsuarioEmisor = async (idUsuarioEmisor) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdUsuarioEmisor', idUsuarioEmisor);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// BUSCAR REPORTES POR MOTIVO
// ======================================================

const buscarReportesPorMotivo = async (motivo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('Motivo', `%${motivo}%`);

    if (error) {
        throw new Error(error.message);
    }

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