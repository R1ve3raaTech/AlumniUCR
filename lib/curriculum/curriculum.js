// lib/curriculum.js
// Capa de datos del Currículum Vitae del estudiante (RF-11). El BE expone el CV
// completo agregado y CRUD por sección:
//   GET    /cv/mi-curriculum                  — CV completo (4 secciones)
//   POST/PUT/DELETE /cv/experiencia[/:id]     — experiencia y proyectos
//   GET/POST/PUT    /cv/habilidades[/:id]     — habilidades e idiomas (fila única)
//   POST/PUT/DELETE /cv/certificaciones[/:id] — certificaciones y logros
//
// Varios campos se guardan como JSON-string en el BE (bullets, tecnicas, idiomas);
// estos helpers centralizan el parseo/serializado para que el resto del FE trabaje
// con arrays/objetos y nunca con strings crudos.

import { apiFetch } from '../api';

const unwrap = (res) => res?.data ?? res;
const arr = (res) => (Array.isArray(res) ? res : res?.data ?? []);

// ── Helpers de (de)serialización segura de los campos JSON ──────────────────
/** Convierte un JSON-string del BE en array; tolera null, ya-array y JSON inválido. */
export function parseJsonArray(valor) {
  if (Array.isArray(valor)) return valor;
  if (!valor || typeof valor !== 'string') return [];
  try { const v = JSON.parse(valor); return Array.isArray(v) ? v : []; }
  catch { return []; }
}
/** Serializa un array a JSON-string para el BE (o null si está vacío). */
export function toJsonString(array) {
  return array && array.length ? JSON.stringify(array) : null;
}

// ── CV completo ─────────────────────────────────────────────────────────────
export async function obtenerMiCurriculum(token) {
  return unwrap(await apiFetch('/cv/mi-curriculum', { token }));
}

// ── Experiencia ──────────────────────────────────────────────────────────────
export async function crearExperiencia(token, datos) {
  return unwrap(await apiFetch('/cv/experiencia', { method: 'POST', token, body: datos }));
}
export async function actualizarExperiencia(token, id, datos) {
  return unwrap(await apiFetch(`/cv/experiencia/${id}`, { method: 'PUT', token, body: datos }));
}
export async function eliminarExperiencia(token, id) {
  return apiFetch(`/cv/experiencia/${id}`, { method: 'DELETE', token });
}

// ── Habilidades (fila única: POST la primera vez, PUT después) ───────────────
export async function guardarHabilidades(token, datos, idExistente) {
  if (idExistente) return unwrap(await apiFetch(`/cv/habilidades/${idExistente}`, { method: 'PUT', token, body: datos }));
  return unwrap(await apiFetch('/cv/habilidades', { method: 'POST', token, body: datos }));
}

// ── Certificaciones ──────────────────────────────────────────────────────────
export async function crearCertificacion(token, datos) {
  return unwrap(await apiFetch('/cv/certificaciones', { method: 'POST', token, body: datos }));
}
export async function actualizarCertificacion(token, id, datos) {
  return unwrap(await apiFetch(`/cv/certificaciones/${id}`, { method: 'PUT', token, body: datos }));
}
export async function eliminarCertificacion(token, id) {
  return apiFetch(`/cv/certificaciones/${id}`, { method: 'DELETE', token });
}

// ── RF-12: Adaptación con IA y versiones ──────────────────────────────────────
/** Pide a la IA sugerencias para adaptar el CV a una posición.
 *  Devuelve { sugerencias: { sugerencias: [...], resumen }, cv_original, posicion }. */
export async function adaptarCvConIA(token, idPosicion) {
  return unwrap(await apiFetch(`/cv/adaptar/${idPosicion}`, { method: 'POST', token }));
}
/** Guarda una versión adaptada del CV (máx 10; upsert por posición). */
export async function guardarVersionCv(token, datos) {
  return unwrap(await apiFetch('/cv/versiones', { method: 'POST', token, body: datos }));
}
/** Lista las versiones adaptadas del estudiante. */
export async function obtenerVersionesCv(token) {
  return arr(await apiFetch('/cv/versiones', { token }));
}
/** Elimina una versión adaptada. */
export async function eliminarVersionCv(token, id) {
  return apiFetch(`/cv/versiones/${id}`, { method: 'DELETE', token });
}

// ── Indicador de completitud (RF-11) ─────────────────────────────────────────
/** Calcula % de completitud del CV y qué falta, sobre 5 secciones clave. */
export function calcularCompletitud(cv) {
  if (!cv) return { porcentaje: 0, items: [] };
  const a = cv.seccion1_academica || {};
  const hab = cv.seccion3_habilidades || {};
  const items = [
    { clave: 'academica', label: 'Información académica', ok: !!(a.carne || a.ano_ingreso || a.promedio_ponderado) },
    { clave: 'proyecto', label: 'Proyecto de graduación', ok: !!cv.seccion1_proyecto?.titulo_proyecto },
    { clave: 'experiencia', label: 'Experiencia o proyectos', ok: (cv.seccion2_experiencias || []).length > 0 },
    { clave: 'habilidades', label: 'Habilidades e idiomas', ok: !!(hab.tecnicas || hab.blandas || hab.idiomas) },
    { clave: 'certificaciones', label: 'Certificaciones', ok: (cv.seccion4_certificaciones || []).length > 0 },
  ];
  const ok = items.filter((i) => i.ok).length;
  return { porcentaje: Math.round((ok / items.length) * 100), items };
}
