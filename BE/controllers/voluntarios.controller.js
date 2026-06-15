// Controlador de solicitudes de voluntarios/colaboradores externos.
// Recibe el formulario público de la opción "Otros" del registro y expone al
// administrador la lista y la acción de otorgar accesos a los paneles.

const store = require('../services/voluntarios.store');

const errorValidacion = (mensaje) => {
  const err = new Error(mensaje);
  err.statusCode = 400;
  return err;
};

const AREAS_VALIDAS = ['Proyectos', 'Mentorías', 'Estudiantes', 'Varios'];

// POST /api/voluntarios  (público)
const crearSolicitud = async (req, res, next) => {
  try {
    const {
      nombre,
      correo,
      telefono,
      organizacion,
      area_colaboracion,
      disponibilidad,
      mensaje,
    } = req.body || {};

    // Todos los campos son obligatorios.
    const campos = { nombre, correo, telefono, organizacion, area_colaboracion, disponibilidad, mensaje };
    for (const [clave, valor] of Object.entries(campos)) {
      if (!valor || String(valor).trim() === '') {
        throw errorValidacion('Todos los campos son obligatorios.');
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      throw errorValidacion('El formato del correo no es válido.');
    }
    if (!AREAS_VALIDAS.includes(area_colaboracion)) {
      throw errorValidacion('Selecciona un área de colaboración válida.');
    }

    const solicitud = await store.crear({
      nombre: nombre.trim(),
      correo_electronico: correo.trim(),
      telefono: telefono.trim(),
      organizacion: organizacion.trim(),
      area_colaboracion,
      disponibilidad,
      mensaje: mensaje.trim(),
    });

    res.status(201).json({
      success: true,
      mensaje: 'Tu formulario fue entregado con éxito.',
      data: { id: solicitud.id },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/voluntarios  (solo admin)
const listarSolicitudes = async (req, res, next) => {
  try {
    const data = await store.listar();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/voluntarios/:id/accesos  (solo admin)
const actualizarAccesos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { acceso_proyectos, acceso_mentorias, acceso_estudiantes, estado } = req.body || {};

    const actualizado = await store.actualizarAccesos(id, {
      acceso_proyectos,
      acceso_mentorias,
      acceso_estudiantes,
      estado,
    });

    if (!actualizado) {
      const err = new Error('La solicitud indicada no existe.');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      mensaje: 'Accesos actualizados.',
      data: actualizado,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { crearSolicitud, listarSolicitudes, actualizarAccesos };
