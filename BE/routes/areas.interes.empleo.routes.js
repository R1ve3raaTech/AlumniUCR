const express = require('express');
const router = express.Router();
const areasInteresEmpleoController = require('../controllers/areas.interes.empleo.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresEmpleoController.obtenerAreasInteresEmpleo);
router.get('/empleo/:idEmpleo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresEmpleoController.obtenerAreasPorEmpleo);
router.get('/area/:idAreaTematica', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresEmpleoController.obtenerEmpleosPorArea);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresEmpleoController.obtenerAreaInteresEmpleoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresEmpleoController.crearAreaInteresEmpleo);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresEmpleoController.actualizarAreaInteresEmpleo);
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresEmpleoController.eliminarAreaInteresEmpleo);

module.exports = router;
