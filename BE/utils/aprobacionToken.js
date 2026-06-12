// Token firmado (HMAC-SHA256) para aprobar/rechazar cuentas desde el correo.
//
// Es stateless: no requiere columnas ni tablas nuevas. El token se deriva del id
// del usuario con una clave secreta del servidor, así solo quien recibe el correo
// (con el enlace) puede aprobar o rechazar la cuenta. La verificación usa una
// comparación de tiempo constante para evitar ataques de temporización.

const crypto = require('crypto');

// Clave para firmar. Se prefiere una dedicada; si no, se reutiliza la service_role
// (ya es secreta del backend) para no exigir configuración adicional.
const SECRET = process.env.APPROVAL_SECRET || process.env.SUPABASE_SECRET_KEY || 'dev-approval-secret';

/** Genera el token de aprobación para un id de usuario. */
function generarToken(userId) {
  return crypto.createHmac('sha256', SECRET).update(String(userId)).digest('hex');
}

/** Verifica que el token corresponda al id de usuario (comparación segura). */
function verificarToken(userId, token) {
  if (!token || typeof token !== 'string') return false;
  const esperado = generarToken(userId);
  const a = Buffer.from(esperado, 'utf8');
  const b = Buffer.from(token, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { generarToken, verificarToken };
