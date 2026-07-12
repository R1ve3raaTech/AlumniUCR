const express = require('express');
const router = express.Router();
const claudeController = require('../../controllers/common/claude.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');

// Ruta pública para interactuar con el chatbot de ayuda usando Claude
router.post('/chat', claudeController.chatSoporte);

// Ruta protegida para generar el análisis de carrera del estudiante
router.post('/career-analysis', autenticarUsuario, claudeController.careerAnalysis);

module.exports = router;
