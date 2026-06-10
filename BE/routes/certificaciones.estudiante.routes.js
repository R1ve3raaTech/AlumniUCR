const express = require('express');
const router = express.Router();
const certificacionesController = require('../controllers/certificaciones.estudiante.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), certificacionesController.buscarCertificacionesPorNombre);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), certificacionesController.obtenerCertificacionesPorUsuario);
router.get('/', autenticarUsuario, exigirRol('admin'), certificacionesController.obtenerCertificacionesEstudiante);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), certificacionesController.obtenerCertificacionPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante']), certificacionesController.crearCertificacion);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), certificacionesController.actualizarCertificacion);
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), certificacionesController.eliminarCertificacion);

module.exports = router;
