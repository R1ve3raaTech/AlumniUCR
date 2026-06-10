const express = require('express');
const router = express.Router();
const carrerasController = require('../controllers/carreras.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasController.buscarCarrerasPorNombre);
router.get('/facultad/:idFacultad', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasController.obtenerCarrerasPorFacultad);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasController.obtenerCarreras);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), carrerasController.obtenerCarreraPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), carrerasController.crearCarrera);
router.put('/:id', autenticarUsuario, exigirRol('admin'), carrerasController.actualizarCarrera);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), carrerasController.eliminarCarrera);

module.exports = router;
