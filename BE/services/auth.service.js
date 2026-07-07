const supabase = require('../config/supabase');
const supabaseAuth = require('../config/supabaseAuth');
const { mapDbError } = require('../utils/dbError');
const { generarToken, verificarToken, codigoRecuperacion, verificarCodigoRecuperacion } = require('../utils/aprobacionToken');
const {
  enviarCorreoAprobacion,
  enviarCorreoRecuperacion,
  enviarCorreoConfirmacionExalumno,
} = require('./email.service');

// Mapa de rol (string del endpoint) -> id_rol en la tabla 'roles'
// (1 = Estudiante, 2 = Exalumno).
const ROLES = { estudiante: 1, exalumno: 2 };

// Nombre legible del rol para los correos de aprobación.
const NOMBRE_ROL = { estudiante: 'Estudiante', exalumno: 'Exalumno' };

// URL del frontend a la que apunta el magic link (ruta que procesa el token_hash).
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// URL pública del backend, base de los enlaces de aprobar/rechazar del correo.
const BACKEND_URL = process.env.APP_BACKEND_URL || 'http://localhost:5000';

/**
 * Envía al correo aprobador los enlaces para aprobar o rechazar una cuenta
 * recién registrada. No interrumpe el registro si el correo falla.
 */
const notificarAprobacion = async (perfil, rol) => {
  const token = generarToken(perfil.id);
  const aprobarUrl = `${BACKEND_URL}/api/auth/aprobar/${perfil.id}?token=${token}`;
  const rechazarUrl = `${BACKEND_URL}/api/auth/rechazar/${perfil.id}?token=${token}`;
  await enviarCorreoAprobacion({
    nombre: perfil.nombre,
    correo: perfil.correo_electronico,
    rol: NOMBRE_ROL[rol] || 'Usuario',
    aprobarUrl,
    rechazarUrl,
  });
};

const registerUser = async (correo, contrasena, rol) => {
  // 1. Registrar en Supabase Auth
  const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
    email: correo,
    password: contrasena,
  });
  if (authError) {
    authError.statusCode = authError.message?.includes('already') ? 409 : 400;
    throw authError;
  }

  // 2. Insertar el perfil en la tabla 'usuarios' usando el UUID de Auth.
  //    Las columnas reales son correo_electronico e id_rol (FK a 'roles').
  //    'nombre' es obligatorio: se inicializa con la parte local del correo
  //    y el usuario lo completa luego en su perfil. 'confirmado' y 'estado'
  //    se omiten porque la base de datos tiene valores por defecto.
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .insert([
      {
        id: authData.user.id, // Vincula con el Auth de Supabase
        nombre: correo.split('@')[0],
        correo_electronico: correo,
        id_rol: ROLES[rol] ?? ROLES.estudiante,
        // La cuenta nace pendiente: requiere aprobación desde el correo.
        confirmado: false,
        estado: 'pendiente',
      },
    ])
    .select()
    .single();
  if (userError) throw mapDbError(userError);

  // 3. Notificar al aprobador (no bloquea el registro si el correo falla).
  await notificarAprobacion(userData, rol);

  return { auth: authData.user, perfil: userData };
};

/**
 * Registro directo de estudiante (correo @ucr.ac.cr + contraseña). A diferencia
 * del exalumno, el estudiante NO requiere aprobación del administrador: la cuenta
 * nace ACTIVA y confirmada. Devuelve una sesión para el auto-login inmediato.
 */
const registrarEstudianteAutodeclaracion = async ({ correo, contrasena, nombre }) => {
  const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
    email: correo,
    password: contrasena,
    options: { data: { rol: 'estudiante', nombre } },
  });
  if (authError) {
    authError.statusCode = authError.message?.includes('already') ? 409 : 400;
    throw authError;
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .upsert(
      {
        id: authData.user.id,
        nombre: (nombre || correo.split('@')[0]).trim(),
        correo_electronico: correo,
        id_rol: ROLES.estudiante,
        confirmado: true,
        estado: 'activo',
      },
      { onConflict: 'id' },
    )
    .select()
    .single();
  if (perfilError) throw mapDbError(perfilError);

  // Auto-login: sesión inmediata para entrar directo al panel tras el registro.
  let sesion = null;
  try {
    const { data: login } = await supabaseAuth.auth.signInWithPassword({ email: correo, password: contrasena });
    if (login?.session) sesion = { token: login.session.access_token, user: login.user };
  } catch { /* si falla, el front cae al login normal */ }

  return { perfil, sesion };
};

