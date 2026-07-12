// Rutas del Currículum Vitae del Estudiante (RF-11).
// Todas las rutas requieren autenticación.
// Solo estudiantes (y admin) pueden crear/editar su propio CV.

const express = require('express');
const router = express.Router();
const cvController = require('../../controllers/curriculum/cv.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');

// ======================================================
// CV COMPLETO — todas las secciones en una sola respuesta
// ======================================================

// GET /api/cv/mi-curriculum
router.get(
    '/mi-curriculum',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.obtenerMiCurriculum
);


// ======================================================
// SECCIÓN 2 — EXPERIENCIA Y PROYECTOS
// ======================================================

// GET /api/cv/experiencia
router.get(
    '/experiencia',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.obtenerMisExperiencias
);

// GET /api/cv/experiencia/:id
router.get(
    '/experiencia/:id',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.obtenerExperienciaPorId
);

// POST /api/cv/experiencia
router.post(
    '/experiencia',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.crearExperiencia
);

// PUT /api/cv/experiencia/:id
router.put(
    '/experiencia/:id',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.actualizarExperiencia
);

// DELETE /api/cv/experiencia/:id
router.delete(
    '/experiencia/:id',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.eliminarExperiencia
);


// ======================================================
// SECCIÓN 3 — HABILIDADES E IDIOMAS
// ======================================================

// GET /api/cv/habilidades
router.get(
    '/habilidades',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.obtenerMisHabilidades
);

// POST /api/cv/habilidades
router.post(
    '/habilidades',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.crearHabilidades
);

// PUT /api/cv/habilidades/:id
router.put(
    '/habilidades/:id',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.actualizarHabilidades
);


// ======================================================
// SECCIÓN 4 — CERTIFICACIONES Y LOGROS
// ======================================================

// GET /api/cv/certificaciones
router.get(
    '/certificaciones',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.obtenerMisCertificaciones
);

// GET /api/cv/certificaciones/:id
router.get(
    '/certificaciones/:id',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.obtenerCertificacionPorId
);

// POST /api/cv/certificaciones
router.post(
    '/certificaciones',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.crearCertificacion
);

// PUT /api/cv/certificaciones/:id
router.put(
    '/certificaciones/:id',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.actualizarCertificacion
);

// DELETE /api/cv/certificaciones/:id
router.delete(
    '/certificaciones/:id',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.eliminarCertificacion
);


// ======================================================
// RF-12 — IA DE ADAPTACIÓN DE CV
// ======================================================

// POST /api/cv/adaptar/:idPosicion
// Genera sugerencias de adaptación con Claude API
router.post(
    '/adaptar/:idPosicion',
    autenticarUsuario,
    exigirRol(['estudiante']),
    cvController.adaptarCvConIA
);


// ======================================================
// RF-12 — VERSIONES DEL CV (cv_versiones)
// ======================================================

// GET /api/cv/versiones
router.get(
    '/versiones',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.obtenerMisVersionesCv
);

// GET /api/cv/versiones/:id
router.get(
    '/versiones/:id',
    autenticarUsuario,
    exigirRol(['estudiante', 'admin']),
    cvController.obtenerVersionCvPorId
);

// POST /api/cv/versiones
// Guarda versión adaptada tras confirmar sugerencias
router.post(
    '/versiones',
    autenticarUsuario,
    exigirRol(['estudiante']),
    cvController.guardarVersionCv
);

// DELETE /api/cv/versiones/:id
// Elimina una versión (para hacer espacio si llega al límite de 10)
router.delete(
    '/versiones/:id',
    autenticarUsuario,
    exigirRol(['estudiante']),
    cvController.eliminarVersionCv
);


module.exports = router;