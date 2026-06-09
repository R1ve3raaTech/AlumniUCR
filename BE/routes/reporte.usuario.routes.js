const express = require('express');
const router = express.Router();
const reporteUsuarioController = require('../controllers/reporte.usuario.controller');

router.get('/reportado/:idUsuarioReportado', reporteUsuarioController.obtenerReportesPorUsuarioReportado);
router.get('/emisor/:idUsuarioEmisor', reporteUsuarioController.obtenerReportesPorUsuarioEmisor);
router.get('/motivo/:motivo', reporteUsuarioController.buscarReportesPorMotivo);
router.get('/', reporteUsuarioController.obtenerReportesUsuarios);
router.get('/:id', reporteUsuarioController.obtenerReportePorId);
router.post('/', reporteUsuarioController.crearReporteUsuario);
router.put('/:id', reporteUsuarioController.actualizarReporteUsuario);
router.delete('/:id', reporteUsuarioController.eliminarReporteUsuario);

module.exports = router;
