const express = require('express');
const router = express.Router();
const necesidadesEspecificasController = require('../controllers/necesidades.especificas.controller');

router.get('/buscar', necesidadesEspecificasController.buscarNecesidadesPorNombre);
router.get('/', necesidadesEspecificasController.obtenerNecesidadesEspecificas);
router.get('/:id', necesidadesEspecificasController.obtenerNecesidadEspecificaPorId);
router.post('/', necesidadesEspecificasController.crearNecesidadEspecifica);
router.put('/:id', necesidadesEspecificasController.actualizarNecesidadEspecifica);
router.delete('/:id', necesidadesEspecificasController.eliminarNecesidadEspecifica);

module.exports = router;
