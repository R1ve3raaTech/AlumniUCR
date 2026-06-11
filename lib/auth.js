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
