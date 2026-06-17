/**
 * Controlador para las interacciones con el Asistente de IA (Claude).
 */
const claudeService = require('../services/claude.service');

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

    // Llamar al servicio pasándole el historial y el contexto de navegación/rol
    const respuesta = await claudeService.generarRespuestaSoporte(historial, contexto);

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
