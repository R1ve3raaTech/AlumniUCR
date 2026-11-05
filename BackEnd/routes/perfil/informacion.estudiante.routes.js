const express = require('express');
const router = express.Router();
const informacionEstudianteController = require('../../controllers/perfil/informacion.estudiante.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');
const { exigirUsuarioPropio } = require('../../middlewares/ownership.middleware');

router.get('/buscan-empleo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionEstudianteController.obtenerEstudiantesBuscanEmpleo);
router.get('/buscan-pasantia', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionEstudianteController.obtenerEstudiantesBuscanPasantia);
router.get('/buscan-mentoria', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionEstudianteController.obtenerEstudiantesBuscanMentoria);
router.get('/directorio', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionEstudianteController.obtenerEstudiantesDirectorio);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionEstudianteController.obtenerInformacionPorUsuario);
router.get('/', autenticarUsuario, exigirRol('admin'), informacionEstudianteController.obtenerInformacionEstudiantes);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante']), informacionEstudianteController.crearInformacionEstudiante);
// IDOR: sin exigirUsuarioPropio, un estudiante podia sobrescribir el perfil
// academico de otro (carrera, beca, pausado...) cambiando el id en la URL.
router.put('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante']), exigirUsuarioPropio('idUsuario'), informacionEstudianteController.actualizarInformacionEstudiante);
router.delete('/usuario/:idUsuario', autenticarUsuario, exigirRol('admin'), informacionEstudianteController.eliminarInformacionEstudiante);

module.exports = router;