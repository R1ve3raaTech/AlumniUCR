// Reportes (denuncias / quejas / sugerencias) de estudiantes sobre estudiantes
// o exalumnos. El reportante se identifica por su token (req.user); el admin los
// gestiona desde su panel.

const store = require('../../services/admin/reportes.store');

const errorValidacion = (mensaje) => {
  const err = new Error(mensaje);
  err.statusCode = 400;
  return err;
};

const TIPOS = ['Denuncia', 'Queja', 'Sugerencia'];

// El estudiante crea un reporte (requiere sesión).
const crearReporte = async (req, res, next) => {
  try {
    const { tipo, persona_tipo, persona_nombre, persona_identificador, motivo, descripcion, anonimo } = req.body || {};
    if (!TIPOS.includes(tipo)) throw errorValidacion('Tipo de reporte inválido.');
    if (!descripcion || !String(descripcion).trim()) throw errorValidacion('La descripción es obligatoria.');
    // Para denuncias y quejas se requiere indicar a la persona.
    if (tipo !== 'Sugerencia' && (!persona_nombre || !String(persona_nombre).trim())) {
      throw errorValidacion('Indicá a la persona involucrada.');
    }

    const reporte = await store.crear({
      tipo,
      persona_tipo,
      persona_nombre,
      persona_identificador,
      motivo,
      descripcion: String(descripcion).trim(),
      anonimo,
      reportado_por: req.user?.id || null,
      reportado_por_nombre: req.user?.profile?.nombre || '',
    });

    res.status(201).json({ success: true, mensaje: 'Tu reporte fue enviado al administrador.', data: reporte });
  } catch (error) {
    next(error);
  }
};

// El estudiante ve su propio historial.
const misReportes = async (req, res, next) => {
  try {
    const data = await store.listarPorUsuario(req.user?.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// El administrador lista todos los reportes.
const listarReportes = async (_req, res, next) => {
  try {
    const data = await store.listar();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// El administrador cambia el estado.
const actualizarReporte = async (req, res, next) => {
  try {
    const { estado } = req.body || {};
    const actualizado = await store.marcar(req.params.id, estado);
    if (!actualizado) throw errorValidacion('Reporte no encontrado.');
    res.status(200).json({ success: true, data: actualizado });
  } catch (error) {
    next(error);
  }
};

module.exports = { crearReporte, misReportes, listarReportes, actualizarReporte };
