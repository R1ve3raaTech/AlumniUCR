// Controlador del directorio de estudiantes y solicitudes de contacto (RF-03).

const servicio = require('../services/directorioEstudiantes.service');

// Directorio público (sin sesión): tarjetas de proyectos sin datos privados.
const obtenerDirectorioPublico = async (_req, res, next) => {
  try {
    const data = await servicio.obtenerDirectorioPublico();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Directorio para el exalumno autenticado (incluye estado de su solicitud).
const obtenerDirectorio = async (req, res, next) => {
  try {
    const data = await servicio.obtenerDirectorioParaExalumno(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// El exalumno solicita contacto con un estudiante.
const solicitarContacto = async (req, res, next) => {
  try {
    const { idEstudiante, mensaje } = req.body || {};
    if (!idEstudiante) {
      const err = new Error('Falta el estudiante destinatario.');
      err.statusCode = 400;
      throw err;
    }
    const nombreExalumno = req.user.profile?.nombre || 'Un exalumno';
    const data = await servicio.crearSolicitud({
      idEstudiante,
      idExalumno: req.user.id,
      nombreExalumno,
      mensaje,
    });
    res.status(201).json({ success: true, mensaje: 'Solicitud de contacto enviada.', data });
  } catch (error) {
    next(error);
  }
};

// Solicitudes recibidas por el estudiante autenticado.
const misSolicitudes = async (req, res, next) => {
  try {
    const data = await servicio.solicitudesRecibidas(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// El estudiante acepta o rechaza una solicitud.
const responderSolicitud = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { aceptar } = req.body || {};
    const data = await servicio.responderSolicitud(id, req.user.id, !!aceptar);
    if (!data) {
      const err = new Error('La solicitud no existe o no te pertenece.');
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ success: true, mensaje: 'Solicitud actualizada.', data });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerDirectorioPublico, obtenerDirectorio, solicitarContacto, misSolicitudes, responderSolicitud };
