// Cliente del frontend para el respaldo del perfil de onboarding en Supabase.
// Resiliente: si la tabla/endpoint aún no existe, no rompe (el Context cae a
// localStorage).

import { apiFetch } from './api';

/** Obtiene el perfil guardado en la BD (objeto) o null si no hay/no disponible. */
export async function obtenerPerfilOnboarding(token) {
  try {
    const res = await apiFetch('/perfil-onboarding', { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

/** Guarda (upsert) el perfil en la BD. Fire-and-forget; no propaga errores. */
export async function guardarPerfilOnboarding(token, datos) {
  try {
    await apiFetch('/perfil-onboarding', { method: 'PUT', token, body: { datos } });
    return true;
  } catch {
    return false;
  }
}
