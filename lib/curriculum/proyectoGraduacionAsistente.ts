// Cliente API del asistente de Proyecto de Graduación (RF-03 ampliado).
//
// STUB: las firmas ya están listas para el flujo real, pero ningún endpoint
// del backend soporta hoy los campos ampliados (introducción, objetivos,
// marco teórico, metodología, referencias, cronograma) — la tabla
// proyecto_graduacion solo tiene título/descripción/tipo/avance/finalizado.
// Antes de conectar estas funciones de verdad hace falta:
//   1. Migrar la tabla (o crear una tabla relacionada 1:1) con las columnas
//      nuevas.
//   2. Actualizar BackEnd/services/proyectoGraduacionService.js — hoy filtra
//      explícitamente los campos permitidos en crearProyectoGraduacion().
//   3. Reemplazar el cuerpo de estas funciones por llamadas reales a
//      apiFetch(), siguiendo el patrón de lib/proyectoGraduacion.js.
//
// Por ahora, ProyectoGraduacionContext solo persiste en localStorage y no
// invoca nada de este archivo — queda listo para cuando se conecte.

import type { ProyectoGraduacion } from '@/context/ProyectoGraduacionContext';

export async function obtenerProyectoGraduacionAsistente(
  _token: string,
): Promise<ProyectoGraduacion | null> {
  // TODO: GET al backend una vez exista el endpoint ampliado.
  return null;
}

export async function guardarProyectoGraduacionAsistente(
  _token: string,
  _datos: Partial<ProyectoGraduacion>,
): Promise<void> {
  // TODO: POST/PUT al backend una vez exista el endpoint ampliado.
}

// ─── IA: "Sugerir mejora" (RF nuevo) ──────────────────────────────────────
// Llama a la ruta de Next.js /api/proyecto-graduacion/sugerir (no al backend
// Express) — mismo patrón que app/api/alumni-chat y app/api/resumen-usuario.
export type CampoSugerible = 'planteamientoProblema' | 'justificacion' | 'objetivoGeneral' | 'objetivoEspecifico';

export async function sugerirMejoraTexto(campo: CampoSugerible, texto: string): Promise<string> {
  const res = await fetch('/api/proyecto-graduacion/sugerir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ campo, texto }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'No se pudo generar la sugerencia.');
  }
  return data.sugerencia as string;
}
