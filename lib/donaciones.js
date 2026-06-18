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
 * Confirma o rechaza una donación usando los endpoints dedicados del BE, que
 * persisten la auditoría (`confirmado_por`) y el `motivo_rechazo`, y envían el
 * correo correspondiente (confirmación al exalumno / rechazo con motivo):
 *   - PUT /donaciones/:id/confirmar  (el admin sale del token, sin body)
 *   - PUT /donaciones/:id/rechazar   (body: { motivo_rechazo })
 */
export async function actualizarEstadoDonacion(token, id, estado, motivo) {
  if (estado === 'confirmada') {
    return apiFetch(`/donaciones/${id}/confirmar`, { method: 'PUT', token });
  }
  if (estado === 'rechazada') {
    return apiFetch(`/donaciones/${id}/rechazar`, { method: 'PUT', token, body: { motivo_rechazo: motivo } });
  }
  // Fallback genérico (no debería usarse para confirmar/rechazar).
  return apiFetch(`/donaciones/${id}`, { method: 'PUT', token, body: { estado } });
}

/**
 * Crea una donación (rol exalumno). RF-07.
 * El BE exige: id_usuario_exalumno, id_tipo_pago, monto>0, id_proyecto, moneda,
 * fecha_hora_transferencia y numero_referencia. `comprobante` (URL) y `mensaje`
 * son opcionales. Queda en estado 'pendiente' hasta que el admin la confirme.
 */
export async function crearDonacion(token, datos) {
  return apiFetch('/donaciones', { method: 'POST', token, body: datos });
}

/** Historial de donaciones del exalumno autenticado (rol exalumno/admin). */
export async function obtenerMisDonaciones(token, idUsuarioExalumno) {
  return apiFetch(`/donaciones/usuario/${idUsuarioExalumno}`, { token });
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
