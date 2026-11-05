const express = require('express');
const router = express.Router();
const informacionExalumnoController = require('../../controllers/perfil/informacion.exalumno.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');
const { exigirUsuarioPropio } = require('../../middlewares/ownership.middleware');

router.get('/mentores', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerExalumnosMentores);
router.get('/ofrecen-empleo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerExalumnosOfrecenEmpleo);
router.get('/ofrecen-pasantia', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerExalumnosOfrecenPasantia);
router.get('/ofrecen-donacion', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerExalumnosOfrecenDonacion);
router.get('/directorio', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerExalumnosDirectorio);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), informacionExalumnoController.obtenerInformacionExalumnoPorUsuario);
router.get('/', autenticarUsuario, exigirRol('admin'), informacionExalumnoController.obtenerInformacionExalumnos);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), informacionExalumnoController.crearInformacionExalumno);
// IDOR: un exalumno podia sobrescribir el perfil de otro exalumno.
router.put('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'exalumno']), exigirUsuarioPropio('idUsuario'), informacionExalumnoController.actualizarInformacionExalumno);
router.delete('/usuario/:idUsuario', autenticarUsuario, exigirRol('admin'), informacionExalumnoController.eliminarInformacionExalumno);

module.exports = router;