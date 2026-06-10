const express = require('express');
const router = express.Router();
const areasInteresProyectoController = require('../controllers/areas.interes.proyecto.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresProyectoController.obtenerAreasInteresProyecto);
router.get('/proyecto/:idProyecto', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresProyectoController.obtenerAreasPorProyecto);
router.get('/area/:idAreaTematica', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresProyectoController.obtenerProyectosPorArea);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresProyectoController.obtenerAreaInteresProyectoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante']), areasInteresProyectoController.crearAreaInteresProyecto);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), areasInteresProyectoController.actualizarAreaInteresProyecto);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), areasInteresProyectoController.eliminarAreaInteresProyecto);

module.exports = router;
