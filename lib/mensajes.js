// Traducción de los mensajes de error que el backend reenvía desde Supabase Auth
// (vienen en inglés) al español neutro de la interfaz. Centralizado aquí para que
// todas las respuestas del API pasen por una sola tabla.

// Coincidencias exactas (el mensaje llega tal cual desde Supabase).
const EXACTOS = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión.',
  'User already registered': 'Este correo ya está registrado.',
  'A user with this email address has already been registered':
    'Este correo ya está registrado.',
  'Unable to validate email address: invalid format':
    'El formato del correo no es válido.',
  'Signup requires a valid password': 'Debes ingresar una contraseña válida.',
  'Signups not allowed for this instance':
    'El registro está deshabilitado por el momento.',
  'Email rate limit exceeded':
    'Se enviaron demasiados correos. Espera unos minutos e intenta de nuevo.',
  'User not found': 'No existe una cuenta con ese correo.',
  'Token has expired or is invalid':
    'Tu sesión expiró. Inicia sesión de nuevo.',
};

// Coincidencias por patrón (el mensaje incluye valores variables).
const PATRONES = [
  {
    re: /^Password should be at least (\d+) characters/i,
    es: (m) => `La contraseña debe tener al menos ${m[1]} caracteres.`,
  },
  {
    re: /^For security purposes, you can only request this after (\d+) seconds?/i,
    es: (m) =>
      `Por seguridad, espera ${m[1]} segundos antes de volver a intentarlo.`,
  },
];

/**
 * Devuelve la versión en español del mensaje. Si no se reconoce, se devuelve el
 * original (los mensajes propios del backend ya vienen en español).
 * @param {string} mensaje
 */
export function traducirMensaje(mensaje) {
  if (!mensaje) return mensaje;
  if (EXACTOS[mensaje]) return EXACTOS[mensaje];
  for (const { re, es } of PATRONES) {
    const m = mensaje.match(re);
    if (m) return es(m);
  }
  return mensaje;
}