/**
 * Registro de exalumno por autodeclaración (RF). Crea la cuenta con correo +
 * contraseña y guarda los datos académicos autodeclarados en el user_metadata
 * de Auth (carreras, escuela/facultad, año de graduación). La cuenta queda
 * PENDIENTE y NO CONFIRMADA: requiere confirmar el correo para activarse.
 */
const registrarExalumnoAutodeclaracion = async ({
  correo,
  contrasena,
  nombre,
  carreras,
  facultad,
  anioGraduacion,
}) => {
  // 1. Crear el usuario en Supabase Auth con los datos autodeclarados.
  const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      data: {
        rol: 'exalumno',
        nombre,
        carreras,
        escuela_facultad: facultad,
        anio_graduacion: anioGraduacion,
      },
    },
  });
  if (authError) {
    authError.statusCode = authError.message?.includes('already') ? 409 : 400;
    throw authError;
  }

  // 2. Crear el perfil en 'usuarios'. Nace pendiente y sin confirmar: no podrá
  //    iniciar sesión ni aparecer en el directorio hasta confirmar el correo.
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .upsert(
      {
        id: authData.user.id,
        nombre: nombre.trim(),
        correo_electronico: correo,
        id_rol: ROLES.exalumno,
        confirmado: false,
        estado: 'pendiente',
      },
      { onConflict: 'id' },
    )
    .select()
    .single();
  if (perfilError) throw mapDbError(perfilError);

  // 3. Enviar el correo de confirmación con un enlace firmado (scope 'confirm').
  //    No se hace await: el envío no debe bloquear ni demorar la respuesta del
  //    registro (la función captura sus propios errores y registra el enlace).
  const token = generarToken(perfil.id, 'confirm');
  const url = `${BACKEND_URL}/api/auth/confirmar-exalumno/${perfil.id}?token=${token}`;
  enviarCorreoConfirmacionExalumno({ nombre: nombre.trim(), correo, url }).catch(() => {});

  // Auto-login: se devuelve una sesión para que el registro entre directo al
  // panel, sin re-escribir credenciales ni esperar el correo. La cuenta queda
  // 'pendiente'; el panel muestra el aviso de revisión hasta la aprobación.
  let sesion = null;
  try {
    const { data: login } = await supabaseAuth.auth.signInWithPassword({ email: correo, password: contrasena });
    if (login?.session) sesion = { token: login.session.access_token, user: login.user };
  } catch { /* si falla, el front cae al flujo normal de confirmación/login */ }

  // Se devuelve la URL de confirmación; el controlador decide si exponerla
  // (solo en desarrollo, como respaldo cuando el correo no se entrega).
  return { perfil, confirmUrl: url, sesion };
};

/**
 * Confirma la cuenta de un exalumno desde el enlace del correo: valida el token
 * firmado y marca el perfil como confirmado y activo.
 */
const confirmarExalumno = async (userId, token) => {
  if (!verificarToken(userId, token, 'confirm')) {
    const err = new Error('Enlace de confirmación inválido o expirado.');
    err.statusCode = 403;
    throw err;
  }

  const { data: perfil, error } = await supabase
    .from('usuarios')
    .update({ confirmado: true, estado: 'pendiente' })
    .eq('id', userId)
    .select('nombre, correo_electronico')
    .maybeSingle();
  if (error) throw error;
  if (!perfil) {
    const err = new Error('La cuenta indicada no existe.');
    err.statusCode = 404;
    throw err;
  }
  return perfil;
};

