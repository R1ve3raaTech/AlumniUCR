const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ======================================================
// RUTAS DE CURRÍCULUMS (EJEMPLOS DE MIDDLEWARES)
// ======================================================

// Obtener currículum propio (Acceso para estudiantes y administradores)
router.get(
    '/mi-curriculum', 
    authMiddleware, 
    roleMiddleware(['estudiante', 'admin']), 
    (req, res) => {
        res.status(200).json({
            success: true,
            mensaje: 'Acceso concedido al currículum del estudiante.'
        });
    }
);

module.exports = router;
