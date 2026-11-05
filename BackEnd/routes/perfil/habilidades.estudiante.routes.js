const express = require('express');
const router = express.Router();
const habilidadesController = require('../../controllers/perfil/habilidades.estudiante.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');
const { exigirPropiedadFila } = require('../../middlewares/ownership.middleware');

router.get('/buscar/tecnicas', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), habilidadesController.buscarHabilidadesTecnicas);
router.get('/buscar/idiomas', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), habilidadesController.buscarIdiomas);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), habilidadesController.obtenerHabilidadesPorUsuario);
router.get('/', autenticarUsuario, exigirRol('admin'), habilidadesController.obtenerHabilidadesEstudiante);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), habilidadesController.obtenerHabilidadPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante']), habilidadesController.crearHabilidad);
// IDOR: se podia editar la habilidad de otro estudiante.
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), exigirPropiedadFila({ tabla: 'habilidades_estudiante', columnaDueno: 'id_usuario' }), habilidadesController.actualizarHabilidad);
// IDOR: se podia borrar la habilidad de otro estudiante.
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), exigirPropiedadFila({ tabla: 'habilidades_estudiante', columnaDueno: 'id_usuario' }), habilidadesController.eliminarHabilidad);

module.exports = router;
