// Lógica de autenticación del frontend: habla con los endpoints /auth del backend
// y persiste la sesión (token + usuario) en localStorage. No contiene JSX ni estado
// de React; el estado vivo se gestiona en context/AuthContext.tsx.

import { apiFetch } from './api';

const STORAGE_KEY = 'ct_auth';

// ─── Persistencia de sesión ──────────────────────────────────────────────

/** Devuelve { token, user } guardados, o null si no hay sesión / no hay window. */
export function getStoredSession() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken() {
  return getStoredSession()?.token ?? null;
}

export function getStoredUser() {
  return getStoredSession()?.user ?? null;
}

function saveSession(session) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function logout() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
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
