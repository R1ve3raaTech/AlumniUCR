const express = require('express');
const router = express.Router();
const becaSocioeconomicaController = require('../controllers/beca.socioeconomica.controller');

router.get('/buscar', becaSocioeconomicaController.buscarBecaPorNombre);
router.get('/', becaSocioeconomicaController.obtenerBecasSocioeconomicas);
router.get('/:id', becaSocioeconomicaController.obtenerBecaSocioeconomicaPorId);
router.post('/', becaSocioeconomicaController.crearBecaSocioeconomica);
router.put('/:id', becaSocioeconomicaController.actualizarBecaSocioeconomica);
router.delete('/:id', becaSocioeconomicaController.eliminarBecaSocioeconomica);

module.exports = router;
