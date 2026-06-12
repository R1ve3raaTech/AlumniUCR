// Validaciones de formularios en el cliente (espejo de BE/utils/validaciones.js).
// Devuelven null si el valor es válido, o un mensaje de error en español.

const DOMINIO_UCR = /@ucr\.ac\.cr$/i;
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCorreoUCR(correo) {
  if (!correo) return 'El correo electrónico es obligatorio.';
  if (!FORMATO_EMAIL.test(correo)) return 'El formato del correo no es válido.';
  if (!DOMINIO_UCR.test(correo.trim())) return 'El correo debe terminar en @ucr.ac.cr.';
  return null;
}

export function validarNombre(nombre) {
  if (!nombre || nombre.trim().length < 3) {
    return 'El nombre completo debe tener al menos 3 caracteres.';
  }
  return null;
}

export function validarContrasena(contrasena) {
  if (!contrasena) return 'La contraseña es obligatoria.';
  if (contrasena.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(contrasena)) return 'La contraseña debe incluir al menos una letra mayúscula.';
  if (!/[0-9]/.test(contrasena)) return 'La contraseña debe incluir al menos un número.';
  return null;
}
