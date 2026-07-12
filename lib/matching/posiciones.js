// lib/posiciones.js
// Capa de datos de posiciones de empleo/pasantía (RF-10). El BE ya está completo:
//   GET  /puestos-empleo/activos        — directorio (admin, estudiante, exalumno)
//   GET  /puestos-empleo/usuario/:id    — posiciones de un exalumno (mis posiciones)
//   GET  /puestos-empleo/:id            — detalle
//   POST /puestos-empleo                — crear (exalumno/admin)
//   PUT  /puestos-empleo/:id            — actualizar (pausar/cerrar/editar)

import { apiFetch } from '../api';

const arr = (res) => (Array.isArray(res) ? res : res?.data ?? []);

/** Posiciones activas (no pausadas, no vencidas) para el directorio. */
export async function obtenerPosicionesActivas(token) {
  return arr(await apiFetch('/puestos-empleo/activos', { token }));
}

/** Posiciones publicadas por un exalumno (incluye pausadas/cerradas). */
export async function obtenerMisPosiciones(token, idUsuario) {
  return arr(await apiFetch(`/puestos-empleo/usuario/${idUsuario}`, { token }));
}

/** Detalle de una posición. */
export async function obtenerPosicion(token, id) {
  const res = await apiFetch(`/puestos-empleo/${id}`, { token });
  return res?.data ?? res;
}

/** Crea una posición (rol exalumno). Requiere al menos id_usuario y titulo_puesto. */
export async function crearPosicion(token, datos) {
  return apiFetch('/puestos-empleo', { method: 'POST', token, body: datos });
}

/** Actualiza una posición: pausar, cerrar o editar campos. */
export async function actualizarPosicion(token, id, datos) {
  return apiFetch(`/puestos-empleo/${id}`, { method: 'PUT', token, body: datos });
}

/** Catálogo de áreas temáticas (para clasificar la posición). */
export async function obtenerAreas(token) {
  return arr(await apiFetch('/areas-interes', { token }));
}
