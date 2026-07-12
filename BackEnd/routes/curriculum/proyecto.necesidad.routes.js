const express = require('express');
const router = express.Router();
const proyectoNecesidadController = require('../../controllers/curriculum/proyecto.necesidad.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

router.get('/proyecto/:idProyecto', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), proyectoNecesidadController.obtenerNecesidadesPorProyecto);
router.get('/necesidad/:idNecesidad', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), proyectoNecesidadController.obtenerProyectosPorNecesidad);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), proyectoNecesidadController.obtenerProyectoNecesidades);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), proyectoNecesidadController.obtenerProyectoNecesidadPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante']), proyectoNecesidadController.crearProyectoNecesidad);
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), proyectoNecesidadController.actualizarProyectoNecesidad);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), proyectoNecesidadController.eliminarProyectoNecesidad);

module.exports = router;
