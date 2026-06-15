// Llamadas al backend para la Sección 1 (Información Académica) y Sección 2
// (Situación Socioeconómica) del perfil de estudiante (RF-03). Cubren los
// catálogos (facultades, carreras, sedes, niveles académicos, becas) y los
// registros del estudiante en informacion_estudiante y carreras_usuario.

import { apiFetch } from './api';

/** Catálogo de facultades. */
export async function obtenerFacultades(token) {
  const res = await apiFetch('/facultades', { token });
  return res?.data ?? [];
}

/** Catálogo completo de carreras (incluye id_facultad para filtrar en el cliente). */
export async function obtenerCarreras(token) {
  const res = await apiFetch('/carreras', { token });
  return res?.data ?? [];
}

/** Catálogo de sedes UCR. */
export async function obtenerSedesUcr(token) {
  const res = await apiFetch('/sedes-ucr', { token });
  return res?.data ?? [];
}

/** Catálogo de niveles académicos (Bachillerato, Licenciatura, Maestría...). */
export async function obtenerNivelesAcademicos(token) {
  const res = await apiFetch('/niveles-academicos', { token });
  return res?.data ?? [];
}

/** Catálogo de niveles de beca socioeconómica. */
export async function obtenerBecasSocioeconomicas(token) {
  const res = await apiFetch('/becas-socioeconomicas', { token });
  return res?.data ?? [];
}

/** Información académica del estudiante autenticado, o null si aún no existe. */
export async function obtenerInformacionEstudiante(token, idUsuario) {
  try {
    const res = await apiFetch(`/informacion-estudiantes/usuario/${idUsuario}`, { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

/** Crea (si no existe) o actualiza la fila de informacion_estudiante. */
export async function guardarInformacionEstudiante(token, datos, existe) {
  if (existe) {
    const res = await apiFetch(`/informacion-estudiantes/usuario/${datos.id_usuario}`, {
      method: 'PUT',
      token,
      body: datos,
    });
    return res?.data;
  }
  const res = await apiFetch('/informacion-estudiantes', {
    method: 'POST',
    token,
    body: datos,
  });
  return res?.data;
}

/** Carrera/sede del estudiante ya guardada, o null si aún no existe. */
export async function obtenerCarreraDelEstudiante(token, idUsuario) {
  const res = await apiFetch(`/carreras-usuarios/usuario/${idUsuario}`, { token });
  const relaciones = res?.data ?? [];
  return relaciones[0] ?? null;
}

/** Crea o actualiza la relación carrera/sede/año de graduación del estudiante. */
export async function guardarCarreraEstudiante(token, datos, relacionExistente) {
  if (relacionExistente) {
    const res = await apiFetch(`/carreras-usuarios/${relacionExistente.id}`, {
      method: 'PUT',
      token,
      body: datos,
    });
    return res?.data;
  }
  const res = await apiFetch('/carreras-usuarios', {
    method: 'POST',
    token,
    body: datos,
  });
  return res?.data;
}
