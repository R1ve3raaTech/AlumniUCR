// Cliente HTTP mínimo para hablar con el backend Express (carpeta BE).
// Centraliza la URL base, las cabeceras JSON y el manejo de errores para que
// el resto del frontend no repita esa lógica.

import { traducirMensaje } from './mensajes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Realiza una petición al backend y devuelve el cuerpo ya parseado como JSON.
 * Lanza un Error con el mensaje del backend cuando la respuesta no es satisfactoria.
 *
 * @param {string} path  Ruta relativa al API, p. ej. '/auth/login'.
 * @param {object} [options]
 * @param {string} [options.method='GET']
 * @param {object} [options.body]   Objeto que se serializa a JSON.
 * @param {string} [options.token]  Bearer token opcional para rutas protegidas.
 */
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // El backend puede responder sin cuerpo (p. ej. 204); lo contemplamos.
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const mensaje =
      data?.mensaje || data?.message || 'Ocurrió un error al contactar el servidor.';
    throw new Error(traducirMensaje(mensaje));
  }

  return data;
}
