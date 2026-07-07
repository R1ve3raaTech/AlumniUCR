const authService = require('../services/auth.service');
const usuarioService = require('../services/usuarioService');
const {
  validarCorreoUCR,
  validarCorreo,
  validarCorreoPorRol,
  validarNombre,
  validarContrasena,
} = require('../utils/validaciones');

// Verifica (público, sin sesión) si ya existe una cuenta con ese correo. Se usa
// en el registro para avisar que la persona ya está registrada y ofrecer login.
const verificarCorreoExiste = async (req, res, next) => {
  try {
    const correo = String(req.query.correo || '').trim().toLowerCase();
    if (!correo) {
      return res.status(400).json({ success: false, message: 'Correo requerido' });
    }
    const usuario = await usuarioService.obtenerUsuarioPorCorreo(correo);
    res.status(200).json({ success: true, existe: Boolean(usuario) });
  } catch (error) {
    next(error);
  }
};

// Lanza un error 400 con el mensaje dado (lo formatea el error.middleware).
const errorValidacion = (mensaje) => {
  const err = new Error(mensaje);
  err.statusCode = 400;
  return err;
};

// ─── Flujo de verificación por Magic Link ────────────────────────────────

// Etapa 1: el estudiante (correo @ucr.ac.cr) o exalumno (cualquier correo)
// ingresa su correo para recibir el enlace de verificación.
const solicitarMagicLink = async (req, res, next) => {
  try {
    const { correo, rol } = req.body;

    const rolNormalizado = rol === 'exalumno' ? 'exalumno' : 'estudiante';
    const errorCorreo = validarCorreoPorRol(correo, rolNormalizado);
    if (errorCorreo) throw errorValidacion(errorCorreo);

    const resultado = await authService.solicitarMagicLink(correo.trim(), rolNormalizado);

    res.status(200).json({
      success: true,
      mensaje: 'Te enviamos un enlace de verificación a tu correo.',
      // En desarrollo se incluye para confirmar sin depender del correo.
      token_hash: resultado?.token_hash ?? null,
    });
  } catch (error) {
    next(error);
  }
};

// Etapa 2: se verifica el token_hash que viene en el magic link.
const verificarMagicLink = async (req, res, next) => {
  try {
    const { token_hash } = req.body;
    if (!token_hash) throw errorValidacion('Falta el token de verificación.');

    const result = await authService.verificarMagicLink(token_hash);
    res.status(200).json({ success: true, token: result.token, user: result.user });
  } catch (error) {
    next(error);
  }
};

// Etapa 3: con la sesión verificada, se define nombre y contraseña.
const completarPerfil = async (req, res, next) => {
  try {
    const { nombre, contrasena } = req.body;

    // El token de sesión llega en el header Authorization: Bearer <token>.
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) throw errorValidacion('No se encontró una sesión válida.');

    const errorNombre = validarNombre(nombre);
    if (errorNombre) throw errorValidacion(errorNombre);
    const errorPass = validarContrasena(contrasena);
    if (errorPass) throw errorValidacion(errorPass);

    const result = await authService.completarPerfil(token, nombre, contrasena);
    res.status(201).json({ success: true, data: result.perfil });
  } catch (error) {
    next(error);
  }
};

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

    const result = await authService.registerUser(correo, contrasena, 'estudiante');
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  REGISTRO EXALUMNO (por autodeclaración)
//  Rol ID: 2 = Exalumno. Cualquier dominio de correo.
// ─────────────────────────────────────────────
const ANIO_ACTUAL = new Date().getFullYear();

const registerExalumno = async (req, res, next) => {
  try {
    const { correo, contrasena, nombre, carreras, facultad, anioGraduacion } = req.body || {};

    // Validaciones según los lineamientos (todos los campos obligatorios).
    const errorCorreo = validarCorreo(correo);
    if (errorCorreo) throw errorValidacion(errorCorreo);

    const errorNombre = validarNombre(nombre);
    if (errorNombre) throw errorValidacion(errorNombre);

    const errorPass = validarContrasena(contrasena);
    if (errorPass) throw errorValidacion(errorPass);

    if (!Array.isArray(carreras) || carreras.length < 1) {
      throw errorValidacion('Selecciona al menos una carrera cursada en la UCR.');
    }
    if (!facultad || String(facultad).trim() === '') {
      throw errorValidacion('Selecciona tu escuela o facultad.');
    }
    const anio = Number(anioGraduacion);
    if (!Number.isInteger(anio) || anio < 1940 || anio > ANIO_ACTUAL) {
      throw errorValidacion(`El año de graduación debe estar entre 1940 y ${ANIO_ACTUAL}.`);
    }

    const result = await authService.registrarExalumnoAutodeclaracion({
      correo: correo.trim(),
      contrasena,
      nombre: nombre.trim(),
      carreras,
      facultad,
      anioGraduacion: anio,
    });

    // En desarrollo se expone el enlace de confirmación como respaldo (el correo
    // de Resend solo entrega al dueño de la cuenta sin un dominio verificado).
    const esProduccion = process.env.NODE_ENV === 'production';
    const data = { id: result.perfil.id };
    if (!esProduccion) data.confirmUrl = result.confirmUrl;

    res.status(201).json({
      success: true,
      mensaje: 'Cuenta creada. Revisa tu correo para confirmar y activar tu cuenta.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Confirmación de la cuenta del exalumno desde el enlace del correo.
const confirmarExalumno = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { token } = req.query;
    const perfil = await authService.confirmarExalumno(userId, token);
    res
      .status(200)
      .type('html')
      .send(
        paginaResultado(
          '✓ Cuenta confirmada',
          `Tu cuenta (${perfil.correo_electronico}) fue confirmada y activada. Ya puedes iniciar sesión.`,
          '#16a34a',
        ),
      );
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .type('html')
        .send(paginaResultado('✗ No se pudo confirmar', error.message, '#dc2626'));
    }
    next(error);
  }
};

// ─────────────────────────────────────────────
//  APROBACIÓN DE CUENTAS (enlaces del correo)
//  Devuelven una página HTML simple, ya que se abren desde el correo.
// ─────────────────────────────────────────────

// Página HTML mínima de respuesta para los enlaces de aprobar/rechazar.
const paginaResultado = (titulo, mensaje, color) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titulo}</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#0f0f1e;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
  <div style="text-align:center;max-width:440px;padding:2.5rem;background:rgba(255,255,255,.05);border-radius:16px">
    <div style="font-size:3rem;margin-bottom:1rem;color:${color}">${titulo.split(' ')[0]}</div>
    <h1 style="font-size:1.4rem;margin:.5rem 0">${titulo}</h1>
    <p style="color:#b8b8c8;line-height:1.5">${mensaje}</p>
  </div>
