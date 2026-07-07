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

/** El propio voluntario consulta su solicitud y accesos otorgados. */
export async function obtenerMisAccesosVoluntario(token) {
  const res = await apiFetch('/voluntarios/mis-accesos', { token });
  return res?.data ?? null;
}

/** El propio voluntario edita su modalidad, disponibilidad y biografía. */
export async function actualizarMiPerfilVoluntario(token, datos) {
  const res = await apiFetch('/voluntarios/mi-perfil', { method: 'PUT', token, body: datos });
  return res?.data ?? null;
}

/** Otorga/actualiza los accesos a paneles de una solicitud (solo administrador). */
export async function actualizarAccesosVoluntario(token, id, accesos) {
  return apiFetch(`/voluntarios/${id}/accesos`, {
    method: 'PATCH',
    token,
    body: accesos,
  });
}
