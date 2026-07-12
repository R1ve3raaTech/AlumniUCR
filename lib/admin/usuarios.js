// lib/usuarios.js
// Capa de datos para la gestión de usuarios del admin (RF-08). Envuelve apiFetch
// igual que lib/donaciones.js. Todas las funciones reciben el token primero.
//
// El BE ya soporta todo el ciclo: GET /users (admin), PUT /users/:id (cambia
// `estado`) y DELETE /users/:id (admin). El middleware de auth bloquea el login
// de los usuarios con estado 'suspendido', así que suspender es efectivo de
// inmediato sin tocar nada más del backend.

import { apiFetch } from '../api';

/** Lista de todos los usuarios con su rol (solo admin). Devuelve un array. */
export async function obtenerUsuarios(token) {
  const res = await apiFetch('/users', { token });
  // El endpoint devuelve el array directo; contemplamos ambas formas por robustez.
  return Array.isArray(res) ? res : res?.data ?? [];
}

/** Cambia el estado de un usuario: 'activo' | 'suspendido' | 'pendiente' | 'rechazado'. */
export async function cambiarEstadoUsuario(token, id, estado) {
  return apiFetch(`/users/${id}`, { method: 'PUT', token, body: { estado } });
}

/** Elimina un usuario de forma permanente (solo admin). */
export async function eliminarUsuario(token, id) {
  return apiFetch(`/users/${id}`, { method: 'DELETE', token });
}

/**
 * Donaciones pendientes de confirmación, ordenadas por antigüedad (RF-08.2).
 * Cada elemento trae `alerta_24h` (true si lleva > 24 h sin confirmar). Solo admin.
 */
export async function obtenerDonacionesPendientes(token) {
  const res = await apiFetch('/admin/donaciones/pendientes', { token });
  return Array.isArray(res) ? res : res?.data ?? [];
}