</body></html>`;

const aprobarCuenta = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { token } = req.query;
    const perfil = await authService.aprobarCuenta(userId, token);
    res
      .status(200)
      .type('html')
      .send(
        paginaResultado(
          '✓ Cuenta aprobada',
          `La cuenta de <strong>${perfil.nombre}</strong> (${perfil.correo_electronico}) fue aprobada. Ya puede iniciar sesión.`,
          '#16a34a',
        ),
      );
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .type('html')
        .send(paginaResultado('✗ No se pudo aprobar', error.message, '#dc2626'));
    }
    next(error);
  }
};

const rechazarCuenta = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { token } = req.query;
    const perfil = await authService.rechazarCuenta(userId, token);
    res
      .status(200)
      .type('html')
      .send(
        paginaResultado(
          '✗ Cuenta rechazada',
          `La cuenta de <strong>${perfil.nombre}</strong> (${perfil.correo_electronico}) fue rechazada. El usuario no podrá iniciar sesión.`,
          '#dc2626',
        ),
      );
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .type('html')
        .send(paginaResultado('✗ No se pudo rechazar', error.message, '#dc2626'));
    }
    next(error);
  }
};

// ─────────────────────────────────────────────
//  RECUPERACIÓN DE CONTRASEÑA
// ─────────────────────────────────────────────

// Etapa 1: el usuario ingresa su correo para recibir el código de verificación.
const solicitarRecuperacion = async (req, res, next) => {
  try {
    const { correo } = req.body;
    if (!correo || !correo.includes('@')) {
      throw errorValidacion('Ingresa un correo válido.');
    }

    await authService.solicitarRecuperacion(correo.trim());

    res.status(200).json({
      success: true,
      mensaje: 'Te enviamos un código de verificación a tu correo.',
    });
  } catch (error) {
    next(error);
  }
};

// Etapa 1.5: verifica el código de 6 dígitos y entrega el token de reset con
// el que la página /restablecer permite definir la nueva contraseña.
const verificarCodigoRecuperacion = async (req, res, next) => {
  try {
    const { correo, codigo } = req.body;
    if (!correo || !correo.includes('@')) {
      throw errorValidacion('Ingresa un correo válido.');
    }
    if (!codigo || !/^\d{6}$/.test(String(codigo).trim())) {
      throw errorValidacion('El código debe tener 6 dígitos.');
    }

    const data = await authService.verificarCodigoDeRecuperacion(correo.trim(), String(codigo).trim());
    res.status(200).json({ success: true, data, mensaje: 'Código verificado.' });
  } catch (error) {
    next(error);
  }
};

// Etapa 2: con el token del correo, se define la nueva contraseña.
const restablecerContrasena = async (req, res, next) => {
  try {
    const { uid, token, contrasena } = req.body;
    if (!uid || !token) throw errorValidacion('Enlace de restablecimiento incompleto.');

    const errorPass = validarContrasena(contrasena);
    if (errorPass) throw errorValidacion(errorPass);

    await authService.restablecerContrasena(uid, token, contrasena);
    res.status(200).json({
      success: true,
      mensaje: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
//  PERFIL DEL USUARIO ACTUAL
// ─────────────────────────────────────────────
// Devuelve el perfil (con su rol) del usuario autenticado. El middleware de
// autenticación ya carga req.user.profile con el join a roles(nombre).
const obtenerPerfil = async (req, res) => {
  // Incluye los datos autodeclarados (carreras, facultad, año) que viven en el
  // user_metadata de Auth, además del perfil de la tabla 'usuarios'.
  const data = { ...(req.user.profile || {}), metadata: req.user.user_metadata || {} };
  res.status(200).json({ success: true, data });
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

module.exports = {
  verificarCorreoExiste,
  registerEstudiante,
  registerExalumno,
  login,
  solicitarMagicLink,
  verificarMagicLink,
  completarPerfil,
  aprobarCuenta,
  rechazarCuenta,
  confirmarExalumno,
  solicitarRecuperacion,
  verificarCodigoRecuperacion,
  restablecerContrasena,
  obtenerPerfil,
};