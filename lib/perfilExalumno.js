// Cliente del Perfil de Exalumno (RF-02) y del directorio público.

import { apiFetch } from './api';

/** Catálogos para el formulario (sectores, áreas, facultades, carreras). */
export async function obtenerCatalogos(token) {
  return apiFetch('/perfil-exalumno/catalogos', { token });
}

/** Perfil del exalumno autenticado (datos + % de completitud). */
export async function obtenerMiPerfilExalumno(token) {
  return apiFetch('/perfil-exalumno', { token });
}

/** Guarda el perfil del exalumno. */
export async function guardarMiPerfilExalumno(token, datos) {
  return apiFetch('/perfil-exalumno', { method: 'PUT', token, body: datos });
}

/** Directorio público de exalumnos con perfil completo. */
export async function obtenerDirectorio() {
  return apiFetch('/perfil-exalumno/directorio');
}
