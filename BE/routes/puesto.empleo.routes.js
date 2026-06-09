const express = require('express');
const router = express.Router();
const puestoEmpleoController = require('../controllers/puesto.empleo.controller');

router.get('/activos', puestoEmpleoController.obtenerPuestosActivos);
router.get('/usuario/:idUsuario', puestoEmpleoController.obtenerPuestosPorUsuario);
router.get('/empresa/:empresa', puestoEmpleoController.buscarPuestosPorEmpresa);
router.get('/titulo/:titulo', puestoEmpleoController.buscarPuestosPorTitulo);
router.get('/', puestoEmpleoController.obtenerPuestosEmpleo);
router.get('/:id', puestoEmpleoController.obtenerPuestoEmpleoPorId);
router.post('/', puestoEmpleoController.crearPuestoEmpleo);
router.put('/:id', puestoEmpleoController.actualizarPuestoEmpleo);
router.delete('/:id', puestoEmpleoController.eliminarPuestoEmpleo);

module.exports = router;
