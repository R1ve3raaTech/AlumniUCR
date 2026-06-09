const express = require('express');
const router = express.Router();
<<<<<<< HEAD

// ======================================================
// RUTAS DE AUTENTICACIÓN (ESQUELETO INICIAL)
// ======================================================

// Login de usuario
router.post('/login', (req, res) => {
    res.status(200).json({
        success: true,
        mensaje: 'Ruta de inicio de sesión configurada.'
    });
});

module.exports = router;
=======
const authController = require('../controllers/auth.controller');

// Rutas separadas por tipo de usuario
// El rol queda implícito en el endpoint, no en el body
router.post('/register/estudiante', authController.registerEstudiante);
router.post('/register/exalumno', authController.registerExalumno);
router.post('/login', authController.login);

module.exports = router;
>>>>>>> 44b165e2569b85063492ede8c6ac7eb7fc71c82f
