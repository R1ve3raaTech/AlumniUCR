const express = require('express');
const router = express.Router();
const areasInteresController = require('../controllers/areas.interes.controller');

router.get('/buscar', areasInteresController.buscarAreasPorNombre);
router.get('/', areasInteresController.obtenerAreasInteres);
router.get('/:id', areasInteresController.obtenerAreaInteresPorId);
router.post('/', areasInteresController.crearAreaInteres);
router.put('/:id', areasInteresController.actualizarAreaInteres);
router.delete('/:id', areasInteresController.eliminarAreaInteres);

module.exports = router;
