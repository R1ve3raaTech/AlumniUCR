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

/** Valida el formato del correo sin exigir un dominio específico. */
function validarCorreo(correo) {
  if (!correo || typeof correo !== 'string') {
    return 'El correo electrónico es obligatorio.';
  }
  const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formato.test(correo)) {
    return 'El formato del correo no es válido.';
  }
  return null;
}

const STRICT_UCR_EMAIL = process.env.STRICT_UCR_EMAIL !== 'false';

/**
 * Valida el correo según el rol: el estudiante debe usar @ucr.ac.cr; el
 * exalumno puede usar cualquier correo válido.
 */
function validarCorreoPorRol(correo, rol) {
  if (rol === 'exalumno') return validarCorreo(correo);
  return STRICT_UCR_EMAIL ? validarCorreoUCR(correo) : validarCorreo(correo);
}

/** El nombre completo es obligatorio, con al menos 3 caracteres. */
function validarNombre(nombre) {
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
    return 'El nombre completo debe tener al menos 3 caracteres.';
  }
  const partes = nombre.trim().split(/\s+/);
  if (partes.length < 2) {
    return 'Por favor, ingresa tu nombre y al menos un apellido (nombre completo).';
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

module.exports = {
  validarCorreoUCR,
  validarCorreo,
  validarCorreoPorRol,
  validarNombre,
  validarContrasena,
};
