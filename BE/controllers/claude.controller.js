/**
 * Controlador para las interacciones con el Asistente de IA (Claude).
 */
const supabase = require('../config/supabase');
const claudeService = require('../services/claude.service');

/**
 * Helper para validar el token Bearer opcionalmente y obtener el usuario.
 */
const obtenerUsuarioOpcional = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const partes = authHeader.split(' ');
    let token;
    if (partes.length === 2 && partes[0].toLowerCase() === 'bearer') {
      token = partes[1];
    } else {
      token = partes[0];
    }

    if (!token) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    const { data: perfil, error: perfilError } = await supabase
      .from('usuarios')
      .select('*, roles(nombre)')
      .eq('id', user.id)
      .maybeSingle();

    if (perfilError) return null;

    user.profile = perfil || null;
    return user;
  } catch (e) {
    return null;
  }
};

/**
 * Endpoint para interactuar con el Chatbot de Soporte Adaptativo de Claude.
 * POST /api/claude/chat
 */
const chatSoporte = async (req, res, next) => {
  try {
    const { historial, contexto } = req.body;

    // Validación básica de historial
    if (!historial || !Array.isArray(historial)) {
      const error = new Error('El campo "historial" es obligatorio y debe ser un arreglo.');
      error.statusCode = 400;
      throw error;
    }

    if (historial.length === 0) {
      const error = new Error('El historial de conversación no puede estar vacío.');
      error.statusCode = 400;
      throw error;
    }

    // Autenticar opcionalmente
    const usuario = await obtenerUsuarioOpcional(req);

    // Llamar al servicio pasándole el historial, el contexto y el usuario autenticado
    const respuesta = await claudeService.generarRespuestaSoporte(historial, contexto, usuario);

    return res.status(200).json({
      success: true,
      respuesta: respuesta,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatSoporte,
};

