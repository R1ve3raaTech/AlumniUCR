const express = require('express');
const router = express.Router();
const claudeController = require('../../controllers/common/claude.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');

// Chatbot de ayuda con Claude.
//
// Antes era PÚBLICO: sin sesión y sin límite de uso, cualquiera podía gastar el
// presupuesto de la API de Anthropic de la asociación desde una terminal.
// Ahora exige sesión (y el server.js le aplica un rate limit).
//
// Verificado antes de cerrarlo: los dos consumidores reales ya mandaban el
// token (app/mentorias/exalumno y app/mi-curriculum/advisor). El chatbot de la
// landing pública NO usa esta ruta, usa app/api/alumni-chat del propio Next.
router.post('/chat', autenticarUsuario, claudeController.chatSoporte);

// Ruta protegida para generar el análisis de carrera del estudiante
router.post('/career-analysis', autenticarUsuario, claudeController.careerAnalysis);

module.exports = router;
