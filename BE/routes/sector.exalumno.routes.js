const express = require('express');
const router = express.Router();
const sectorExalumnoController = require('../controllers/sector.exalumno.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/exalumno/:idExalumno', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sectorExalumnoController.obtenerSectoresPorExalumno);
router.get('/sector/:idSector', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sectorExalumnoController.obtenerExalumnosPorSector);
router.get('/', autenticarUsuario, exigirRol('admin'), sectorExalumnoController.obtenerSectoresExalumno);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorExalumnoController.obtenerSectorExalumnoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorExalumnoController.crearSectorExalumno);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorExalumnoController.actualizarSectorExalumno);
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorExalumnoController.eliminarSectorExalumno);

module.exports = router;