const loginUser = async (correo, contrasena) => {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });
  if (error) {
    error.statusCode = 401;
    throw error;
  }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('estado')
    .eq('id', data.user.id)
    .maybeSingle();

  // Un usuario de Auth sin fila en 'usuarios' no es una cuenta de la plataforma
  // (p. ej. registro que nunca completó el perfil): no debe obtener sesión.
  if (!perfil) {
    const err = new Error('Tu cuenta no completó el registro. Registrate de nuevo para continuar.');
    err.statusCode = 403;
    throw err;
  }

  // Solo se bloquea a cuentas rechazadas o suspendidas. Las cuentas 'pendiente'
  // SÍ inician sesión y entran a su panel, que muestra el aviso de "cuenta en
  // revisión" y mantiene bloqueadas las acciones hasta que el admin apruebe
  // (misma experiencia que ya tenía el estudiante recién registrado).
  if (perfil.estado === 'rechazado' || perfil.estado === 'suspendido') {
    const mensajes = {
      rechazado: 'Tu solicitud de cuenta fue rechazada. Contacta a la administración.',
      suspendido: 'Tu cuenta ha sido suspendida por la administración.',
    };
    const err = new Error(mensajes[perfil.estado]);
    err.statusCode = 403;
    throw err;
  }

  return {
    token: data.session.access_token,
    user: data.user,
  };
};

// ─── Flujo de verificación por Magic Link ────────────────────────────────

/**
 * Etapa 1: envía un magic link al correo. El rol se guarda en user_metadata
 * para recuperarlo al completar el perfil. Crea el usuario en Auth si no existe.
 */
const solicitarMagicLink = async (correo, rol) => {
  const { error } = await supabaseAuth.auth.signInWithOtp({
    email: correo,
    options: {
      shouldCreateUser: true,
      data: { rol },
      emailRedirectTo: `${FRONTEND_URL}/auth/confirmar`,
    },
  });
  if (error) throw error;

  // En desarrollo, además generamos un enlace directo y devolvemos su token_hash
  // para poder confirmar la cuenta SIN depender del correo: los clientes de
  // correo (Gmail, antivirus) suelen "pre-cargar" el magic link de un solo uso
  // y consumirlo antes de que la persona haga clic. No se usa en producción.
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { data } = await supabase.auth.admin.generateLink({ type: 'magiclink', email: correo });
      const tokenHash = data?.properties?.hashed_token;
      if (tokenHash) return { enviado: true, token_hash: tokenHash };
    } catch {
      // Si falla, se mantiene el flujo normal por correo.
    }
  }
  return { enviado: true };
};

/**
 * Etapa 2: verifica el token_hash del magic link y devuelve la sesión.
 * Es stateless (no requiere cookies ni PKCE), por eso encaja en el backend.
 */
const verificarMagicLink = async (token_hash) => {
  const { data, error } = await supabaseAuth.auth.verifyOtp({
    token_hash,
    type: 'magiclink',
  });
  if (error) throw error;
  return {
    token: data.session.access_token,
    user: data.user,
  };
};

/**
 * Etapa 3: con la sesión del paso 2, define la contraseña y crea/actualiza el
 * perfil en 'usuarios'. El id del usuario se obtiene del token (no del body).
 */
const completarPerfil = async (token, nombre, contrasena) => {
  // Identificar al usuario de forma segura a partir de su token de sesión.
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    const err = new Error('Tu sesión expiró. Vuelve a verificar tu correo.');
    err.statusCode = 401;
    throw err;
  }
  const user = userData.user;

  // Establecer la contraseña (requiere la service_role key).
  const { error: passError } = await supabase.auth.admin.updateUserById(user.id, {
    password: contrasena,
  });
  if (passError) throw passError;

  // Crear o actualizar el perfil con las columnas reales de la tabla.
  // La cuenta queda PENDIENTE: no podrá iniciar sesión hasta que la
  // administración la apruebe desde el correo de verificación.
  const rol = user.user_metadata?.rol;
  const rolNormalizado = rol === 'exalumno' ? 'exalumno' : 'estudiante';
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .upsert(
      {
        id: user.id,
        nombre: nombre.trim(),
        correo_electronico: user.email,
        id_rol: ROLES[rolNormalizado],
        confirmado: false,
        estado: 'pendiente',
      },
      { onConflict: 'id' },
    )
    .select()
    .single();
  if (perfilError) throw perfilError;

  // Notificar al aprobador con los enlaces de aprobar/rechazar.
  await notificarAprobacion(perfil, rolNormalizado);

  return { perfil };
};

// ─── Aprobación de cuentas (método de verificación) ──────────────────────

