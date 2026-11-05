const express = require('express');
const router = express.Router();
const proyectoGraduacionController = require('../../controllers/curriculum/proyecto.graduacion.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');
const { exigirPropiedadFila } = require('../../middlewares/ownership.middleware');

router.get('/finalizados', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), proyectoGraduacionController.obtenerProyectosFinalizados);
router.get('/usuario/:idUsuario', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), proyectoGraduacionController.obtenerProyectosPorUsuario);
router.get('/area/:areaTematica', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), proyectoGraduacionController.buscarProyectosPorArea);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno', 'voluntario']), proyectoGraduacionController.obtenerProyectosGraduacion);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno', 'voluntario']), proyectoGraduacionController.obtenerProyectoGraduacionPorId);
router.post('/', autenticarUsuario, exigirRol(['admin', 'estudiante']), proyectoGraduacionController.crearProyectoGraduacion);
// IDOR: un estudiante podia reescribir el proyecto de graduacion de otro.
router.put('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), exigirPropiedadFila({ tabla: 'proyecto_graduacion', columnaDueno: 'id_estudiante' }), proyectoGraduacionController.actualizarProyectoGraduacion);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), proyectoGraduacionController.eliminarProyectoGraduacion);

module.exports = router;
