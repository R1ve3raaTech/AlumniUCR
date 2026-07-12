// Llamadas al backend para la Sección 6 (Habilidades) del perfil de
// estudiante (RF-03). Cubre la tabla habilidades_estudiante (campo
// "tecnicas": texto libre separado por comas).

import { apiFetch } from '../api';

/** Registro de habilidades del estudiante autenticado, o null si aún no existe. */
export async function obtenerHabilidadesDelEstudiante(token, idUsuario) {
  const res = await apiFetch(`/habilidades/usuario/${idUsuario}`, { token });
  const registros = res?.data ?? [];
  return registros[0] ?? null;
}

/** Crea o actualiza el registro de habilidades técnicas del estudiante. */
export async function guardarHabilidades(token, datos, idExistente) {
  if (idExistente) {
    const res = await apiFetch(`/habilidades/${idExistente}`, {
      method: 'PUT',
      token,
      body: datos,
    });
    return res?.data;
  }
  const res = await apiFetch('/habilidades', {
    method: 'POST',
    token,
    body: datos,
  });
  return res?.data;
}
