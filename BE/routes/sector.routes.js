const express = require('express');
const router = express.Router();
const sectorController = require('../controllers/sector.controller');

router.get('/buscar/:nombre', sectorController.buscarSectoresPorNombre);
router.get('/', sectorController.obtenerSectores);
router.get('/:id', sectorController.obtenerSectorPorId);
router.post('/', sectorController.crearSector);
router.put('/:id', sectorController.actualizarSector);
router.delete('/:id', sectorController.eliminarSector);

module.exports = router;
