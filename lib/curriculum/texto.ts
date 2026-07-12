// Utilidades de formato del texto que ingresa el estudiante: capitaliza, limpia
// espacios y da formato a teléfonos. (La corrección ortográfica completa requiere
// un diccionario/IA; aquí se hace la limpieza y capitalización base.)

/** Colapsa espacios, recorta y pone mayúscula al inicio y tras . ! ? */
export function limpiarTexto(s: string): string {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  if (!t) return t;
  const conInicial = t.charAt(0).toUpperCase() + t.slice(1);
  // Mayúscula después de signos de puntuación de cierre de oración.
  return conInicial.replace(/([.!?]\s+)([a-záéíóúüñ])/g, (_m, p1: string, p2: string) => p1 + p2.toUpperCase());
}

/** Título: primera letra de cada palabra en mayúscula (nombres, cargos). */
export function tituloCaso(s: string): string {
  return (s || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

/** Teléfono CR a formato (0000 - 00 00). Si no hay 8 dígitos, deja el texto. */
export function formatearTelefono(s: string): string {
  const d = (s || '').replace(/\D/g, '').slice(-8);
  if (d.length !== 8) return (s || '').trim();
  return `(${d.slice(0, 4)} - ${d.slice(4, 6)} ${d.slice(6, 8)})`;
}
