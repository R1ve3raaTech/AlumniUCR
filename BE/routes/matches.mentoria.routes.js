// Rutas de Matching Mentoría (RF-06).
// Gestiona el ciclo de vida de matches entre exalumnos y estudiantes.

const express = require('express');
const router = express.Router();
const matchesMentoriaController = require('../controllers/matches.mentoria.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');


// ======================================================
// RUTAS DE USUARIO (estudiante + exalumno)
// ======================================================

// POST /api/matches-mentoria/generar
// Genera matches al completar perfil — llamar desde el FE tras completar perfil
router.post(
    '/generar',
    autenticarUsuario,
    exigirRol(['estudiante', 'exalumno']),
    matchesMentoriaController.generarMatches
);

// GET /api/matches-mentoria/mis-matches
// El usuario ve sus matches sugeridos y activos
router.get(
    '/mis-matches',
    autenticarUsuario,
    exigirRol(['estudiante', 'exalumno']),
    matchesMentoriaController.obtenerMisMatches
);

// PUT /api/matches-mentoria/:id/contactar
// Inicia la conexión (sugerido → contactado)
router.put(
    '/:id/contactar',
    autenticarUsuario,
    exigirRol(['estudiante', 'exalumno']),
    matchesMentoriaController.contactarMatch
);

// GET /api/matches-mentoria/:id/explicacion-ia
// Genera una explicación inteligente por IA del match
router.get(
    '/:id/explicacion-ia',
    autenticarUsuario,
    exigirRol(['estudiante', 'exalumno']),
    matchesMentoriaController.obtenerExplicacionIA
);

// PUT /api/matches-mentoria/:id/aceptar
// Acepta la conexión (contactado → activo)
router.put(
    '/:id/aceptar',
    autenticarUsuario,
    exigirRol(['estudiante', 'exalumno']),
    matchesMentoriaController.aceptarMatch
);

// GET /api/matches-mentoria/:id/aceptar-correo?u=<idUsuario>&token=<hmac>
// Acepta la conexión con un clic desde el correo (enlace firmado, sin sesión).
// La autenticación es el propio token HMAC ligado al destinatario y al match.
router.get(
    '/:id/aceptar-correo',
    matchesMentoriaController.aceptarDesdeCorreo
);

// PUT /api/matches-mentoria/:id/rechazar
// Rechaza la conexión (contactado → cerrado)
// RF-06: el exalumno rechazado no puede volver a solicitar al mismo estudiante
router.put(
    '/:id/rechazar',
    autenticarUsuario,
    exigirRol(['estudiante', 'exalumno']),
    matchesMentoriaController.rechazarMatch
);


// ======================================================
// RUTAS DE ADMIN
// ======================================================

// GET /api/matches-mentoria?estado=activo
// Todos los matches con filtro opcional por estado
router.get(
    '/',
    autenticarUsuario,
    exigirRol(['admin']),
    matchesMentoriaController.obtenerTodosLosMatches
);

// PUT /api/matches-mentoria/:id
// Admin actualiza estado y/o notas
router.put(
    '/:id',
    autenticarUsuario,
    exigirRol(['admin']),
    matchesMentoriaController.actualizarMatch
);


module.exports = router;