// Cliente del frontend para los reportes (denuncias / quejas / sugerencias).
// El estudiante crea y ve los suyos; el administrador los lista y gestiona.

import { apiFetch } from './api';

/** Envía un reporte (requiere sesión). */
export async function enviarReporte(token, payload) {
  return apiFetch('/reportes-anomalias', { method: 'POST', token, body: payload });
}

/** Historial de reportes del propio estudiante. */
export async function misReportes(token) {
  try {
    const res = await apiFetch('/reportes-anomalias/mios', { token });
    return res?.data ?? [];
  } catch {
    return [];
  }
}

/** Lista todos los reportes (solo administrador). */
export async function listarReportes(token) {
  const res = await apiFetch('/reportes-anomalias', { token });
  return Array.isArray(res) ? res : res?.data ?? [];
}

/** Cambia el estado de un reporte (solo administrador). */
export async function marcarReporte(token, id, estado) {
  return apiFetch(`/reportes-anomalias/${id}`, { method: 'PATCH', token, body: { estado } });
}
