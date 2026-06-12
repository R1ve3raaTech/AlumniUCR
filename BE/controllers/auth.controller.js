const authService = require('../services/auth.service');
const {
  validarCorreoUCR,
  validarNombre,
  validarContrasena,
} = require('../utils/validaciones');

// Lanza un error 400 con el mensaje dado (lo formatea el error.middleware).
const errorValidacion = (mensaje) => {
  const err = new Error(mensaje);
  err.statusCode = 400;
  return err;
};

// ─── Flujo de verificación por Magic Link ────────────────────────────────

// Etapa 1: el estudiante/exalumno ingresa su correo @ucr.ac.cr.
const solicitarMagicLink = async (req, res, next) => {
  try {
    const { correo, rol } = req.body;

    const errorCorreo = validarCorreoUCR(correo);
    if (errorCorreo) throw errorValidacion(errorCorreo);

    const rolNormalizado = rol === 'exalumno' ? 'exalumno' : 'estudiante';
    await authService.solicitarMagicLink(correo.trim(), rolNormalizado);

    res.status(200).json({
      success: true,
      mensaje: 'Te enviamos un enlace de verificación a tu correo.',
    });
  } catch (error) {
    next(error);
  }
};

// Etapa 2: se verifica el token_hash que viene en el magic link.
const verificarMagicLink = async (req, res, next) => {
  try {
    const { token_hash } = req.body;
    if (!token_hash) throw errorValidacion('Falta el token de verificación.');

    const result = await authService.verificarMagicLink(token_hash);
    res.status(200).json({ success: true, token: result.token, user: result.user });
  } catch (error) {
    next(error);
  }
};

// Etapa 3: con la sesión verificada, se define nombre y contraseña.
const completarPerfil = async (req, res, next) => {
  try {
    const { nombre, contrasena } = req.body;

    // El token de sesión llega en el header Authorization: Bearer <token>.
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) throw errorValidacion('No se encontró una sesión válida.');

    const errorNombre = validarNombre(nombre);
    if (errorNombre) throw errorValidacion(errorNombre);
    const errorPass = validarContrasena(contrasena);
    if (errorPass) throw errorValidacion(errorPass);

    const result = await authService.completarPerfil(token, nombre, contrasena);
    res.status(201).json({ success: true, data: result.perfil });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  CORRECCIÓN 2 y 3:
//  - El rol se define aquí en el backend, no viene del req.body
//  - Todos los errores pasan por next(error) → error.middleware.js
// ─────────────────────────────────────────────

const registerEstudiante = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // CORRECCIÓN 3: el rol lo define el backend según el endpoint usado
    const result = await authService.registerUser(correo, contrasena, 'estudiante');

    // CORRECCIÓN 1: 201 = Created
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const registerExalumno = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // CORRECCIÓN 3: rol fijo desde el backend
    const result = await authService.registerUser(correo, contrasena, 'exalumno');

    // CORRECCIÓN 1: 201 = Created
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;
    const result = await authService.loginUser(correo, contrasena);
    res.status(200).json({ success: true, token: result.token, user: result.user });
  } catch (error) {
    // CORRECCIÓN 2: next(error) en vez de res.status(401) directo
    next(error);
  }
};

module.exports = {
  registerEstudiante,
  registerExalumno,
  login,
  solicitarMagicLink,
  verificarMagicLink,
  completarPerfil,
};