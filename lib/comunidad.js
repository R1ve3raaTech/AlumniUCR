// Cliente del espacio de Comunidad: blogs (aportes aprobados) y eventos.
import { apiFetch } from './api';

// ── Público / usuarios ──
export async function listarBlogs() {
  try { const r = await apiFetch('/comunidad/blogs'); return r?.data ?? []; } catch { return []; }
}
export async function listarEventos() {
  try { const r = await apiFetch('/comunidad/eventos'); return r?.data ?? []; } catch { return []; }
}
export async function crearBlog(token, payload) {
  return apiFetch('/comunidad/blogs', { method: 'POST', token, body: payload });
}
export async function misBlogs(token) {
  try { const r = await apiFetch('/comunidad/blogs/mios', { token }); return r?.data ?? []; } catch { return []; }
}

// ── Administración ──
export async function panelComunidad(token) {
  const r = await apiFetch('/comunidad/admin', { token });
  return r?.data ?? { blogsPendientes: [], eventos: [] };
}
export async function moderarBlog(token, id, estado) {
  return apiFetch(`/comunidad/blogs/${id}`, { method: 'PATCH', token, body: { estado } });
}
export async function crearEvento(token, payload) {
  return apiFetch('/comunidad/eventos', { method: 'POST', token, body: payload });
}
export async function moderarEvento(token, id, estado) {
  return apiFetch(`/comunidad/eventos/${id}`, { method: 'PATCH', token, body: { estado } });
}
