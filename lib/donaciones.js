// lib/donaciones.js
// Capa de datos de donaciones (RF-07 / RF-08.2 / RF-08.3). Envuelve apiFetch igual
// que lib/directorioEstudiantes.js. Todas las funciones reciben el token primero.

import { apiFetch } from './api';

/** Todas las donaciones (solo admin). */
export async function obtenerDonaciones(token) {
  return apiFetch('/donaciones', { token });
}

/** Donaciones por estado: 'pendiente' | 'confirmada' | 'rechazada' (admin). */
export async function obtenerDonacionesPorEstado(token, estado) {
  return apiFetch(`/donaciones/estado/${estado}`, { token });
}

/**
 * Confirma o rechaza una donación.
 * NOTA: el PUT actual del BE solo persiste `estado`. La auditoría (confirmado_por,
 * fecha de acción) y el `motivo_rechazo` requieren un cambio de BE (pedido a Adri).
 * El `motivo` se envía igual para que enchufe automáticamente cuando el BE lo acepte.
 */
export async function actualizarEstadoDonacion(token, id, estado, motivo) {
  const body = { estado };
  if (motivo) body.motivo_rechazo = motivo;
  return apiFetch(`/donaciones/${id}`, { method: 'PUT', token, body });
}

/** Catálogo de métodos de pago (el nombre está en `descripcion`). */
export async function obtenerTiposPago(token) {
  return apiFetch('/tipos-pago', { token });
}

/** Usuarios (para resolver el nombre del donante a partir del id). */
export async function obtenerUsuarios(token) {
  return apiFetch('/users', { token });
}

/** Proyectos de graduación (para resolver el título a partir del id_proyecto). */
export async function obtenerProyectos(token) {
  return apiFetch('/proyectos-graduacion', { token });
}
