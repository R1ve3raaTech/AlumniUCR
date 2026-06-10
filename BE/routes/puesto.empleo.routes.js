const express = require('express');
const router = express.Router();
const puestoEmpleoController = require('../controllers/puesto.empleo.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/activos', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), puestoEmpleoController.obtenerPuestosActivos);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'exalumno']), puestoEmpleoController.obtenerPuestosPorUsuario);
router.get('/empresa/:empresa', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), puestoEmpleoController.buscarPuestosPorEmpresa);
router.get('/titulo/:titulo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), puestoEmpleoController.buscarPuestosPorTitulo);
router.get('/', autenticarUsuario, exigirRol('admin'), puestoEmpleoController.obtenerPuestosEmpleo);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), puestoEmpleoController.obtenerPuestoEmpleoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), puestoEmpleoController.crearPuestoEmpleo);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), puestoEmpleoController.actualizarPuestoEmpleo);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), puestoEmpleoController.eliminarPuestoEmpleo);

module.exports = router;
