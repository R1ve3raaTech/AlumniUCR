const express = require('express');
const router = express.Router();
const voluntariosController = require('../controllers/voluntarios.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

// Envío público del formulario de la opción "Otros" del registro.
router.post('/', voluntariosController.crearSolicitud);

// Gestión por el administrador (requiere sesión + rol admin).
router.get('/', autenticarUsuario, exigirRol('admin'), voluntariosController.listarSolicitudes);
router.patch('/:id/accesos', autenticarUsuario, exigirRol('admin'), voluntariosController.actualizarAccesos);

module.exports = router;
