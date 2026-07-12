const express = require('express');
const router = express.Router();
const areasInteresExalumnosController = require('../../controllers/perfil/areas.interes.exalumnos.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresExalumnosController.obtenerAreasInteresExalumno);
router.get('/exalumno/:idExalumno', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresExalumnosController.obtenerAreasPorExalumno);
router.get('/area/:idAreaTematica', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresExalumnosController.obtenerExalumnosPorArea);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresExalumnosController.obtenerAreaInteresExalumnoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresExalumnosController.crearAreaInteresExalumno);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresExalumnosController.actualizarAreaInteresExalumno);
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresExalumnosController.eliminarAreaInteresExalumno);

module.exports = router;
