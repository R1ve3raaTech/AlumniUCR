const express = require('express');
const router = express.Router();
const areasInteresExalumnoController = require('../controllers/areas.interes.exalumnos.controller');

router.get('/', areasInteresExalumnoController.obtenerAreasInteresExalumno);
router.get('/exalumno/:idExalumno', areasInteresExalumnoController.obtenerAreasPorExalumno);
router.get('/area/:idAreaTematica', areasInteresExalumnoController.obtenerExalumnosPorArea);
router.get('/:id', areasInteresExalumnoController.obtenerAreaInteresExalumnoPorId);
router.post('/', areasInteresExalumnoController.crearAreaInteresExalumno);
router.put('/:id', areasInteresExalumnoController.actualizarAreaInteresExalumno);
router.delete('/:id', areasInteresExalumnoController.eliminarAreaInteresExalumno);

module.exports = router;
