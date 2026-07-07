const express = require('express');
const router = express.Router();
const donacionesController = require('../controllers/donaciones.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/', autenticarUsuario, exigirRol('admin'), donacionesController.obtenerDonaciones);
router.get('/estado/:estado', autenticarUsuario, exigirRol('admin'), donacionesController.obtenerDonacionesPorEstado);
router.get('/usuario/:idUsuarioExalumno', autenticarUsuario, exigirRol(['admin', 'exalumno', 'voluntario']), donacionesController.obtenerDonacionesPorUsuario);
router.get('/proyecto/:idProyecto', autenticarUsuario, exigirRol(['admin', 'estudiante']), donacionesController.obtenerDonacionesPorProyecto);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno', 'voluntario']), donacionesController.obtenerDonacionPorId);
router.post('/', autenticarUsuario, exigirRol(['exalumno', 'voluntario']), donacionesController.crearDonacion);
router.put('/:id/confirmar', autenticarUsuario, exigirRol('admin'), donacionesController.confirmarDonacion);
router.put('/:id/rechazar', autenticarUsuario, exigirRol('admin'), donacionesController.rechazarDonacion);
router.put('/:id', autenticarUsuario, exigirRol('admin'), donacionesController.actualizarDonacion);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), donacionesController.eliminarDonacion);

module.exports = router;
