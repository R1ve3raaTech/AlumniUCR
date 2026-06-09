const express = require('express');
const router = express.Router();
const responsabilidadEmpleoController = require('../controllers/responsabilidad.empleo.controller');

router.get('/empleo/:idEmpleo', responsabilidadEmpleoController.obtenerResponsabilidadesPorEmpleo);
router.get('/responsabilidad/:idResponsabilidad', responsabilidadEmpleoController.obtenerEmpleosPorResponsabilidad);
router.get('/', responsabilidadEmpleoController.obtenerResponsabilidadesEmpleo);
router.get('/:id', responsabilidadEmpleoController.obtenerResponsabilidadEmpleoPorId);
router.post('/', responsabilidadEmpleoController.crearResponsabilidadEmpleo);
router.put('/:id', responsabilidadEmpleoController.actualizarResponsabilidadEmpleo);
router.delete('/:id', responsabilidadEmpleoController.eliminarResponsabilidadEmpleo);

module.exports = router;
