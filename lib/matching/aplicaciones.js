// lib/aplicaciones.js
// Capa de datos del proceso de aplicación a posiciones (RF-13). BE completo:
//   POST   /aplicantes                       — estudiante aplica (id_empleo, mensaje_presentacion)
//   GET    /aplicantes/mis-aplicaciones      — historial del estudiante
//   DELETE /aplicantes/:id/retirar           — retirar (solo si estado='enviada')
//   GET    /aplicantes/posicion/:idPosicion  — exalumno ve aplicantes de su posición
//   PUT    /aplicantes/:id                    — exalumno cambia estado
//   PUT    /aplicantes/:id/seleccionar        — exalumno selecciona candidato (notifica)

import { apiFetch } from '../api';

const arr = (res) => (Array.isArray(res) ? res : res?.data ?? []);

/** Estudiante aplica a una posición. */
export async function aplicarAPosicion(token, idEmpleo, mensajePresentacion) {
  return apiFetch('/aplicantes', {
    method: 'POST', token,
    body: { id_empleo: idEmpleo, mensaje_presentacion: mensajePresentacion || null },
  });
}

/** Historial de aplicaciones del estudiante autenticado. */
export async function obtenerMisAplicaciones(token) {
  return arr(await apiFetch('/aplicantes/mis-aplicaciones', { token }));
}

/** Retira una aplicación (solo si está en estado 'enviada'). */
export async function retirarAplicacion(token, id) {
  return apiFetch(`/aplicantes/${id}/retirar`, { method: 'DELETE', token });
}

/** Aplicantes de una posición (vista del exalumno dueño). Incluye score si existe. */
export async function obtenerAplicantesPorPosicion(token, idPosicion) {
  return arr(await apiFetch(`/aplicantes/posicion/${idPosicion}`, { token }));
}

/** Exalumno cambia el estado de un aplicante: en_revision | seleccionado | descartado. */
export async function actualizarEstadoAplicante(token, id, estado) {
  return apiFetch(`/aplicantes/${id}`, { method: 'PUT', token, body: { estado } });
}

/** Exalumno selecciona al candidato (el BE notifica a todos los aplicantes). */
export async function seleccionarCandidato(token, id) {
  return apiFetch(`/aplicantes/${id}/seleccionar`, { method: 'PUT', token });
}
