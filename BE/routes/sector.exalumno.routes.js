const express = require('express');
const router = express.Router();
const sectorExalumnoController = require('../controllers/sector.exalumno.controller');

router.get('/exalumno/:idExalumno', sectorExalumnoController.obtenerSectoresPorExalumno);
router.get('/sector/:idSector', sectorExalumnoController.obtenerExalumnosPorSector);
router.get('/', sectorExalumnoController.obtenerSectoresExalumno);
router.get('/:id', sectorExalumnoController.obtenerSectorExalumnoPorId);
router.post('/', sectorExalumnoController.crearSectorExalumno);
router.put('/:id', sectorExalumnoController.actualizarSectorExalumno);
router.delete('/:id', sectorExalumnoController.eliminarSectorExalumno);

module.exports = router;
