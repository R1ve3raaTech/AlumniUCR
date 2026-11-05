const express = require('express');
const router = express.Router();
const replicateController = require('../../controllers/common/replicate.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');

// POST http://localhost:PORT/api/replicate/generate
//
// Exige sesión: cada llamada genera una imagen que se le factura a la cuenta de
// Replicate de la asociación. Antes estaba abierta, así que cualquiera podía
// gastar el presupuesto sin tener cuenta en la plataforma.
router.post('/generate', autenticarUsuario, replicateController.generarImagenFlux);

module.exports = router;

