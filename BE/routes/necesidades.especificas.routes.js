const express = require('express');
const router = express.Router();
const necesidadesEspecificasController = require('../controllers/necesidades.especificas.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), necesidadesEspecificasController.buscarNecesidadesPorNombre);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), necesidadesEspecificasController.obtenerNecesidadesEspecificas);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), necesidadesEspecificasController.obtenerNecesidadEspecificaPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), necesidadesEspecificasController.crearNecesidadEspecifica);
router.put('/:id', autenticarUsuario, exigirRol('admin'), necesidadesEspecificasController.actualizarNecesidadEspecifica);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), necesidadesEspecificasController.eliminarNecesidadEspecifica);

module.exports = router;
