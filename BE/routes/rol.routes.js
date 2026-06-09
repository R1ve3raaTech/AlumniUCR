const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rol.controller');

router.get('/buscar/:nombre', rolController.buscarRolesPorNombre);
router.get('/', rolController.obtenerRoles);
router.get('/:id', rolController.obtenerRolPorId);
router.post('/', rolController.crearRol);
router.put('/:id', rolController.actualizarRol);
router.delete('/:id', rolController.eliminarRol);

module.exports = router;
