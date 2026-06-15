const express = require('express');
const router = express.Router();
const nivelAcademicoController = require('../controllers/nivel.academico.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), nivelAcademicoController.obtenerNivelesAcademicos);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'estudiante', 'exalumno']), nivelAcademicoController.obtenerNivelAcademicoPorId);

module.exports = router;
