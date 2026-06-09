const express = require('express');
const router = express.Router();
const areasInteresProyectoController = require('../controllers/areas.interes.proyecto.controller');

router.get('/', areasInteresProyectoController.obtenerAreasInteresProyecto);
router.get('/proyecto/:idProyecto', areasInteresProyectoController.obtenerAreasPorProyecto);
router.get('/area/:idAreaTematica', areasInteresProyectoController.obtenerProyectosPorArea);
router.get('/:id', areasInteresProyectoController.obtenerAreaInteresProyectoPorId);
router.post('/', areasInteresProyectoController.crearAreaInteresProyecto);
router.put('/:id', areasInteresProyectoController.actualizarAreaInteresProyecto);
router.delete('/:id', areasInteresProyectoController.eliminarAreaInteresProyecto);

module.exports = router;
