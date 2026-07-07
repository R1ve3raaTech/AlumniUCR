import { apiFetch } from './api';

/**
 * Obtiene los datos del legado y fidelización del exalumno (timeline, badges, ciclo de vida, árbol, portafolio).
 * @param {string} token - Token de sesión del usuario.
 */
export async function obtenerMiLegado(token) {
  return apiFetch('/fidelizacion/mi-legado', { token });
}

/**
 * Obtiene los leaderboards globales de fidelización (rankings de generación y facultad).
 * @param {string} token - Token de sesión del usuario.
 */
export async function obtenerLeaderboards(token) {
  return apiFetch('/fidelizacion/leaderboards', { token });
}
