const express = require('express');
const router = express.Router();
const informacionEstudianteController = require('../controllers/informacion.estudiante.controller');

router.get('/buscan-empleo', informacionEstudianteController.obtenerEstudiantesBuscanEmpleo);
router.get('/buscan-pasantia', informacionEstudianteController.obtenerEstudiantesBuscanPasantia);
router.get('/buscan-mentoria', informacionEstudianteController.obtenerEstudiantesBuscanMentoria);
router.get('/usuario/:idUsuario', informacionEstudianteController.obtenerInformacionPorUsuario);
router.get('/', informacionEstudianteController.obtenerInformacionEstudiantes);
router.post('/', informacionEstudianteController.crearInformacionEstudiante);
router.put('/usuario/:idUsuario', informacionEstudianteController.actualizarInformacionEstudiante);
router.delete('/usuario/:idUsuario', informacionEstudianteController.eliminarInformacionEstudiante);

module.exports = router;
