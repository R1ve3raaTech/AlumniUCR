// Cliente del directorio de estudiantes y solicitudes de contacto (RF-03).

import { apiFetch } from '../api';

/** Directorio de estudiantes con perfil completo (exalumno/admin). */
export async function obtenerDirectorioEstudiantes(token) {
  return apiFetch('/estudiantes', { token });
}

/** Directorio público de proyectos (sin sesión; sin beca/correo/solicitud). */
export async function obtenerProyectosPublicos() {
  return apiFetch('/estudiantes/publico');
}

/** El exalumno solicita contacto con un estudiante. */
export async function solicitarContacto(token, idEstudiante, mensaje) {
  return apiFetch('/estudiantes/contacto', { method: 'POST', token, body: { idEstudiante, mensaje } });
}

/** Solicitudes de contacto recibidas por el estudiante. */
export async function obtenerSolicitudesRecibidas(token) {
  return apiFetch('/estudiantes/contacto/recibidas', { token });
}

/** El estudiante acepta o rechaza una solicitud. */
export async function responderSolicitudContacto(token, id, aceptar) {
  return apiFetch(`/estudiantes/contacto/${id}`, { method: 'PATCH', token, body: { aceptar } });
}
