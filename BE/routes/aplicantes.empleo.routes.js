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
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/', autenticarUsuario, exigirRol('admin'), aplicantesController.obtenerAplicantes);
router.post('/', autenticarUsuario, exigirRol('estudiante'), aplicantesController.crearAplicante);
router.get('/empleo/:idEmpleo', autenticarUsuario, exigirRol(['admin', 'exalumno']), aplicantesController.obtenerAplicantesPorEmpleo);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante']), aplicantesController.obtenerAplicantesPorUsuario);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), aplicantesController.obtenerAplicantePorId);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), aplicantesController.actualizarAplicante);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), aplicantesController.eliminarAplicante);

module.exports = router;
