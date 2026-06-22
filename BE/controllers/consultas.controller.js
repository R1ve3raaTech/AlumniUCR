// Controlador de consultas de soporte enviadas desde el Centro de Ayuda.
// Recibe el formulario público (visitante sin sesión) y expone al administrador
// la lista de consultas y la acción de marcarlas como atendidas.

const store = require('../services/consultas.store');

const errorValidacion = (mensaje) => {
  const err = new Error(mensaje);
  err.statusCode = 400;
  return err;
};

// POST /api/consultas-soporte  (público)
const crearConsulta = async (req, res, next) => {
  try {
    const { nombre, apellidos, cedula, telefono, mensaje } = req.body || {};

    const campos = { nombre, apellidos, cedula, telefono, mensaje };
    for (const [, valor] of Object.entries(campos)) {
      if (!valor || String(valor).trim() === '') {
        throw errorValidacion('Todos los campos son obligatorios.');
      }
    }

    const consulta = await store.crear({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      cedula: cedula.trim(),
      telefono: telefono.trim(),
      mensaje: mensaje.trim(),
    });

    res.status(201).json({
      success: true,
      mensaje: 'Tu consulta fue enviada al Centro de Soporte Alumni UCR.',
      data: { id: consulta.id },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/consultas-soporte  (solo admin)
const listarConsultas = async (req, res, next) => {
  try {
    const data = await store.listar();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/consultas-soporte/:id  (solo admin)
const actualizarConsulta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body || {};
    const actualizado = await store.actualizarEstado(id, estado);
    if (!actualizado) {
      const err = new Error('La consulta indicada no existe.');
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ success: true, mensaje: 'Consulta actualizada.', data: actualizado });
  } catch (error) {
    next(error);
  }
};

module.exports = { crearConsulta, listarConsultas, actualizarConsulta };
