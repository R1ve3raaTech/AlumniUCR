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

/** Valida formato de correo sin exigir un dominio específico. */
export function validarCorreo(correo) {
  if (!correo) return 'El correo electrónico es obligatorio.';
  if (!FORMATO_EMAIL.test(correo)) return 'El formato del correo no es válido.';
  return null;
}

// RF-01.1: el estudiante debe usar correo institucional @ucr.ac.cr. En PRODUCCIÓN
// es obligatorio (modo estricto, por defecto). En DESARROLLO/DEMO se puede relajar
// con NEXT_PUBLIC_STRICT_UCR_EMAIL=false, porque el equipo no tiene acceso a cuentas
// @ucr.ac.cr reales mientras construye la plataforma para el cliente.
const STRICT_UCR_EMAIL = process.env.NEXT_PUBLIC_STRICT_UCR_EMAIL !== 'false';

/**
 * Valida el correo según el rol:
 *  - Exalumno: cualquier correo válido.
 *  - Estudiante: @ucr.ac.cr en modo estricto (prod); cualquier correo si el modo
 *    estricto está desactivado (dev/demo).
 */
export function validarCorreoPorRol(correo, rol) {
  if (rol === 'exalumno') return validarCorreo(correo);
  return STRICT_UCR_EMAIL ? validarCorreoUCR(correo) : validarCorreo(correo);
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

// ─── Proyecto de graduación (RF-03, Sección 3) ───────────────────────────

export function validarTituloProyecto(titulo) {
  if (!titulo || !titulo.trim()) return 'El título del proyecto es obligatorio.';
  if (titulo.trim().length > 200) return 'El título no puede superar los 200 caracteres.';
  return null;
}

export function validarDescripcionProyecto(descripcion) {
  if (!descripcion || !descripcion.trim()) return 'La descripción del proyecto es obligatoria.';
  if (descripcion.trim().length > 1000) return 'La descripción no puede superar los 1000 caracteres.';
  return null;
}

export function validarPorcentajeAvance(valor) {
  if (valor === '' || valor === null || valor === undefined) {
    return 'El porcentaje de avance es obligatorio.';
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) return 'El porcentaje de avance debe ser un número.';
  if (numero < 0 || numero > 100) return 'El porcentaje de avance debe estar entre 0 y 100.';
  return null;
}

// ─── Información académica (RF-03, Secciones 1 y 2) ─────────────────────

export function validarCarneUCR(carne) {
  if (!carne || !carne.trim()) return 'El carné UCR es obligatorio.';
  if (!/^[A-Za-z][0-9]{5}$/.test(carne.trim())) {
    return 'El carné debe tener el formato UCR: una letra seguida de 5 números (ej. B12345).';
  }
  return null;
}

export function validarAnoIngreso(valor) {
  if (valor === '' || valor === null || valor === undefined) {
    return 'El año de ingreso es obligatorio.';
  }
  const anio = Number(valor);
  const actual = new Date().getFullYear();
  if (Number.isNaN(anio) || anio < 1970 || anio > actual) {
    return `El año de ingreso debe estar entre 1970 y ${actual}.`;
  }
  return null;
}

export function validarPromedioPonderado(valor) {
  if (valor === '' || valor === null || valor === undefined) return null;
  const promedio = Number(valor);
  if (Number.isNaN(promedio) || promedio < 0 || promedio > 100) {
    return 'El promedio ponderado debe estar entre 0 y 100.';
  }
  return null;
}

export function validarAnoGraduacion(valor) {
  if (valor === '' || valor === null || valor === undefined) {
    return 'El año esperado de graduación es obligatorio.';
  }
  const anio = Number(valor);
  const actual = new Date().getFullYear();
  if (Number.isNaN(anio) || anio < actual || anio > actual + 15) {
    return `El año de graduación debe estar entre ${actual} y ${actual + 15}.`;
  }
  return null;
}
