// Cliente del frontend para las consultas de soporte enviadas desde el Centro
// de Ayuda (formulario público del visitante) y su gestión por el administrador.

import { apiFetch } from './api';

/** Envía una consulta pública al Centro de Soporte. */
export async function enviarConsultaSoporte(payload) {
  return apiFetch('/consultas-soporte', { method: 'POST', body: payload });
}

/** Lista las consultas recibidas (solo administrador). */
export async function listarConsultasSoporte(token) {
  return apiFetch('/consultas-soporte', { token });
}

/** Marca una consulta como atendida (solo administrador). */
export async function marcarConsultaAtendida(token, id) {
  return apiFetch(`/consultas-soporte/${id}`, {
    method: 'PATCH',
    token,
    body: { estado: 'atendida' },
  });
}
