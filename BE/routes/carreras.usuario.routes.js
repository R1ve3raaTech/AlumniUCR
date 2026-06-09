const express = require('express');
const router = express.Router();
const carrerasUsuarioController = require('../controllers/carreras.usuario.controller');

router.get('/', carrerasUsuarioController.obtenerCarrerasUsuario);
router.get('/usuario/:idUsuario', carrerasUsuarioController.obtenerCarrerasPorUsuario);
router.get('/carrera/:idCarrera', carrerasUsuarioController.obtenerUsuariosPorCarrera);
router.get('/sede/:idSede', carrerasUsuarioController.obtenerUsuariosPorSede);
router.get('/:id', carrerasUsuarioController.obtenerCarreraUsuarioPorId);
router.post('/', carrerasUsuarioController.crearCarreraUsuario);
router.put('/:id', carrerasUsuarioController.actualizarCarreraUsuario);
router.delete('/:id', carrerasUsuarioController.eliminarCarreraUsuario);

module.exports = router;
