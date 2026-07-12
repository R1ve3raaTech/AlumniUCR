const express = require('express');
const router = express.Router();
const reporteUsuarioController = require('../../controllers/admin/reporte.usuario.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

router.get('/reportado/:idUsuarioReportado', autenticarUsuario, exigirRol('admin'), reporteUsuarioController.obtenerReportesPorUsuarioReportado);
router.get('/emisor/:idUsuarioEmisor', autenticarUsuario, exigirRol('admin'), reporteUsuarioController.obtenerReportesPorUsuarioEmisor);
router.get('/motivo/:motivo', autenticarUsuario, exigirRol('admin'), reporteUsuarioController.buscarReportesPorMotivo);
router.get('/', autenticarUsuario, exigirRol('admin'), reporteUsuarioController.obtenerReportesUsuarios);
router.get('/:id', autenticarUsuario, exigirRol('admin'), reporteUsuarioController.obtenerReportePorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), reporteUsuarioController.crearReporteUsuario);
router.put('/:id', autenticarUsuario, exigirRol('admin'), reporteUsuarioController.actualizarReporteUsuario);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), reporteUsuarioController.eliminarReporteUsuario);

router.put('/usuario/:idUsuario/reactivar', autenticarUsuario, exigirRol('admin'), reporteUsuarioController.reactivarUsuario);
router.delete('/usuario/:idUsuario/permanente', autenticarUsuario, exigirRol('admin'), reporteUsuarioController.eliminarUsuarioPermanente);

module.exports = router;
