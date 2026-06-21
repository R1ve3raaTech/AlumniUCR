// lib/fotosDemo.ts
// Fotos reales de personas conocidas del proyecto, para mostrarlas en perfiles,
// tarjetas, directorios y matches mientras no exista la foto subida (foto_url)
// en la base de datos. Centraliza las referencias para reutilizarlas en todo
// el código: prioridad foto_url (BD) > foto por nombre > retrato de respaldo.

const norm = (s?: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/** Mapa nombre → ruta de la foto real (en /public/images). Se contemplan las
   variantes con que puede estar registrada la persona. */
export const FOTOS_POR_NOMBRE: Record<string, string> = {
  'adriana solano': '/images/adri.jpg',
  'adri solano': '/images/adri.jpg',
};

/** Retrato genérico de respaldo (evita imágenes rotas). */
export const FOTO_FALLBACK = '/images/TANIA_RODRIGUEZ01-pq2.png';

/** Foto por nombre, si existe una real registrada. */
export function fotoPorNombre(nombre?: string): string | undefined {
  return FOTOS_POR_NOMBRE[norm(nombre)];
}

/** Mejor foto disponible para una persona: foto_url (BD) > por nombre > respaldo. */
export function fotoDe(persona?: { nombre?: string; foto_url?: string } | null): string {
  if (persona?.foto_url) return persona.foto_url;
  return fotoPorNombre(persona?.nombre) || FOTO_FALLBACK;
}
