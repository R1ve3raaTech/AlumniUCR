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

// ── Código de verificación de 6 dígitos (recuperación de contraseña) ────────
// También stateless: se deriva del id + una ventana de tiempo de 5 minutos.
// Al verificar se aceptan la ventana actual y las 2 anteriores (vigencia
// efectiva de 10 a 15 minutos), sin guardar nada en la base.

const VENTANA_CODIGO_MS = 5 * 60 * 1000;

/** Genera el código de 6 dígitos vigente para un usuario. */
function codigoRecuperacion(userId, desplazamiento = 0) {
  const ventana = Math.floor(Date.now() / VENTANA_CODIGO_MS) - desplazamiento;
  const h = crypto.createHmac('sha256', SECRET).update(`codigo-reset:${userId}:${ventana}`).digest();
  return String(h.readUInt32BE(0) % 1_000_000).padStart(6, '0');
}

/** Verifica un código de recuperación (comparación de tiempo constante). */
function verificarCodigoRecuperacion(userId, codigo) {
  const limpio = String(codigo || '').trim();
  if (!/^\d{6}$/.test(limpio)) return false;
  const b = Buffer.from(limpio, 'utf8');
  for (let d = 0; d <= 2; d++) {
    const a = Buffer.from(codigoRecuperacion(userId, d), 'utf8');
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }
  return false;
}

module.exports = { generarToken, verificarToken, codigoRecuperacion, verificarCodigoRecuperacion };
