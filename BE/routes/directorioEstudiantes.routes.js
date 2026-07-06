const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/directorioEstudiantes.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

// Directorio público de proyectos (sin sesión): tarjetas sin beca/correo.
router.get('/publico', ctrl.obtenerDirectorioPublico);

// Directorio de estudiantes (lo consultan exalumnos y admin).
router.get('/', autenticarUsuario, exigirRol(['admin', 'exalumno']), ctrl.obtenerDirectorio);

// El exalumno solicita contacto con un estudiante.
router.post('/contacto', autenticarUsuario, exigirRol(['admin', 'exalumno']), ctrl.solicitarContacto);

// El estudiante consulta y responde sus solicitudes de contacto.
router.get('/contacto/recibidas', autenticarUsuario, exigirRol(['admin', 'estudiante']), ctrl.misSolicitudes);
router.patch('/contacto/:id', autenticarUsuario, exigirRol(['admin', 'estudiante']), ctrl.responderSolicitud);

module.exports = router;
