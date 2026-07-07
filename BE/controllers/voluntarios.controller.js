// Controlador de solicitudes de voluntarios/colaboradores externos.
// Recibe el formulario público de la opción "Otros" del registro y expone al
// administrador la lista y la acción de otorgar accesos a los paneles.

const crypto = require('crypto');
const store = require('../services/voluntarios.store');
const supabase = require('../config/supabase');
const { generarToken } = require('../utils/aprobacionToken');
const { enviarCorreoBienvenidaVoluntario } = require('../services/email.service');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ID_ROL_VOLUNTARIO = 4; // tabla 'roles': 1 Estudiante, 2 Exalumno, 3 Admin, 4 Voluntario

const errorValidacion = (mensaje) => {
  const err = new Error(mensaje);
  err.statusCode = 400;
  return err;
};

/**
 * Crea la cuenta del voluntario al aprobar su solicitud (si no existe ya una
 * cuenta con ese correo): usuario en Auth + perfil activo con rol Voluntario,
 * y le envía el enlace para definir su contraseña (mismo flujo de /restablecer).
 */
const crearCuentaVoluntario = async (solicitud) => {
  const { data: existente } = await supabase
    .from('usuarios')
    .select('id')
    .eq('correo_electronico', solicitud.correo_electronico)
    .maybeSingle();
  if (existente) return { creada: false };

  // Contraseña aleatoria temporal: el voluntario define la suya desde el correo.
  const { data: creado, error: authError } = await supabase.auth.admin.createUser({
    email: solicitud.correo_electronico,
    password: crypto.randomBytes(24).toString('base64url'),
    email_confirm: true,
  });
  if (authError) throw authError;

  const { error: perfilError } = await supabase.from('usuarios').insert([
    {
      id: creado.user.id,
      nombre: solicitud.nombre,
      correo_electronico: solicitud.correo_electronico,
      id_rol: ID_ROL_VOLUNTARIO,
      confirmado: true,
      estado: 'activo',
    },
  ]);
  if (perfilError) {
    // Sin perfil la cuenta no puede iniciar sesión: se revierte el usuario de Auth.
    await supabase.auth.admin.deleteUser(creado.user.id).catch(() => {});
    throw perfilError;
  }

  const token = generarToken(creado.user.id, 'reset');
  const url = `${FRONTEND_URL}/definir-contrasena?uid=${encodeURIComponent(creado.user.id)}&token=${token}`;
  enviarCorreoBienvenidaVoluntario({
    nombre: solicitud.nombre,
    correo: solicitud.correo_electronico,
    url,
  }).catch(() => {});

  return { creada: true };
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

    // El correo no puede tener ya una cuenta en la plataforma.
    const { data: cuentaExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('correo_electronico', correo.trim())
      .maybeSingle();
    if (cuentaExistente) {
      const err = new Error('Ese correo ya tiene una cuenta en la plataforma. Iniciá sesión o recuperá tu contraseña.');
      err.statusCode = 409;
      throw err;
    }

    // Tampoco puede tener otra solicitud en curso (pendiente o aprobada).
    const solicitudes = await store.listar();
    const repetida = solicitudes.find(
      (s) => s.correo_electronico === correo.trim() && s.estado !== 'rechazado',
    );
    if (repetida) {
      const err = new Error('Ya recibimos una solicitud con ese correo. La administración la está revisando.');
      err.statusCode = 409;
      throw err;
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

    // Al aprobar, se crea la cuenta del voluntario (si no existía) y se le
    // envía el correo para definir su contraseña e iniciar sesión.
    let cuenta = { creada: false };
    if (actualizado.estado === 'aprobado') {
      cuenta = await crearCuentaVoluntario(actualizado);
    }

    res.status(200).json({
      success: true,
      mensaje: cuenta.creada
        ? 'Accesos actualizados. Se creó la cuenta del voluntario y le enviamos el correo para definir su contraseña.'
        : 'Accesos actualizados.',
      data: { ...actualizado, cuenta_creada: cuenta.creada },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { crearSolicitud, listarSolicitudes, actualizarAccesos };
