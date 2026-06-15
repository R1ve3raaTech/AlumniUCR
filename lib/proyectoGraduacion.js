// Llamadas al backend para la Sección 3 (Proyecto de Graduación) del perfil de
// estudiante (RF-03). Cubre el proyecto en sí, su área temática y sus
// necesidades específicas.

import { apiFetch } from './api';

/** Catálogo de tipos de proyecto (TFG, Tesis, Práctica Dirigida, Seminario...). */
export async function obtenerTiposProyecto(token) {
  return apiFetch('/tipos-proyecto', { token });
}

/** Catálogo de necesidades específicas (financiamiento, mentoría técnica, etc.). */
export async function obtenerNecesidadesEspecificas(token) {
  const res = await apiFetch('/necesidades-especificas', { token });
  return res?.data ?? [];
}

/** Catálogo de áreas temáticas (las mismas 14 áreas de la Sección 4). */
export async function obtenerAreasInteres(token) {
  const res = await apiFetch('/areas-interes', { token });
  return res?.data ?? [];
}

/** Proyecto de graduación del estudiante autenticado (o null si no tiene). */
export async function obtenerProyectoDelEstudiante(token, idUsuario) {
  const proyectos = await apiFetch(`/proyectos-graduacion/usuario/${idUsuario}`, { token });
  return Array.isArray(proyectos) && proyectos.length > 0 ? proyectos[0] : null;
}

/** Crea el proyecto (si idExistente es null) o actualiza el existente. */
export async function guardarProyectoGraduacion(token, datosProyecto, idExistente) {
  if (idExistente) {
    const res = await apiFetch(`/proyectos-graduacion/${idExistente}`, {
      method: 'PUT',
      token,
      body: datosProyecto,
    });
    return res?.data;
  }
  const res = await apiFetch('/proyectos-graduacion', {
    method: 'POST',
    token,
    body: datosProyecto,
  });
  return res?.data;
}

/** Áreas de interés ya vinculadas a este proyecto (RF-03, Sección 4). */
export async function obtenerAreasDelProyecto(token, idProyecto) {
  const res = await apiFetch(`/areas-interes-proyectos/proyecto/${idProyecto}`, { token });
  return res?.data ?? [];
}

/** Vincula un área de interés al proyecto. */
export async function agregarAreaInteresProyecto(token, idProyecto, idAreaTematica) {
  return apiFetch('/areas-interes-proyectos', {
    method: 'POST',
    token,
    body: { id_proyecto: idProyecto, id_area_tematica: idAreaTematica },
  });
}

/** Necesidades específicas ya vinculadas a este proyecto. */
export async function obtenerNecesidadesDelProyecto(token, idProyecto) {
  return apiFetch(`/proyectos-necesidades/proyecto/${idProyecto}`, { token });
}

/** Vincula una necesidad específica al proyecto. */
export async function agregarNecesidadProyecto(token, idProyecto, idNecesidad) {
  return apiFetch('/proyectos-necesidades', {
    method: 'POST',
    token,
    body: { id_proyecto: idProyecto, id_necesidad: idNecesidad },
  });
}
