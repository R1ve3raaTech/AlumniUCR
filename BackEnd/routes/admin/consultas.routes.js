const express = require('express');
const router = express.Router();
const consultasController = require('../../controllers/admin/consultas.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

// Envío público de una consulta desde el Centro de Ayuda (visitante sin sesión).
router.post('/', consultasController.crearConsulta);

// Gestión por el administrador (requiere sesión + rol admin).
router.get('/', autenticarUsuario, exigirRol('admin'), consultasController.listarConsultas);
router.patch('/:id', autenticarUsuario, exigirRol('admin'), consultasController.actualizarConsulta);

module.exports = router;