/**
 * Aprueba una cuenta pendiente: valida el token firmado del enlace y marca el
 * perfil como activo y confirmado. Idempotente: aprobar dos veces no falla.
 */
const aprobarCuenta = async (userId, token) => {
  if (!verificarToken(userId, token)) {
    const err = new Error('Enlace de aprobación inválido o alterado.');
    err.statusCode = 403;
    throw err;
  }

  const { data: perfil, error } = await supabase
    .from('usuarios')
    .update({ estado: 'activo', confirmado: true })
    .eq('id', userId)
    .select('nombre, correo_electronico')
    .maybeSingle();
  if (error) throw error;
  if (!perfil) {
    const err = new Error('La cuenta indicada no existe.');
    err.statusCode = 404;
    throw err;
  }
  return perfil;
};

/**
 * Rechaza una cuenta pendiente: valida el token y marca el perfil como rechazado
 * (el usuario no podrá iniciar sesión).
 */
const rechazarCuenta = async (userId, token) => {
  if (!verificarToken(userId, token)) {
    const err = new Error('Enlace de rechazo inválido o alterado.');
    err.statusCode = 403;
    throw err;
  }

  const { data: perfil, error } = await supabase
    .from('usuarios')
    .update({ estado: 'rechazado', confirmado: false })
    .eq('id', userId)
    .select('nombre, correo_electronico')
    .maybeSingle();
  if (error) throw error;
  if (!perfil) {
    const err = new Error('La cuenta indicada no existe.');
    err.statusCode = 404;
    throw err;
  }
  return perfil;
};

// ─── Recuperación de contraseña ──────────────────────────────────────────

/**
 * Etapa 1: el usuario pide restablecer su contraseña desde su correo.
 * Envía un código de verificación de 6 dígitos (vigencia ~10-15 min).
 * Si el correo no está registrado, responde 404 para avisarle a la persona
 * (decisión de producto: se prefiere el aviso claro sobre ocultar si existe).
 */
const solicitarRecuperacion = async (correo) => {
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('id, correo_electronico')
    .eq('correo_electronico', correo)
    .maybeSingle();

  if (!perfil) {
    const err = new Error('No encontramos una cuenta registrada con ese correo. Revisá que esté bien escrito.');
    err.statusCode = 404;
    throw err;
  }

  const codigo = codigoRecuperacion(perfil.id);
  await enviarCorreoRecuperacion({ correo: perfil.correo_electronico, codigo });

  return { enviado: true };
};

/**
 * Etapa 1.5: verifica el código de 6 dígitos que llegó por correo. Si es
 * válido, devuelve uid + token firmado (scope 'reset') con los que la página
 * /restablecer permite definir la nueva contraseña.
 */
const verificarCodigoDeRecuperacion = async (correo, codigo) => {
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('id')
    .eq('correo_electronico', correo)
    .maybeSingle();

  // Mensaje uniforme: no revela si el correo está registrado o no.
  if (!perfil || !verificarCodigoRecuperacion(perfil.id, codigo)) {
    const err = new Error('Código incorrecto o expirado. Verificá el código o solicitá uno nuevo.');
    err.statusCode = 400;
    throw err;
  }

  return { uid: perfil.id, token: generarToken(perfil.id, 'reset') };
};

/**
 * Etapa 2: valida el token firmado (scope 'reset') y define la nueva
 * contraseña usando la service_role key.
 */
const restablecerContrasena = async (uid, token, contrasena) => {
  if (!verificarToken(uid, token, 'reset')) {
    const err = new Error('Enlace de restablecimiento inválido o expirado.');
    err.statusCode = 403;
    throw err;
  }

  const { error } = await supabase.auth.admin.updateUserById(uid, {
    password: contrasena,
  });
  if (error) {
    error.statusCode = 400;
    throw error;
  }

  return { actualizado: true };
};

module.exports = {
  registerUser,
  registrarEstudianteAutodeclaracion,
  registrarExalumnoAutodeclaracion,
  confirmarExalumno,
  loginUser,
  solicitarMagicLink,
  verificarMagicLink,
  completarPerfil,
  aprobarCuenta,
  rechazarCuenta,
  solicitarRecuperacion,
  verificarCodigoDeRecuperacion,
  restablecerContrasena,
};