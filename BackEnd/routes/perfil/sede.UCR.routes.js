const express = require('express');
const router = express.Router();
const sedeUCRController = require('../../controllers/perfil/sede.UCR.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

router.get('/buscar/:nombre', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sedeUCRController.buscarSedesPorNombre);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sedeUCRController.obtenerSedesUCR);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sedeUCRController.obtenerSedeUCRPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), sedeUCRController.crearSedeUCR);
router.put('/:id', autenticarUsuario, exigirRol('admin'), sedeUCRController.actualizarSedeUCR);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), sedeUCRController.eliminarSedeUCR);

module.exports = router;
