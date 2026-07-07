const express = require('express');
const router = express.Router();
const puestoEmpleoController = require('../controllers/puesto.empleo.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/activos', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno', 'voluntario']), puestoEmpleoController.obtenerPuestosActivos);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'exalumno', 'voluntario']), puestoEmpleoController.obtenerPuestosPorUsuario);
router.get('/empresa/:empresa', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno', 'voluntario']), puestoEmpleoController.buscarPuestosPorEmpresa);
router.get('/titulo/:titulo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno', 'voluntario']), puestoEmpleoController.buscarPuestosPorTitulo);
router.get('/', autenticarUsuario, exigirRol('admin'), puestoEmpleoController.obtenerPuestosEmpleo);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno', 'voluntario']), puestoEmpleoController.obtenerPuestoEmpleoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno', 'voluntario']), puestoEmpleoController.crearPuestoEmpleo);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno', 'voluntario']), puestoEmpleoController.actualizarPuestoEmpleo);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), puestoEmpleoController.eliminarPuestoEmpleo);

// POST /api/puestos-empleo/cerrar-vencidas — admin cierra posiciones con fecha_limite vencida (RF-10)
router.post('/cerrar-vencidas', autenticarUsuario, exigirRol('admin'), puestoEmpleoController.cerrarPosicionesVencidas);

module.exports = router;
