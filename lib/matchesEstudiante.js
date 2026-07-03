// Datos reales para el Centro de Matches del estudiante.
//  • Perfiles sugeridos = exalumnos reales del directorio (RF-02), puntuados
//    contra el perfil del estudiante (carrera, áreas, apoyo).
//  • Solicitudes = matches reales del motor RF-06 (/matches-mentoria/mis-matches).

import { apiFetch } from './api';
import { obtenerDirectorio } from './perfilExalumno';

const norm = (s) => String(s || '').toLowerCase().trim();

/**
 * Puntúa un exalumno del directorio contra el perfil del estudiante (0-100),
 * siguiendo exactamente el algoritmo de RF-06:
 *   30 pts — misma carrera UCR
 *   30 pts — áreas de interés en común (proporcional a la intersección)
 *   20 pts — sector del exalumno ↔ área temática del proyecto del estudiante
 *   20 pts — al menos un tipo de apoyo ofrecido ↔ buscado coincide
 */
export function puntuar(perfil, exa) {
  let score = 0;
  const comunes = [];

  // Misma carrera UCR (30 pts).
  const miCarrera = norm(perfil.carrera);
  if (miCarrera && (exa.carreras || []).some((c) => norm(c).includes(miCarrera) || miCarrera.includes(norm(c)))) {
    score += 30;
  }

  // Áreas de interés en común: proyecto + intereses vs áreas del exalumno (hasta 30 pts, proporcional).
  const mias = new Set([...(perfil.proyectoAreas || []), ...(perfil.intereses || [])].map(norm).filter(Boolean));
  (exa.areas || []).forEach((a) => { if (mias.has(norm(a))) comunes.push(a); });
  if (mias.size) score += Math.round((comunes.length / mias.size) * 30);

  // Sector del exalumno ↔ área temática del proyecto (20 pts, todo o nada).
  const areaTematica = norm(perfil.areaTematica);
  if (areaTematica && (exa.sectores || []).some((s) => norm(s).includes(areaTematica) || areaTematica.includes(norm(s)))) {
    score += 20;
  }

  // Tipo de apoyo ofrecido ↔ buscado: al menos 1 coincide = 20 pts (no es proporcional).
  const apoyoComun =
    (perfil.apoyo?.mentoria && exa.apoyo?.mentoria) ||
    (perfil.apoyo?.pasantia && exa.apoyo?.pasantia) ||
    (perfil.apoyo?.empleo && exa.apoyo?.empleo);
  if (apoyoComun) score += 20;

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

/** Genera (o regenera) todos los matches del estudiante autenticado contra el directorio. */
export async function generarMatches(token) {
  return apiFetch('/matches-mentoria/generar', { method: 'POST', token });
}

/** Inicia la conexión con un match existente (sugerido → contactado). Dispara el email real (RF-06). */
export async function contactarMatch(token, id) {
  return apiFetch(`/matches-mentoria/${id}/contactar`, { method: 'PUT', token });
}

/**
 * Conecta con un exalumno sugerido del directorio (RF-06, paso 3: "cualquiera
 * puede iniciar la conexión"). Si todavía no existe una fila de match real
 * para ese par exalumno↔estudiante, primero la genera y reintenta una vez.
 */
export async function conectarConExalumno(token, idExalumno, misMatchesActuales) {
  const buscar = (lista) => lista.find((m) => m.usuarios?.id === idExalumno);

  let existente = buscar(misMatchesActuales);
  if (!existente) {
    await generarMatches(token);
    const actualizados = await obtenerMisMatches(token);
    existente = buscar(actualizados);
    if (!existente) throw new Error('No se pudo generar la conexión con este exalumno.');
  }

  if (existente.estado === 'sugerido') {
    await contactarMatch(token, existente.id);
  }
  return existente;
}

/** Acepta la conexión (contactado → activo). */
export async function aceptarMatch(token, id) {
  return apiFetch(`/matches-mentoria/${id}/aceptar`, { method: 'PUT', token });
}

/** Rechaza la conexión (contactado → cerrado). */
export async function rechazarMatch(token, id) {
  return apiFetch(`/matches-mentoria/${id}/rechazar`, { method: 'PUT', token });
}

/** Obtiene la explicación de afinidad generada por IA para el match. */
export async function obtenerExplicacionMatchIA(token, id) {
  try {
    const res = await apiFetch(`/matches-mentoria/${id}/explicacion-ia`, { token });
    return res?.data?.explicacion ?? '';
  } catch {
    return '';
  }
}

