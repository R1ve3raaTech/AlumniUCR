const supabase = require('../config/supabase');
const supabaseAuth = require('../config/supabaseAuth');
const { mapDbError } = require('../utils/dbError');
const { generarToken, verificarToken } = require('../utils/aprobacionToken');
const { enviarCorreoAprobacion } = require('./email.service');

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

const loginUser = async (correo, contrasena) => {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });
  if (error) {
    error.statusCode = 401;
    throw error;
  }

  // Bloquear el acceso si la cuenta aún no fue aprobada por la administración.
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('estado')
    .eq('id', data.user.id)
    .maybeSingle();

  if (perfil && perfil.estado !== 'activo') {
    const mensajes = {
      pendiente: 'Tu cuenta está pendiente de aprobación. Te avisaremos cuando sea aprobada.',
      rechazado: 'Tu solicitud de cuenta fue rechazada. Contacta a la administración.',
      suspendido: 'Tu cuenta ha sido suspendida por la administración.',
    };
    const err = new Error(mensajes[perfil.estado] || 'Tu cuenta no está activa.');
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

module.exports = {
  registerUser,
  loginUser,
  solicitarMagicLink,
  verificarMagicLink,
  completarPerfil,
  aprobarCuenta,
  rechazarCuenta,
};