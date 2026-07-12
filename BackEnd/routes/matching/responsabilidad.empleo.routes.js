const express = require('express');
const router = express.Router();
const responsabilidadEmpleoController = require('../../controllers/matching/responsabilidad.empleo.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

router.get('/empleo/:idEmpleo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), responsabilidadEmpleoController.obtenerResponsabilidadesPorEmpleo);
router.get('/responsabilidad/:idResponsabilidad', autenticarUsuario, exigirRol(['admin', 'exalumno']), responsabilidadEmpleoController.obtenerEmpleosPorResponsabilidad);
router.get('/', autenticarUsuario, exigirRol('admin'), responsabilidadEmpleoController.obtenerResponsabilidadesEmpleo);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), responsabilidadEmpleoController.obtenerResponsabilidadEmpleoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), responsabilidadEmpleoController.crearResponsabilidadEmpleo);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), responsabilidadEmpleoController.actualizarResponsabilidadEmpleo);
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), responsabilidadEmpleoController.eliminarResponsabilidadEmpleo);

module.exports = router;
