const statsService = require('../services/stats.service');

const obtenerEstadisticasPublicas = async (req, res, next) => {
    try {
        const stats = await statsService.obtenerEstadisticasPublicas();
        res.status(200).json({
            success: true,
            data: stats,
            message: 'Estadísticas públicas obtenidas correctamente',
        });
    } catch (error) { next(error); }
};

module.exports = { obtenerEstadisticasPublicas };
