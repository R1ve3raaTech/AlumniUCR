const express = require('express');
const router = express.Router();
const areasInteresController = require('../controllers/areas.interes.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno', 'voluntario']), areasInteresController.buscarAreasPorNombre);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno', 'voluntario']), areasInteresController.obtenerAreasInteres);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno', 'voluntario']), areasInteresController.obtenerAreaInteresPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), areasInteresController.crearAreaInteres);
router.put('/:id', autenticarUsuario, exigirRol('admin'), areasInteresController.actualizarAreaInteres);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), areasInteresController.eliminarAreaInteres);

module.exports = router;
