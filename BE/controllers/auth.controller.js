const authService = require('../services/auth.service');

// ─────────────────────────────────────────────
//  REGISTRO ESTUDIANTE
//  Rol ID: 1 = Estudiante
// ─────────────────────────────────────────────
const registerEstudiante = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const result = await authService.registerUser(correo, contrasena, 1);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  REGISTRO EXALUMNO
//  Rol ID: 2 = Exalumno
// ─────────────────────────────────────────────
const registerExalumno = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const result = await authService.registerUser(correo, contrasena, 2);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;
    const result = await authService.loginUser(correo, contrasena);
    res.status(200).json({ success: true, token: result.token, user: result.user });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerEstudiante, registerExalumno, login };