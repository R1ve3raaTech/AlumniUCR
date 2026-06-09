const express = require('express');
const router = express.Router();
const proyectoGraduacionController = require('../controllers/proyecto.graduacion.controller');

router.get('/finalizados', proyectoGraduacionController.obtenerProyectosFinalizados);
router.get('/usuario/:idUsuario', proyectoGraduacionController.obtenerProyectosPorUsuario);
router.get('/area/:areaTematica', proyectoGraduacionController.buscarProyectosPorArea);
router.get('/', proyectoGraduacionController.obtenerProyectosGraduacion);
router.get('/:id', proyectoGraduacionController.obtenerProyectoGraduacionPorId);
router.post('/', proyectoGraduacionController.crearProyectoGraduacion);
router.put('/:id', proyectoGraduacionController.actualizarProyectoGraduacion);
router.delete('/:id', proyectoGraduacionController.eliminarProyectoGraduacion);

module.exports = router;
