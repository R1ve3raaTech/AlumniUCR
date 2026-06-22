// Cliente de preguntas frecuentes (Centro de Ayuda).
// Lee del endpoint público /api/faqs y cachea en localStorage para que el
// contenido SIEMPRE se muestre, incluso si la red falla temporalmente.

import { apiFetch } from './api';

const CACHE = 'ct_faqs_cache';

export async function obtenerFaqs() {
  try {
    const res = await apiFetch('/faqs');
    const data = res?.data ?? res;
    if (data && Array.isArray(data.faqs)) {
      try { localStorage.setItem(CACHE, JSON.stringify(data)); } catch { /* almacenamiento no disponible */ }
      return data;
    }
    throw new Error('Respuesta inválida');
  } catch {
    // Resiliencia: usar la última copia cacheada si existe.
    try {
      const raw = localStorage.getItem(CACHE);
      if (raw) return JSON.parse(raw);
    } catch { /* ignora */ }
    return { categorias: [], faqs: [] };
  }
}
