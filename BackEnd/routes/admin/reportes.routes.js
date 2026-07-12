// Rutas de reportes (denuncias / quejas / sugerencias).
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/reportes.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

// El estudiante (con sesión) crea un reporte y ve su historial.
router.post('/', autenticarUsuario, controller.crearReporte);
router.get('/mios', autenticarUsuario, controller.misReportes);

// El administrador gestiona todos los reportes (conexión al panel admin).
router.get('/', autenticarUsuario, exigirRol('admin'), controller.listarReportes);
router.patch('/:id', autenticarUsuario, exigirRol('admin'), controller.actualizarReporte);

module.exports = router;
