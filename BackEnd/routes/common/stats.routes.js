// Estadísticas públicas del landing — sin autenticación.

const express = require('express');
const router = express.Router();
const statsController = require('../../controllers/common/stats.controller');

// GET /api/stats/publicas
router.get('/publicas', statsController.obtenerEstadisticasPublicas);

module.exports = router;
