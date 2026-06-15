const express = require('express');
const router = express.Router();
const becaSocioeconomicaController = require('../controllers/beca.socioeconomica.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

// El nivel de beca es un catálogo que el estudiante necesita leer para
// completar su perfil (RF-03, Sección 2); las mutaciones siguen siendo de admin.
router.get('/buscar', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), becaSocioeconomicaController.buscarBecaPorNombre);
router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), becaSocioeconomicaController.obtenerBecasSocioeconomicas);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), becaSocioeconomicaController.obtenerBecaSocioeconomicaPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), becaSocioeconomicaController.crearBecaSocioeconomica);
router.put('/:id', autenticarUsuario, exigirRol('admin'), becaSocioeconomicaController.actualizarBecaSocioeconomica);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), becaSocioeconomicaController.eliminarBecaSocioeconomica);

module.exports = router;
