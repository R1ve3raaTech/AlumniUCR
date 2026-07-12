// Controlador de Fidelización y Gamificación
const servicio = require('../../services/fidelizacion/fidelizacion.service');

const obtenerLegado = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await servicio.obtenerLegadoExalumno(userId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const obtenerLeaderboards = async (req, res, next) => {
    try {
        const data = await servicio.obtenerLeaderboards();
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerLegado,
    obtenerLeaderboards
};
