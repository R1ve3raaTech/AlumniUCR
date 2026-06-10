const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rol.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar/:nombre', autenticarUsuario, exigirRol('admin'), rolController.buscarRolesPorNombre);
router.get('/', autenticarUsuario, exigirRol('admin'), rolController.obtenerRoles);
router.get('/:id', autenticarUsuario, exigirRol('admin'), rolController.obtenerRolPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), rolController.crearRol);
router.put('/:id', autenticarUsuario, exigirRol('admin'), rolController.actualizarRol);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), rolController.eliminarRol);

module.exports = router;
