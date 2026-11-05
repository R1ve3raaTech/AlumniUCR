const express = require('express');
const router = express.Router();
const sectorExalumnoController = require('../../controllers/perfil/sector.exalumno.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');
const { exigirPropiedadFila } = require('../../middlewares/ownership.middleware');

router.get('/exalumno/:idExalumno', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sectorExalumnoController.obtenerSectoresPorExalumno);
router.get('/sector/:idSector', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), sectorExalumnoController.obtenerExalumnosPorSector);
router.get('/', autenticarUsuario, exigirRol('admin'), sectorExalumnoController.obtenerSectoresExalumno);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorExalumnoController.obtenerSectorExalumnoPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), sectorExalumnoController.crearSectorExalumno);
// IDOR: se podia editar el sector de otro exalumno.
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), exigirPropiedadFila({ tabla: 'sectores_exalumno', columnaDueno: 'id_exalumno' }), sectorExalumnoController.actualizarSectorExalumno);
// IDOR: se podia borrar el sector de otro exalumno.
router.delete('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno']), exigirPropiedadFila({ tabla: 'sectores_exalumno', columnaDueno: 'id_exalumno' }), sectorExalumnoController.eliminarSectorExalumno);

module.exports = router;
