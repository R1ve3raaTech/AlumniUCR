// Estadísticas públicas del landing (sección Impacto), sin autenticación.

import { apiFetch } from './api';

/** @returns {Promise<{conexiones:number, porcentaje_exito:number, mentores:number, proyectos_activos:number}|null>} */
export async function obtenerEstadisticasPublicas() {
  try {
    const res = await apiFetch('/stats/publicas');
    return res?.data ?? null;
  } catch {
    return null;
  }
}
