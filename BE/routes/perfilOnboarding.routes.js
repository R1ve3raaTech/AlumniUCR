// Rutas del perfil de onboarding del estudiante (fuente única).
// Requieren sesión; el usuario se identifica por su token.

const express = require('express');
const router = express.Router();
const controller = require('../controllers/perfilOnboarding.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');

router.get('/', autenticarUsuario, controller.obtener);
router.put('/', autenticarUsuario, controller.guardar);

module.exports = router;
