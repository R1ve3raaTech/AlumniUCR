// lib/reportes.js — Reporte de perfiles (RF-09.1).
// El emisor se manda desde el FE (usuario logueado). El anonimato se garantiza
// porque la consulta de reportes es solo para el admin (no la ve el reportado).

import { apiFetch } from '../api';

/** Motivos predefinidos del reporte (RF-09.1: "motivo predefinido"). */
export const MOTIVOS_REPORTE = [
  'Información falsa o engañosa',
  'Suplantación de identidad',
  'Contenido inapropiado u ofensivo',
  'Spam o publicidad no solicitada',
  'Comportamiento sospechoso / posible fraude',
  'Otro',
];

/** Crea un reporte de perfil. */
export async function crearReporte(token, { id_usuario_reportado, id_usuario_emisor, motivo, descripcion }) {
  return apiFetch('/reportes-usuarios', {
    method: 'POST',
    token,
    body: { id_usuario_reportado, id_usuario_emisor, motivo, descripcion: descripcion || null },
  });
}
