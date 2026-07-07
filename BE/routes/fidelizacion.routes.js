const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fidelizacion.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

// Obtener legado (timeline, insignias, ciclo de vida, árbol, portafolio)
router.get('/mi-legado', autenticarUsuario, exigirRol(['exalumno', 'admin']), ctrl.obtenerLegado);

// Obtener rankings globales (desafíos filantrópicos por generación/facultad)
router.get('/leaderboards', autenticarUsuario, exigirRol(['exalumno', 'admin']), ctrl.obtenerLeaderboards);

module.exports = router;
