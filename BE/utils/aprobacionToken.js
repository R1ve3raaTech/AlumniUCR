// Token firmado (HMAC-SHA256) para acciones por enlace desde el correo
// (aprobar/rechazar cuentas y restablecer contraseña).
//
// Es stateless: no requiere columnas ni tablas nuevas. El token se deriva del id
// del usuario + un "propósito" con una clave secreta del servidor, así solo quien
// recibe el correo puede ejecutar esa acción concreta (un enlace de aprobación no
// sirve para resetear, y viceversa). La verificación usa comparación de tiempo
// constante para evitar ataques de temporización.

const crypto = require('crypto');

// Clave para firmar. Se prefiere una dedicada; si no, se reutiliza la service_role
// (ya es secreta del backend) para no exigir configuración adicional.
const SECRET = process.env.APPROVAL_SECRET || process.env.SUPABASE_SECRET_KEY || 'dev-approval-secret';

/**
 * Genera el token para un id de usuario y un propósito.
 * @param {string} userId
 * @param {string} [scope='']  p. ej. '' para aprobación, 'reset' para contraseña.
 */
function generarToken(userId, scope = '') {
  return crypto.createHmac('sha256', SECRET).update(`${userId}:${scope}`).digest('hex');
}

/** Verifica que el token corresponda al id de usuario y propósito (comparación segura). */
function verificarToken(userId, token, scope = '') {
  if (!token || typeof token !== 'string') return false;
  const esperado = generarToken(userId, scope);
  const a = Buffer.from(esperado, 'utf8');
  const b = Buffer.from(token, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { generarToken, verificarToken };
