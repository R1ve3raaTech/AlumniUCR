const express = require('express');
const router = express.Router();
const facultadesController = require('../controllers/facultades.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), facultadesController.buscarFacultadesPorNombre);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), facultadesController.obtenerFacultades);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), facultadesController.obtenerFacultadPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), facultadesController.crearFacultad);
router.put('/:id', autenticarUsuario, exigirRol('admin'), facultadesController.actualizarFacultad);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), facultadesController.eliminarFacultad);

module.exports = router;
