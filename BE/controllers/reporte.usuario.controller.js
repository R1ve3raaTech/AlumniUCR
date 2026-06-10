const reporteUsuarioService = require('../services/reporteUsuarioService');

// ======================================================
// OBTENER TODOS LOS REPORTES
// ======================================================

const obtenerReportesUsuarios = async (req, res) => {
    try {
        const reportes =
            await reporteUsuarioService.obtenerReportesUsuarios();

        res.status(200).json(reportes);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los reportes',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER REPORTE POR ID
// ======================================================

const obtenerReportePorId = async (req, res) => {
    try {
        const { id } = req.params;

        const reporte =
            await reporteUsuarioService.obtenerReportePorId(id);

        res.status(200).json(reporte);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el reporte',
            error: error.message
        });
    }
};

// ======================================================
// CREAR REPORTE
// ======================================================

const crearReporteUsuario = async (req, res) => {
    try {
        const nuevoReporte =
            await reporteUsuarioService.crearReporteUsuario(req.body);

        res.status(201).json({
            mensaje: 'Reporte creado correctamente',
            data: nuevoReporte
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el reporte',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR REPORTE
// ======================================================

const actualizarReporteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const reporteActualizado =
            await reporteUsuarioService.actualizarReporteUsuario(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Reporte actualizado correctamente',
            data: reporteActualizado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar el reporte',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR REPORTE
// ======================================================

const eliminarReporteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await reporteUsuarioService.eliminarReporteUsuario(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el reporte',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER REPORTES POR USUARIO REPORTADO
// ======================================================

const obtenerReportesPorUsuarioReportado = async (req, res) => {
    try {
        const { idUsuarioReportado } = req.params;

        const reportes =
            await reporteUsuarioService.obtenerReportesPorUsuarioReportado(
                idUsuarioReportado
            );

        res.status(200).json(reportes);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los reportes del usuario reportado',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER REPORTES POR USUARIO EMISOR
// ======================================================

const obtenerReportesPorUsuarioEmisor = async (req, res) => {
    try {
        const { idUsuarioEmisor } = req.params;

        const reportes =
            await reporteUsuarioService.obtenerReportesPorUsuarioEmisor(
                idUsuarioEmisor
            );

        res.status(200).json(reportes);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los reportes del usuario emisor',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR REPORTES POR MOTIVO
// ======================================================

const buscarReportesPorMotivo = async (req, res) => {
    try {
        const { motivo } = req.params;

        const reportes =
            await reporteUsuarioService.buscarReportesPorMotivo(motivo);

        res.status(200).json(reportes);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar reportes por motivo',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
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