const express = require('express');
const router = express.Router();
const responsabilidadController = require('../controllers/responsabilidad.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar/:nombre', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), responsabilidadController.buscarResponsabilidadesPorNombre);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), responsabilidadController.obtenerResponsabilidades);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), responsabilidadController.obtenerResponsabilidadPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), responsabilidadController.crearResponsabilidad);
router.put('/:id', autenticarUsuario, exigirRol('admin'), responsabilidadController.actualizarResponsabilidad);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), responsabilidadController.eliminarResponsabilidad);

module.exports = router;
