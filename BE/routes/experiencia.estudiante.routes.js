const express = require('express');
const router = express.Router();
const experienciaController = require('../controllers/experiencia.estudiante.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), experienciaController.buscarExperienciasPorOrganizacion);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), experienciaController.obtenerExperienciasPorUsuario);
router.get('/tipo/:tipo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), experienciaController.obtenerExperienciasPorTipo);
router.get('/', autenticarUsuario, exigirRol('admin'), experienciaController.obtenerExperienciasEstudiante);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), experienciaController.obtenerExperienciaPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante']), experienciaController.crearExperiencia);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), experienciaController.actualizarExperiencia);
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), experienciaController.eliminarExperiencia);

module.exports = router;
