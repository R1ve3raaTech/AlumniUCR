const express = require('express');
const router = express.Router();
const tipoProyectoController = require('../controllers/tipo.proyecto.controller');

router.get('/buscar/:nombre', tipoProyectoController.buscarTiposProyectoPorNombre);
router.get('/', tipoProyectoController.obtenerTiposProyecto);
router.get('/:id', tipoProyectoController.obtenerTipoProyectoPorId);
router.post('/', tipoProyectoController.crearTipoProyecto);
router.put('/:id', tipoProyectoController.actualizarTipoProyecto);
router.delete('/:id', tipoProyectoController.eliminarTipoProyecto);

module.exports = router;
