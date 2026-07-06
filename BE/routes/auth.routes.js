const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');

// Perfil del usuario autenticado (incluye su rol).
router.get('/perfil', autenticarUsuario, authController.obtenerPerfil);

// Verifica si un correo ya está registrado (público; usado por el formulario de registro).
router.get('/correo-existe', authController.verificarCorreoExiste);

router.post('/register/estudiante', authController.registerEstudiante);
router.post('/register/exalumno', authController.registerExalumno);
router.post('/login', authController.login);

// Flujo de verificación por magic link (estudiante y exalumno)
router.post('/magic-link/solicitar', authController.solicitarMagicLink);
router.post('/magic-link/verificar', authController.verificarMagicLink);
router.post('/completar-perfil', authController.completarPerfil);

// Aprobación de cuentas desde el correo del administrador (enlaces con token).
router.get('/aprobar/:userId', authController.aprobarCuenta);
router.get('/rechazar/:userId', authController.rechazarCuenta);

// Confirmación de cuenta del exalumno (registro por autodeclaración).
router.get('/confirmar-exalumno/:userId', authController.confirmarExalumno);

// Recuperación de contraseña: solicitar código por correo, verificar el
// código de 6 dígitos y definir la nueva contraseña con el token resultante.
router.post('/recuperar', authController.solicitarRecuperacion);
router.post('/recuperar/verificar', authController.verificarCodigoRecuperacion);
router.post('/restablecer', authController.restablecerContrasena);

module.exports = router;
