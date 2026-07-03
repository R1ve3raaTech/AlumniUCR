// Controlador del Panel de Administración (RF-08).

const adminService = require('../services/admin.service');


// ======================================================
// RF-08.1 — GET MATCHES (con alerta > 6 meses)
// ======================================================

const obtenerMatchesAdmin = async (req, res, next) => {
    try {
        const filtros = {};
        if (req.query.estado) filtros.estado = req.query.estado;
        if (req.query.fecha_desde) filtros.fecha_desde = req.query.fecha_desde;
        if (req.query.fecha_hasta) filtros.fecha_hasta = req.query.fecha_hasta;

        const matches = await adminService.obtenerMatchesConAlerta(filtros);

        res.status(200).json({
            success: true,
            data: matches,
            message: 'Matches obtenidos correctamente'
        });
    } catch (error) { next(error); }
};


// ======================================================
// RF-08.2 — GET DONACIONES PENDIENTES (con alerta 24h)
// ======================================================

const obtenerDonacionesPendientes = async (req, res, next) => {
    try {
        const donaciones = await adminService.obtenerDonacionesPendientes();
        res.status(200).json({
            success: true,
            data: donaciones,
            message: 'Donaciones pendientes obtenidas correctamente'
        });
    } catch (error) { next(error); }
};


// ======================================================
// RF-08.2 — POST ENVIAR RECORDATORIOS (donaciones > 24h)
// ======================================================

const enviarRecordatorioDonaciones = async (req, res, next) => {
    try {
        const resultado = await adminService.enviarRecordatorioDonacionesPendientes();
        res.status(200).json({
            success: true,
            data: resultado,
            message: `${resultado.recordatorios} recordatorio(s) enviado(s) de ${resultado.total_vencidas} donación(es) vencidas`
        });
    } catch (error) { next(error); }
};


// ======================================================
// RF-08.3 — GET DASHBOARD DE IMPACTO
// ======================================================

const obtenerDashboard = async (req, res, next) => {
    try {
        const dashboard = await adminService.obtenerDashboard();
        res.status(200).json({
            success: true,
            data: dashboard,
            message: 'Dashboard obtenido correctamente'
        });
    } catch (error) { next(error); }
};


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {
    obtenerMatchesAdmin,
    obtenerDonacionesPendientes,
    enviarRecordatorioDonaciones,
    obtenerDashboard,
};
