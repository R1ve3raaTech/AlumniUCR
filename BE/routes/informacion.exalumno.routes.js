const express = require('express');
const router = express.Router();
const informacionExalumnoController = require('../controllers/informacion.exalumno.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/mentores', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerExalumnosMentores);
router.get('/ofrecen-empleo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerExalumnosOfrecenEmpleo);
router.get('/ofrecen-pasantia', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerExalumnosOfrecenPasantia);
router.get('/ofrecen-donacion', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerExalumnosOfrecenDonacion);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerInformacionExalumnoPorUsuario);
router.get('/', autenticarUsuario, exigirRol('admin'), informacionExalumnoController.obtenerInformacionExalumnos);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), informacionExalumnoController.crearInformacionExalumno);
router.put('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'exalumno']), informacionExalumnoController.actualizarInformacionExalumno);
router.delete('/usuario/:idUsuario', autenticarUsuario, exigirRol('admin'), informacionExalumnoController.eliminarInformacionExalumno);

module.exports = router;
