const express = require('express');
const router = express.Router();
const sectorEmpleoController = require('../../controllers/matching/sector.empleo.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

router.get('/empleo/:idEmpleo', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sectorEmpleoController.obtenerSectoresPorEmpleo);
router.get('/sector/:idSector', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sectorEmpleoController.obtenerEmpleosPorSector);
router.get('/', autenticarUsuario, exigirRol('admin'), sectorEmpleoController.obtenerSectoresEmpleo);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorEmpleoController.obtenerSectorEmpleoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorEmpleoController.crearSectorEmpleo);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorEmpleoController.actualizarSectorEmpleo);
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorEmpleoController.eliminarSectorEmpleo);

module.exports = router;
