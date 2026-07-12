// Rutas de Matching Extendido — Posiciones (RF-10/13).
// Solo estudiantes pueden generar y ver sus matches de posiciones.

const express = require('express');
const router = express.Router();
const matchesPosicionesController = require('../../controllers/matching/matches.posiciones.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');


// POST /api/matches-posiciones/generar
// Genera matches del estudiante con todas las posiciones activas
// Llamar desde el FE al completar perfil o actualizar habilidades/CV
router.post(
    '/generar',
    autenticarUsuario,
    exigirRol(['estudiante']),
    matchesPosicionesController.generarMatchesPosiciones
);

// GET /api/matches-posiciones/mis-matches
// Posiciones con score > 50 — aparece junto con matches de mentoría en /mis-matches
router.get(
    '/mis-matches',
    autenticarUsuario,
    exigirRol(['estudiante']),
    matchesPosicionesController.obtenerMisMatchesPosiciones
);


module.exports = router;