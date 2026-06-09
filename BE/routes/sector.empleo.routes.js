const express = require('express');
const router = express.Router();
const sectorEmpleoController = require('../controllers/sector.empleo.controller');

router.get('/empleo/:idEmpleo', sectorEmpleoController.obtenerSectoresPorEmpleo);
router.get('/sector/:idSector', sectorEmpleoController.obtenerEmpleosPorSector);
router.get('/', sectorEmpleoController.obtenerSectoresEmpleo);
router.get('/:id', sectorEmpleoController.obtenerSectorEmpleoPorId);
router.post('/', sectorEmpleoController.crearSectorEmpleo);
router.put('/:id', sectorEmpleoController.actualizarSectorEmpleo);
router.delete('/:id', sectorEmpleoController.eliminarSectorEmpleo);

module.exports = router;
