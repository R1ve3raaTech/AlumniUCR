const express = require('express');
const router = express.Router();
const informacionEstudianteController = require('../controllers/informacion.estudiante.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscan-empleo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionEstudianteController.obtenerEstudiantesBuscanEmpleo);
router.get('/buscan-pasantia', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionEstudianteController.obtenerEstudiantesBuscanPasantia);
router.get('/buscan-mentoria', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionEstudianteController.obtenerEstudiantesBuscanMentoria);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionEstudianteController.obtenerInformacionPorUsuario);
router.get('/', autenticarUsuario, exigirRol('admin'), informacionEstudianteController.obtenerInformacionEstudiantes);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante']), informacionEstudianteController.crearInformacionEstudiante);
router.put('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante']), informacionEstudianteController.actualizarInformacionEstudiante);
router.delete('/usuario/:idUsuario', autenticarUsuario, exigirRol('admin'), informacionEstudianteController.eliminarInformacionEstudiante);

module.exports = router;
