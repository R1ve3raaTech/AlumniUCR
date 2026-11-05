const express = require('express');
const router = express.Router();
const areasInteresExalumnosController = require('../../controllers/perfil/areas.interes.exalumnos.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');
const { exigirPropiedadFila } = require('../../middlewares/ownership.middleware');
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresExalumnosController.obtenerAreasInteresExalumno);
router.get('/exalumno/:idExalumno', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresExalumnosController.obtenerAreasPorExalumno);
router.get('/area/:idAreaTematica', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), areasInteresExalumnosController.obtenerExalumnosPorArea);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresExalumnosController.obtenerAreaInteresExalumnoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), areasInteresExalumnosController.crearAreaInteresExalumno);
// IDOR: se podia editar el area de interes de otro exalumno.
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), exigirPropiedadFila({ tabla: 'areas_interes_exalumno', columnaDueno: 'id_exalumno' }), areasInteresExalumnosController.actualizarAreaInteresExalumno);
// IDOR: se podia borrar el area de interes de otro exalumno.
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), exigirPropiedadFila({ tabla: 'areas_interes_exalumno', columnaDueno: 'id_exalumno' }), areasInteresExalumnosController.eliminarAreaInteresExalumno);

module.exports = router;
