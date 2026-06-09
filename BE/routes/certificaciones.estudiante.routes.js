const express = require('express');
const router = express.Router();
const certificacionesController = require('../controllers/certificaciones.estudiante.controller');

router.get('/buscar', certificacionesController.buscarCertificacionesPorNombre);
router.get('/usuario/:idUsuario', certificacionesController.obtenerCertificacionesPorUsuario);
router.get('/', certificacionesController.obtenerCertificacionesEstudiante);
router.get('/:id', certificacionesController.obtenerCertificacionPorId);
router.post('/', certificacionesController.crearCertificacion);
router.put('/:id', certificacionesController.actualizarCertificacion);
router.delete('/:id', certificacionesController.eliminarCertificacion);

module.exports = router;
