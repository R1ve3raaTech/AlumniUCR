const express = require('express');
const router = express.Router();
const carrerasUsuarioController = require('../../controllers/perfil/carreras.usuario.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');
const { exigirPropiedadFila } = require('../../middlewares/ownership.middleware');

router.get('/', carrerasUsuarioController.obtenerCarrerasUsuario);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.obtenerCarrerasPorUsuario);
router.get('/carrera/:idCarrera', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.obtenerUsuariosPorCarrera);
router.get('/sede/:idSede', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.obtenerUsuariosPorSede);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.obtenerCarreraUsuarioPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasUsuarioController.crearCarreraUsuario);
// IDOR: se podia editar la carrera de otro usuario.
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), exigirPropiedadFila({ tabla: 'carreras_usuario', columnaDueno: 'id_usuario' }), carrerasUsuarioController.actualizarCarreraUsuario);
// IDOR: se podia borrar la carrera de otro usuario.
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), exigirPropiedadFila({ tabla: 'carreras_usuario', columnaDueno: 'id_usuario' }), carrerasUsuarioController.eliminarCarreraUsuario);

module.exports = router;
