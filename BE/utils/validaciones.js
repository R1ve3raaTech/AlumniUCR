// Validaciones de autenticación reutilizables por los controllers.
// Devuelven null si el valor es válido, o un mensaje de error en español.

const DOMINIO_UCR = /@ucr\.ac\.cr$/i;

/** El correo es obligatorio, con formato válido y dominio @ucr.ac.cr. */
function validarCorreoUCR(correo) {
  if (!correo || typeof correo !== 'string') {
    return 'El correo electrónico es obligatorio.';
  }
  // Validación de formato básica antes de revisar el dominio.
  const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formato.test(correo)) {
    return 'El formato del correo no es válido.';
  }
  if (!DOMINIO_UCR.test(correo.trim())) {
    return 'El correo debe terminar en @ucr.ac.cr.';
  }
  return null;
}

/** El nombre completo es obligatorio, con al menos 3 caracteres. */
function validarNombre(nombre) {
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
    return 'El nombre completo debe tener al menos 3 caracteres.';
  }
  return null;
}

/** La contraseña requiere mínimo 8 caracteres, una mayúscula y un número. */
function validarContrasena(contrasena) {
  if (!contrasena || typeof contrasena !== 'string') {
    return 'La contraseña es obligatoria.';
  }
  if (contrasena.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (!/[A-Z]/.test(contrasena)) {
    return 'La contraseña debe incluir al menos una letra mayúscula.';
  }
  if (!/[0-9]/.test(contrasena)) {
    return 'La contraseña debe incluir al menos un número.';
  }
  return null;
}

module.exports = { validarCorreoUCR, validarNombre, validarContrasena };
