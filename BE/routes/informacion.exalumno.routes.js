const express = require('express');
const router = express.Router();
const informacionExalumnoController = require('../controllers/informacion.exalumno.controller');

router.get('/mentores', informacionExalumnoController.obtenerExalumnosMentores);
router.get('/ofrecen-empleo', informacionExalumnoController.obtenerExalumnosOfrecenEmpleo);
router.get('/ofrecen-pasantia', informacionExalumnoController.obtenerExalumnosOfrecenPasantia);
router.get('/ofrecen-donacion', informacionExalumnoController.obtenerExalumnosOfrecenDonacion);
router.get('/usuario/:idUsuario', informacionExalumnoController.obtenerInformacionExalumnoPorUsuario);
router.get('/', informacionExalumnoController.obtenerInformacionExalumnos);
router.post('/', informacionExalumnoController.crearInformacionExalumno);
router.put('/usuario/:idUsuario', informacionExalumnoController.actualizarInformacionExalumno);
router.delete('/usuario/:idUsuario', informacionExalumnoController.eliminarInformacionExalumno);

module.exports = router;
