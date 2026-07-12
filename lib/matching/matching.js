// Cliente del Matching Interdisciplinario (solo administrador).

import { apiFetch } from '../api';

/** Obtiene los proyectos con sus mentores recomendados y el resumen. */
export async function obtenerMatching(token) {
  return apiFetch('/matching', { token });
}
