const express = require('express');
const router = express.Router();
const matchingController = require('../../controllers/matching/matching.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

// Matching interdisciplinario (solo administrador).
router.get('/', autenticarUsuario, exigirRol('admin'), matchingController.obtenerMatching);

module.exports = router;
