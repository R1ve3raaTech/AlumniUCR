const express = require('express');
const router = express.Router();

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
