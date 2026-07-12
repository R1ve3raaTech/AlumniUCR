const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/perfil/perfilExalumno.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

// Directorio público de exalumnos con perfil completo (RF-02).
router.get('/directorio', ctrl.obtenerDirectorio);

// Catálogos para el formulario (sectores, áreas, facultades, carreras).
router.get('/catalogos', autenticarUsuario, exigirRol(['admin', 'exalumno']), ctrl.obtenerCatalogos);

// Perfil propio del exalumno (consultar y guardar).
router.get('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), ctrl.obtenerMiPerfil);
router.put('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), ctrl.guardarMiPerfil);

module.exports = router;
