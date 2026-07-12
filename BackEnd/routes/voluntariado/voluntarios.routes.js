const express = require('express');
const router = express.Router();
const voluntariosController = require('../../controllers/voluntariado/voluntarios.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

// Envío público del formulario de la opción "Otros" del registro.
router.post('/', voluntariosController.crearSolicitud);

// El propio voluntario consulta sus accesos otorgados (para su dashboard).
router.get('/mis-accesos', autenticarUsuario, exigirRol('voluntario'), voluntariosController.misAccesos);
// El propio voluntario edita su modalidad, disponibilidad y biografía.
router.put('/mi-perfil', autenticarUsuario, exigirRol('voluntario'), voluntariosController.actualizarMiPerfil);

// Gestión por el administrador (requiere sesión + rol admin).
router.get('/', autenticarUsuario, exigirRol('admin'), voluntariosController.listarSolicitudes);
router.patch('/:id/accesos', autenticarUsuario, exigirRol('admin'), voluntariosController.actualizarAccesos);

module.exports = router;
