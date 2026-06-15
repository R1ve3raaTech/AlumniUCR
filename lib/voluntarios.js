// Cliente del frontend para las solicitudes de voluntarios/colaboradores
// (opción "Otros" del registro) y su gestión por el administrador.

import { apiFetch } from './api';

/** Envía el formulario público de colaboración. */
export async function enviarSolicitudVoluntario(payload) {
  return apiFetch('/voluntarios', {
    method: 'POST',
    body: payload,
  });
}

/** Lista las solicitudes (solo administrador). */
export async function listarSolicitudesVoluntarios(token) {
  return apiFetch('/voluntarios', { token });
}

/** Otorga/actualiza los accesos a paneles de una solicitud (solo administrador). */
export async function actualizarAccesosVoluntario(token, id, accesos) {
  return apiFetch(`/voluntarios/${id}/accesos`, {
    method: 'PATCH',
    token,
    body: accesos,
  });
}
