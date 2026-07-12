// Controlador de solicitudes de voluntarios/colaboradores externos.
// Recibe el formulario público de la opción "Otros" del registro y expone al
// administrador la lista y la acción de otorgar accesos a los paneles.

const crypto = require('crypto');
const store = require('../../services/voluntariado/voluntarios.store');
const supabase = require('../../config/supabase');
const { generarToken } = require('../../utils/aprobacionToken');
const { enviarCorreoBienvenidaVoluntario } = require('../../services/common/email.service');

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
const TIPOS_AYUDA_VALIDOS = ['donacion', 'pasantia', 'mentoria', 'taller'];

// POST /api/voluntarios  (público)
// Dos formularios distintos comparten este endpoint:
//  1. /registro/otros (histórico): nombre, correo, telefono, organizacion,
//     area_colaboracion, disponibilidad, mensaje — todos obligatorios.
//  2. /voluntariado (formulario dinámico por tipo de ayuda): nombre, correo,
//     tipo_ayuda, area, modalidad, mensaje + campos según tipo_ayuda
//     (donación: monto/frecuencia · pasantía: empresa/duracion · mentoría/taller: tema).
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
      tipo_ayuda,
      area,
      modalidad,
      monto,
      frecuencia,
      empresa,
      duracion,
      tema,
    } = req.body || {};

    // Comunes a ambos formularios.
    if (!nombre || !String(nombre).trim()) throw errorValidacion('Ingresá tu nombre.');
    if (!correo || !String(correo).trim()) throw errorValidacion('Ingresá tu correo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      throw errorValidacion('El formato del correo no es válido.');
    }
    if (!mensaje || !String(mensaje).trim()) throw errorValidacion('Contanos cómo te gustaría ayudar.');

    if (tipo_ayuda) {
      // Formulario dinámico de /voluntariado.
      if (!TIPOS_AYUDA_VALIDOS.includes(tipo_ayuda)) {
        throw errorValidacion('Selecciona un tipo de ayuda válido.');
      }
      if (tipo_ayuda === 'donacion' && (!monto || Number(monto) <= 0 || !frecuencia)) {
        throw errorValidacion('Indicá el monto y la frecuencia de tu donación.');
      }
      if (tipo_ayuda === 'pasantia' && (!empresa || !duracion)) {
        throw errorValidacion('Indicá la empresa y la duración de la pasantía.');
      }
      if ((tipo_ayuda === 'mentoria' || tipo_ayuda === 'taller') && !tema) {
        throw errorValidacion('Indicá el tema de la mentoría o el taller.');
      }
    } else {
      // Formulario histórico de /registro/otros: todos sus campos son obligatorios.
      const campos = { telefono, organizacion, area_colaboracion, disponibilidad };
      for (const [, valor] of Object.entries(campos)) {
        if (!valor || String(valor).trim() === '') {
          throw errorValidacion('Todos los campos son obligatorios.');
        }
      }
      if (!AREAS_VALIDAS.includes(area_colaboracion)) {
        throw errorValidacion('Selecciona un área de colaboración válida.');
      }
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
      telefono: telefono ? telefono.trim() : null,
      organizacion: organizacion ? organizacion.trim() : null,
      area_colaboracion: area_colaboracion || null,
      disponibilidad: disponibilidad || null,
      mensaje: mensaje.trim(),
      tipo_ayuda: tipo_ayuda || null,
      area: area || null,
      modalidad: modalidad || null,
      monto: monto ? Number(monto) : null,
      frecuencia: frecuencia || null,
      empresa: empresa || null,
      duracion: duracion || null,
      tema: tema || null,
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

// GET /api/voluntarios/mis-accesos  (el propio voluntario autenticado)
// Devuelve su solicitud aprobada (accesos otorgados + lo que pidió al postularse),
// para armar su dashboard sin exponer las solicitudes de los demás.
const misAccesos = async (req, res, next) => {
  try {
    const correo = req.user.email;
    const solicitudes = await store.listar();
    const propia =
      solicitudes.find((s) => s.correo_electronico === correo && s.estado === 'aprobado') ||
      solicitudes.find((s) => s.correo_electronico === correo) ||
      null;

    res.status(200).json({ success: true, data: propia });
  } catch (error) {
    next(error);
  }
};

const MODALIDADES_VALIDAS = ['Presencial', 'Remoto', 'Híbrido'];
const DISPONIBILIDAD_VALIDA = ['Tiempo completo', 'Medio tiempo', 'Por horas', 'Puntual / por proyecto'];

// PUT /api/voluntarios/mi-perfil  (el propio voluntario autenticado)
// Edita modalidad, disponibilidad, biografía y/o foto de su propia solicitud.
const actualizarMiPerfil = async (req, res, next) => {
  try {
    const { modalidad, disponibilidad, biografia, foto_perfil } = req.body || {};
    if (modalidad !== undefined && modalidad !== '' && !MODALIDADES_VALIDAS.includes(modalidad)) {
      throw errorValidacion('Selecciona una modalidad válida.');
    }
    if (disponibilidad !== undefined && disponibilidad !== '' && !DISPONIBILIDAD_VALIDA.includes(disponibilidad)) {
      throw errorValidacion('Selecciona una disponibilidad válida.');
    }

    const actualizado = await store.actualizarPerfilPropio(req.user.email, {
      modalidad: modalidad === '' ? null : modalidad,
      disponibilidad: disponibilidad === '' ? null : disponibilidad,
      biografia: biografia === '' ? null : biografia,
      foto_perfil,
    });

    if (!actualizado) {
      const err = new Error('No tenés ninguna solicitud de voluntariado registrada.');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ success: true, mensaje: 'Perfil actualizado.', data: actualizado });
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

module.exports = { crearSolicitud, misAccesos, actualizarMiPerfil, listarSolicitudes, actualizarAccesos };
