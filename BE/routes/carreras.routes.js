const express = require('express');
const router = express.Router();
const carrerasController = require('../controllers/carreras.controller');

router.get('/buscar', carrerasController.buscarCarrerasPorNombre);
router.get('/facultad/:idFacultad', carrerasController.obtenerCarrerasPorFacultad);
router.get('/', carrerasController.obtenerCarreras);
router.get('/:id', carrerasController.obtenerCarreraPorId);
router.post('/', carrerasController.crearCarrera);
router.put('/:id', carrerasController.actualizarCarrera);
router.delete('/:id', carrerasController.eliminarCarrera);

module.exports = router;
