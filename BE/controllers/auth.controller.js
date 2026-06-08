const authService = require('../services/auth.service');

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

module.exports = { registerEstudiante, registerExalumno, login };