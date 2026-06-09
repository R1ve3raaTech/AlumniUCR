const express = require('express');
const router = express.Router();
const experienciaController = require('../controllers/experiencia.estudiante.controller');

router.get('/buscar', experienciaController.buscarExperienciasPorOrganizacion);
router.get('/usuario/:idUsuario', experienciaController.obtenerExperienciasPorUsuario);
router.get('/tipo/:tipo', experienciaController.obtenerExperienciasPorTipo);
router.get('/', experienciaController.obtenerExperienciasEstudiante);
router.get('/:id', experienciaController.obtenerExperienciaPorId);
router.post('/', experienciaController.crearExperiencia);
router.put('/:id', experienciaController.actualizarExperiencia);
router.delete('/:id', experienciaController.eliminarExperiencia);

module.exports = router;
