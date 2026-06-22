// Datos reales para el Centro de Matches del estudiante.
//  • Perfiles sugeridos = exalumnos reales del directorio (RF-02), puntuados
//    contra el perfil del estudiante (carrera, áreas, apoyo).
//  • Solicitudes = matches reales del motor RF-06 (/matches-mentoria/mis-matches).

import { apiFetch } from './api';
import { obtenerDirectorio } from './perfilExalumno';

const norm = (s) => String(s || '').toLowerCase().trim();

/** Puntúa un exalumno del directorio contra el perfil del estudiante (0-100). */
export function puntuar(perfil, exa) {
  let score = 0;
  const comunes = [];

  // Carrera UCR en común (30 pts).
  const miCarrera = norm(perfil.carrera);
  if (miCarrera && (exa.carreras || []).some((c) => norm(c).includes(miCarrera) || miCarrera.includes(norm(c)))) {
    score += 30;
  }

  // Áreas en común: proyecto + intereses vs áreas del exalumno (hasta 40 pts).
  const mias = new Set([...(perfil.proyectoAreas || []), ...(perfil.intereses || [])].map(norm).filter(Boolean));
  (exa.areas || []).forEach((a) => { if (mias.has(norm(a))) comunes.push(a); });
  if (mias.size) score += Math.round((comunes.length / mias.size) * 40);

  // Apoyo: lo que el estudiante busca y el exalumno ofrece (hasta 30 pts).
  let ap = 0;
  if (perfil.apoyo?.mentoria && exa.apoyo?.mentoria) ap += 10;
  if (perfil.apoyo?.pasantia && exa.apoyo?.pasantia) ap += 10;
  if (perfil.apoyo?.empleo && exa.apoyo?.empleo) ap += 10;
  score += Math.min(ap, 30);

  return { score: Math.min(score, 100), comunes };
}

/** Exalumnos reales del directorio, puntuados y ordenados por afinidad. */
export async function obtenerSugeridos(perfil) {
  try {
    const res = await obtenerDirectorio();
    const lista = res?.data ?? [];
    return lista
      .map((e) => ({ ...e, ...puntuar(perfil, e) }))
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

/** Matches reales del estudiante (motor RF-06). */
export async function obtenerMisMatches(token) {
  try {
    const res = await apiFetch('/matches-mentoria/mis-matches', { token });
    return res?.data ?? [];
  } catch {
    return [];
  }
}

/** Inicia la conexión con un match existente (sugerido → contactado). */
export async function contactarMatch(token, id) {
  return apiFetch(`/matches-mentoria/${id}/contactar`, { method: 'PUT', token });
}
