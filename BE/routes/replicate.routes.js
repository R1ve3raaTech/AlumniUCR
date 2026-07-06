const express = require('express');
const router = express.Router();
const replicateController = require('../controllers/replicate.controller');

// POST http://localhost:PORT/api/replicate/generate
router.post('/generate', replicateController.generarImagenFlux);

module.exports = router;

