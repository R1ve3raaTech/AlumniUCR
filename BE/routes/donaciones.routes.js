const express = require('express');
const router = express.Router();
const donacionesController = require('../controllers/donaciones.controller');

router.get('/', donacionesController.obtenerDonaciones);
router.get('/usuario/:idUsuarioExalumno', donacionesController.obtenerDonacionesPorUsuario);
router.get('/proyecto/:idProyecto', donacionesController.obtenerDonacionesPorProyecto);
router.get('/estado/:estado', donacionesController.obtenerDonacionesPorEstado);
router.get('/:id', donacionesController.obtenerDonacionPorId);
router.post('/', donacionesController.crearDonacion);
router.put('/:id', donacionesController.actualizarDonacion);
router.delete('/:id', donacionesController.eliminarDonacion);

module.exports = router;
