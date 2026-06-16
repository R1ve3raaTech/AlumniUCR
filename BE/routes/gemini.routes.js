const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/gemini.controller');

// Ruta pública para interactuar con el chatbot de ayuda
router.post('/chat', geminiController.chatSoporte);

module.exports = router;
