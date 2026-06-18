// lib/misMatches.js
// Capa de datos + motor de scoring de /mis-matches (RF-06), calculado en el FE
// sobre los directorios existentes (sin tocar el BE). El ciclo de vida de la
// conexión reutiliza el flujo de contacto (RF-03): sugerido→contactado→activo.

import { apiFetch } from './api';

/** Directorio público de exalumnos con perfil completo (nombres, no ids). */
export async function obtenerDirectorioExalumnos() {
  return apiFetch('/perfil-exalumno/directorio');
}

// Se reexportan las funciones del flujo de contacto ya existente.
export {
  obtenerDirectorioEstudiantes,
  solicitarContacto,
  obtenerSolicitudesRecibidas,
  responderSolicitudContacto,
} from './directorioEstudiantes';

// ── Normalización para comparar por nombre (sin acentos, minúsculas) ──────────
const norm = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

// ¿Dos textos comparten una palabra significativa (>4 letras)? Se usa para el
// cruce sector profesional ↔ área temática, que tienen vocabularios distintos.
const compartenPalabra = (a, b) => {
  const pa = new Set(norm(a).split(/\W+/).filter((w) => w.length > 4));
  return norm(b)
    .split(/\W+/)
    .some((w) => w.length > 4 && pa.has(w));
};

/**
 * Score 0–100 entre un exalumno y un estudiante, según RF-06:
 *   - Misma carrera UCR: 30
 *   - Áreas de interés en común: 30 proporcional a la intersección
 *   - Sector del exalumno ↔ área temática del proyecto: 20
 *   - Tipo de apoyo ofrecido ↔ buscado: 20
 * exalumno: { carreras[], facultades[], sectores[], areas[], apoyo{...} }
 * estudiante: { carreras[], facultades[], areas[], busca{...} }
 */
export function calcularScore(exalumno, estudiante) {
  const exaCarreras = (exalumno.carreras || []).map(norm);
  const estCarreras = (estudiante.carreras || []).map(norm);
  const exaAreas = exalumno.areas || [];
  const estAreas = estudiante.areas || [];

  // 1) Misma carrera (30)
  const mismaCarrera = exaCarreras.some((c) => estCarreras.includes(c));
  const ptsCarrera = mismaCarrera ? 30 : 0;

  // 2) Áreas en común (30 proporcional)
  const comunes = exaAreas.filter((a) => estAreas.some((e) => norm(e) === norm(a)));
  const denom = Math.max(exaAreas.length, estAreas.length, 1);
  const ptsAreas = Math.round((30 * comunes.length) / denom);

  // 3) Sector ↔ área temática (20)
  const sectorMatch = (exalumno.sectores || []).some((sec) =>
    estAreas.some((a) => norm(sec) === norm(a) || compartenPalabra(sec, a)),
  );
  const ptsSector = sectorMatch ? 20 : 0;

  // 4) Tipo de apoyo ofrecido ↔ buscado (20)
  const ap = exalumno.apoyo || {};
  const bu = estudiante.busca || {};
  const apoyoMatch =
    (ap.mentoria && bu.mentoria) ||
    (ap.empleo && bu.empleo) ||
    (ap.pasantia && bu.pasantia) ||
    (ap.donacion && bu.financiamiento);
  const ptsApoyo = apoyoMatch ? 20 : 0;

  const score = Math.min(100, ptsCarrera + ptsAreas + ptsSector + ptsApoyo);

  // Interdisciplinario: facultades distintas entre exalumno y estudiante.
  const interdisciplinario =
    (exalumno.facultades || []).length > 0 &&
    (estudiante.facultades || []).length > 0 &&
    !(exalumno.facultades || []).some((f) =>
      (estudiante.facultades || []).some((g) => norm(f) === norm(g)),
    );

  return {
    score,
    comunes,
    mismaCarrera,
    sectorMatch,
    apoyoMatch,
    interdisciplinario,
    desglose: { carrera: ptsCarrera, areas: ptsAreas, sector: ptsSector, apoyo: ptsApoyo },
  };
}

/** Mapea el estado del contacto al estado del match (RF-06). */
export function estadoMatch(solicitud) {
  if (solicitud === 'aceptada') return 'activo';
  if (solicitud === 'pendiente') return 'contactado';
  if (solicitud === 'rechazada') return 'rechazada';
  return 'sugerido';
}
