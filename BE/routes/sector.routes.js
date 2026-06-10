const express = require('express');
const router = express.Router();
const sectorController = require('../controllers/sector.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar/:nombre', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sectorController.buscarSectoresPorNombre);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sectorController.obtenerSectores);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sectorController.obtenerSectorPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), sectorController.crearSector);
router.put('/:id', autenticarUsuario, exigirRol('admin'), sectorController.actualizarSector);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), sectorController.eliminarSector);

module.exports = router;
