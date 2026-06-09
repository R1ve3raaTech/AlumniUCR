const express = require('express');
const router = express.Router();
const aplicantesController = require('../controllers/aplicantes.empleo.controller');

router.get('/', aplicantesController.obtenerAplicantes);
router.get('/empleo/:idEmpleo', aplicantesController.obtenerAplicantesPorEmpleo);
router.get('/usuario/:idUsuario', aplicantesController.obtenerAplicantesPorUsuario);
router.get('/:id', aplicantesController.obtenerAplicantePorId);
router.post('/', aplicantesController.crearAplicante);
router.put('/:id', aplicantesController.actualizarAplicante);
router.delete('/:id', aplicantesController.eliminarAplicante);

module.exports = router;
