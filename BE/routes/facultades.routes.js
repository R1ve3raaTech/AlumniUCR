const express = require('express');
const router = express.Router();
const facultadesController = require('../controllers/facultades.controller');

router.get('/buscar', facultadesController.buscarFacultadesPorNombre);
router.get('/', facultadesController.obtenerFacultades);
router.get('/:id', facultadesController.obtenerFacultadPorId);
router.post('/', facultadesController.crearFacultad);
router.put('/:id', facultadesController.actualizarFacultad);
router.delete('/:id', facultadesController.eliminarFacultad);

module.exports = router;
