const express = require('express');
const router = express.Router();
const sedeUCRController = require('../controllers/sede.UCR.controller');

router.get('/buscar/:nombre', sedeUCRController.buscarSedesPorNombre);
router.get('/', sedeUCRController.obtenerSedesUCR);
router.get('/:id', sedeUCRController.obtenerSedeUCRPorId);
router.post('/', sedeUCRController.crearSedeUCR);
router.put('/:id', sedeUCRController.actualizarSedeUCR);
router.delete('/:id', sedeUCRController.eliminarSedeUCR);

module.exports = router;
