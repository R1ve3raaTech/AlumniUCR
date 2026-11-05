const express = require('express');
const router = express.Router();
const certificacionesController = require('../../controllers/perfil/certificaciones.estudiante.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');
const { exigirPropiedadFila } = require('../../middlewares/ownership.middleware');

router.get('/buscar', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), certificacionesController.buscarCertificacionesPorNombre);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), certificacionesController.obtenerCertificacionesPorUsuario);
router.get('/', autenticarUsuario, exigirRol('admin'), certificacionesController.obtenerCertificacionesEstudiante);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), certificacionesController.obtenerCertificacionPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante']), certificacionesController.crearCertificacion);
// IDOR: se podia editar la certificacion de otro estudiante.
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), exigirPropiedadFila({ tabla: 'certificaciones_estudiante', columnaDueno: 'id_usuario' }), certificacionesController.actualizarCertificacion);
// IDOR: se podia borrar la certificacion de otro estudiante.
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), exigirPropiedadFila({ tabla: 'certificaciones_estudiante', columnaDueno: 'id_usuario' }), certificacionesController.eliminarCertificacion);

module.exports = router;
