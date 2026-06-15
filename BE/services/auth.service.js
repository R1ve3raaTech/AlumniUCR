const supabase = require('../config/supabase');
const supabaseAuth = require('../config/supabaseAuth');
const { mapDbError } = require('../utils/dbError');

// Mapa de rol (string del endpoint) -> id_rol en la tabla 'roles'
// (1 = Estudiante, 2 = Exalumno).
const ROLES = { estudiante: 1, exalumno: 2 };

// URL del frontend a la que apunta el magic link (ruta que procesa el token_hash).
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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
      },
    ])
    .select()
    .single();
  if (userError) throw mapDbError(userError);

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
  const rol = user.user_metadata?.rol;
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .upsert(
      {
        id: user.id,
        nombre: nombre.trim(),
        correo_electronico: user.email,
        id_rol: ROLES[rol] ?? ROLES.estudiante,
        confirmado: true,
      },
      { onConflict: 'id' },
    )
    .select()
    .single();
  if (perfilError) throw perfilError;

  return { perfil };
};

module.exports = {
  registerUser,
  loginUser,
  solicitarMagicLink,
  verificarMagicLink,
  completarPerfil,
};