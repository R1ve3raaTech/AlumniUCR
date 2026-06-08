const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rutas separadas por tipo de usuario
// El rol queda implícito en el endpoint, no en el body
router.post('/register/estudiante', authController.registerEstudiante);
router.post('/register/exalumno', authController.registerExalumno);
router.post('/login', authController.login);

module.exports = router;