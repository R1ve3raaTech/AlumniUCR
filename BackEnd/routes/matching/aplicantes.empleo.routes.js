const express = require('express');
const router = express.Router();
const aplicantesController = require('../../controllers/matching/aplicantes.empleo.controller');
const autenticarUsuario = require('../../middlewares/auth.middleware');
const exigirRol = require('../../middlewares/role.middleware');


// ======================================================
// RF-13: RUTAS DE ESTUDIANTE
// ======================================================

// GET /api/aplicantes/mis-aplicaciones — historial del estudiante autenticado
router.get(
    '/mis-aplicaciones',
    autenticarUsuario,
    exigirRol(['estudiante']),
    aplicantesController.obtenerMisAplicaciones
);

// POST /api/aplicantes — estudiante aplica a una posición
router.post(
    '/',
    autenticarUsuario,
    exigirRol(['estudiante']),
    aplicantesController.crearAplicante
);

// DELETE /api/aplicantes/:id — estudiante retira su aplicación (solo si estado='enviada')
router.delete(
    '/:id/retirar',
    autenticarUsuario,
    exigirRol(['estudiante']),
    aplicantesController.retirarAplicacion
);


// ======================================================
// RF-13: RUTAS DE EXALUMNO
// ======================================================

// GET /api/aplicantes/posicion/:idPosicion — exalumno/voluntario ve aplicantes de su posición
router.get(
    '/posicion/:idPosicion',
    autenticarUsuario,
    exigirRol(['exalumno', 'voluntario', 'admin']),
    aplicantesController.obtenerAplicantesPorPosicion
);

// PUT /api/aplicantes/:id — exalumno/voluntario cambia estado (en_revision / seleccionado / descartado)
router.put(
    '/:id',
    autenticarUsuario,
    exigirRol(['exalumno', 'voluntario', 'admin']),
    aplicantesController.actualizarAplicante
);

// PUT /api/aplicantes/:id/seleccionar — exalumno/voluntario selecciona candidato (notifica a todos)
router.put(
    '/:id/seleccionar',
    autenticarUsuario,
    exigirRol(['exalumno', 'voluntario']),
    aplicantesController.seleccionarCandidato
);


// ======================================================
// RUTAS DE ADMIN
// ======================================================

// GET /api/aplicantes — todos los aplicantes
router.get(
    '/',
    autenticarUsuario,
    exigirRol(['admin']),
    aplicantesController.obtenerAplicantes
);

// GET /api/aplicantes/empleo/:idEmpleo — por empleo
router.get(
    '/empleo/:idEmpleo',
    autenticarUsuario,
    exigirRol(['admin', 'exalumno', 'voluntario']),
    aplicantesController.obtenerAplicantesPorEmpleo
);

// GET /api/aplicantes/usuario/:idUsuario — por usuario
router.get(
    '/usuario/:idUsuario',
    autenticarUsuario,
    exigirRol(['admin']),
    aplicantesController.obtenerAplicantesPorUsuario
);

// GET /api/aplicantes/:id — por ID
router.get(
    '/:id',
    autenticarUsuario,
    exigirRol(['admin', 'exalumno', 'voluntario']),
    aplicantesController.obtenerAplicantePorId
);

// DELETE /api/aplicantes/:id — eliminar (solo admin)
router.delete(
    '/:id',
    autenticarUsuario,
    exigirRol(['admin']),
    aplicantesController.eliminarAplicante
);


module.exports = router;