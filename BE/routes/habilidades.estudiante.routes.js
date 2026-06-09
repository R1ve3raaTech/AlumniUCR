const express = require('express');
const router = express.Router();
const habilidadesController = require('../controllers/habilidades.estudiante.controller');

router.get('/buscar/tecnicas', habilidadesController.buscarHabilidadesTecnicas);
router.get('/buscar/idiomas', habilidadesController.buscarIdiomas);
router.get('/usuario/:idUsuario', habilidadesController.obtenerHabilidadesPorUsuario);
router.get('/', habilidadesController.obtenerHabilidadesEstudiante);
router.get('/:id', habilidadesController.obtenerHabilidadPorId);
router.post('/', habilidadesController.crearHabilidad);
router.put('/:id', habilidadesController.actualizarHabilidad);
router.delete('/:id', habilidadesController.eliminarHabilidad);

module.exports = router;
