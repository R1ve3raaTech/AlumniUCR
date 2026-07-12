const express = require('express');
const router = express.Router();
const tipoProyectoController = require('../../controllers/curriculum/tipo.proyecto.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

router.get('/buscar/:nombre', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), tipoProyectoController.buscarTiposProyectoPorNombre);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), tipoProyectoController.obtenerTiposProyecto);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), tipoProyectoController.obtenerTipoProyectoPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), tipoProyectoController.crearTipoProyecto);
router.put('/:id', autenticarUsuario, exigirRol('admin'), tipoProyectoController.actualizarTipoProyecto);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), tipoProyectoController.eliminarTipoProyecto);

module.exports = router;
