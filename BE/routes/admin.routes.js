// Rutas del Panel de Administración (RF-08).
// Todas las rutas requieren rol 'admin'.

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');


// RF-08.1 — Matches con alerta de seguimiento
// GET /api/admin/matches?estado=activo&fecha_desde=2024-01-01
router.get(
    '/matches',
    autenticarUsuario,
    exigirRol(['admin']),
    adminController.obtenerMatchesAdmin
);

// RF-08.2 — Donaciones pendientes con alerta 48h
// GET /api/admin/donaciones/pendientes
router.get(
    '/donaciones/pendientes',
    autenticarUsuario,
    exigirRol(['admin']),
    adminController.obtenerDonacionesPendientes
);

// RF-08.2 — Enviar recordatorios de donaciones vencidas > 48h
// POST /api/admin/donaciones/recordatorio
router.post(
    '/donaciones/recordatorio',
    autenticarUsuario,
    exigirRol(['admin']),
    adminController.enviarRecordatorioDonaciones
);

// RF-08.3 — Dashboard de impacto
// GET /api/admin/dashboard
router.get(
    '/dashboard',
    autenticarUsuario,
    exigirRol(['admin']),
    adminController.obtenerDashboard
);


module.exports = router;
