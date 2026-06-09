const express = require('express');
const router = express.Router();
const responsabilidadController = require('../controllers/responsabilidad.controller');

router.get('/buscar/:nombre', responsabilidadController.buscarResponsabilidadesPorNombre);
router.get('/', responsabilidadController.obtenerResponsabilidades);
router.get('/:id', responsabilidadController.obtenerResponsabilidadPorId);
router.post('/', responsabilidadController.crearResponsabilidad);
router.put('/:id', responsabilidadController.actualizarResponsabilidad);
router.delete('/:id', responsabilidadController.eliminarResponsabilidad);

module.exports = router;
