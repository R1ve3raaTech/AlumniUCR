// Controlador del Matching Interdisciplinario (solo administrador).

const matchingService = require('../../services/matching/matching.service');

const obtenerMatching = async (req, res, next) => {
  try {
    const data = await matchingService.obtenerMatching();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerMatching };
