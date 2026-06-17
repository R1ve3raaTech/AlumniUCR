const express = require('express');
const router = express.Router();
const claudeController = require('../controllers/claude.controller');

// Ruta pública para interactuar con el chatbot de ayuda usando Claude
router.post('/chat', claudeController.chatSoporte);

module.exports = router;
