const express = require('express');
const router = express.Router();
const carrerasUsuarioController = require('../controllers/carreras.usuario.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/', carrerasUsuarioController.obtenerCarrerasUsuario);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.obtenerCarrerasPorUsuario);
router.get('/carrera/:idCarrera', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.obtenerUsuariosPorCarrera);
router.get('/sede/:idSede', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.obtenerUsuariosPorSede);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.obtenerCarreraUsuarioPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.crearCarreraUsuario);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.actualizarCarreraUsuario);
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.eliminarCarreraUsuario);

module.exports = router;
