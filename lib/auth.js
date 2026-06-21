// Lógica de autenticación del frontend: habla con los endpoints /auth del backend
// y persiste la sesión (token + usuario) en localStorage. No contiene JSX ni estado
// de React; el estado vivo se gestiona en context/AuthContext.tsx.

import { apiFetch } from './api';

const STORAGE_KEY = 'ct_auth';

// La sesión expira tras 30 días de inactividad (RF-01.3).
const INACTIVIDAD_MAX_MS = 30 * 24 * 60 * 60 * 1000;

// ─── Persistencia de sesión ──────────────────────────────────────────────

/**
 * Devuelve { token, user } guardados, o null si no hay sesión / expiró por
 * inactividad. Cada lectura renueva la marca de actividad (sesión deslizante).
 */
export function getStoredSession() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    // Expira tras 30 días sin actividad.
    if (session.lastActivity && Date.now() - session.lastActivity > INACTIVIDAD_MAX_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Renueva la marca de actividad.
    session.lastActivity = Date.now();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  } catch {
    return null;
  }
}

export function getToken() {
  return getStoredSession()?.token ?? null;
}


function saveSession(session) {
  if (typeof window === 'undefined') return;
  // Marca de actividad para la expiración por inactividad (30 días).
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, lastActivity: Date.now() }));
}

export function logout() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Extrae { id, email } del payload de un JWT de Supabase (sin validar firma). */
function decodificarUsuarioJWT(accessToken) {
  try {
    const base64 = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

/**
 * Guarda una sesión a partir de un access_token recibido en el fragmento de la
 * URL (flujo implícito del magic link con la plantilla por defecto de Supabase).
 */
export function establecerSesionConToken(accessToken) {
  const user = decodificarUsuarioJWT(accessToken);
  const session = { token: accessToken, user };
  saveSession(session);
  return session;
}

// ─── Llamadas al backend ─────────────────────────────────────────────────

/** Inicia sesión y persiste la sesión. Devuelve { token, user }. */
export async function login(correo, contrasena) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { correo, contrasena },
  });
  if (!data?.token) {
    throw new Error('Respuesta de inicio de sesión inválida del servidor.');
  }
  const session = { token: data.token, user: data.user };
  saveSession(session);
  return session;
}

/**
 * Registra un usuario. El rol determina el endpoint del backend, que fija el rol
 * de forma segura en el servidor (no se envía en el body).
 *
 * @param {'estudiante'|'exalumno'} rol
 */
export async function register(rol, correo, contrasena) {
  const endpoint =
    rol === 'exalumno' ? '/auth/register/exalumno' : '/auth/register/estudiante';
  return apiFetch(endpoint, {
    method: 'POST',
    body: { correo, contrasena },
  });
}

/**
 * Registro de exalumno por autodeclaración. Envía correo, nombre, contraseña y
 * los datos académicos; la cuenta queda pendiente hasta confirmar el correo.
 */
export async function registrarExalumno(payload) {
  return apiFetch('/auth/register/exalumno', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Verifica si ya existe una cuenta registrada con ese correo (determinante del
 * registro). Devuelve true si la persona ya está registrada.
 */
export async function correoYaRegistrado(correo) {
  try {
    const res = await apiFetch(`/auth/correo-existe?correo=${encodeURIComponent(correo)}`);
    return Boolean(res?.existe);
  } catch {
    return false; // ante un fallo de red, no bloqueamos el registro
  }
}

// ─── Flujo de verificación por Magic Link ────────────────────────────────

/** Etapa 1: solicita el envío del magic link al correo @ucr.ac.cr. */
export async function solicitarMagicLink(rol, correo) {
  return apiFetch('/auth/magic-link/solicitar', {
    method: 'POST',
    body: { correo, rol },
  });
}

/** Etapa 2: verifica el token_hash del magic link y persiste la sesión. */
export async function verificarMagicLink(token_hash) {
  const data = await apiFetch('/auth/magic-link/verificar', {
    method: 'POST',
    body: { token_hash },
  });
  if (!data?.token) {
    throw new Error('No se pudo verificar tu correo. Solicita un nuevo enlace.');
  }
  const session = { token: data.token, user: data.user };
  saveSession(session);
  return session;
}

/** Etapa 3: define nombre y contraseña usando la sesión guardada en el paso 2. */
export async function completarPerfil(nombre, contrasena) {
  const token = getToken();
  if (!token) {
    throw new Error('Tu sesión expiró. Vuelve a verificar tu correo.');
  }
  return apiFetch('/auth/completar-perfil', {
    method: 'POST',
    token,
    body: { nombre, contrasena },
  });
}

/** Obtiene el perfil (con rol) del usuario autenticado. */
export async function obtenerPerfil(token) {
  return apiFetch('/auth/perfil', { token });
}

// ─── Recuperación de contraseña ──────────────────────────────────────────

/** Etapa 1: solicita el envío del enlace de restablecimiento al correo. */
export async function solicitarRecuperacion(correo) {
  return apiFetch('/auth/recuperar', {
    method: 'POST',
    body: { correo },
  });
}

/** Etapa 2: define la nueva contraseña con el uid y token recibidos por correo. */
export async function restablecerContrasena(uid, token, contrasena) {
  return apiFetch('/auth/restablecer', {
    method: 'POST',
    body: { uid, token, contrasena },
  });
}
