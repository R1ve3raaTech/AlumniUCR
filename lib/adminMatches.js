// lib/adminMatches.js
// Capa de datos para la gestión de matches del admin (RF-08.1). El BE ya expone
// todo lo necesario:
//   - GET  /api/admin/matches?estado=&fecha_desde=&fecha_hasta=
//       Devuelve los matches con los nombres de exalumno/estudiante y el flag
//       `alerta_seguimiento` (true si el match lleva > 6 meses activo).
//   - PUT  /api/matches-mentoria/:id
//       El admin actualiza `estado` y/o `notas_admin`.

import { apiFetch } from './api';

/** Matches con alerta de seguimiento. Acepta filtros opcionales por estado y fechas. */
export async function obtenerMatchesAdmin(token, { estado, fechaDesde, fechaHasta } = {}) {
  const qs = new URLSearchParams();
  if (estado) qs.set('estado', estado);
  if (fechaDesde) qs.set('fecha_desde', fechaDesde);
  if (fechaHasta) qs.set('fecha_hasta', fechaHasta);
  const sufijo = qs.toString() ? `?${qs.toString()}` : '';
  const res = await apiFetch(`/admin/matches${sufijo}`, { token });
  return Array.isArray(res) ? res : res?.data ?? [];
}

/** Admin actualiza un match: { estado?, notas_admin? }. */
export async function actualizarMatchAdmin(token, id, datos) {
  return apiFetch(`/matches-mentoria/${id}`, { method: 'PUT', token, body: datos });
}
