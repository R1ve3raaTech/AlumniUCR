const express = require('express');
const router = express.Router();
const proyectoNecesidadController = require('../controllers/proyecto.necesidad.controller');

router.get('/proyecto/:idProyecto', proyectoNecesidadController.obtenerNecesidadesPorProyecto);
router.get('/necesidad/:idNecesidad', proyectoNecesidadController.obtenerProyectosPorNecesidad);
router.get('/', proyectoNecesidadController.obtenerProyectoNecesidades);
router.get('/:id', proyectoNecesidadController.obtenerProyectoNecesidadPorId);
router.post('/', proyectoNecesidadController.crearProyectoNecesidad);
router.put('/:id', proyectoNecesidadController.actualizarProyectoNecesidad);
router.delete('/:id', proyectoNecesidadController.eliminarProyectoNecesidad);

module.exports = router;
