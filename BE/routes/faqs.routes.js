// Rutas de preguntas frecuentes (FAQ). Lectura pública (Centro de Ayuda).
const express = require('express');
const router = express.Router();
const controller = require('../controllers/faqs.controller');

router.get('/', controller.listarFaqs);

module.exports = router;
