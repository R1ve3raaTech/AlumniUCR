// Servicio del perfil de onboarding del estudiante (fuente única en Supabase).
// Un registro por usuario; el perfil completo se guarda como JSONB.

const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'perfil_onboarding';

/** Devuelve el perfil del usuario (objeto) o null si no existe. */
const obtener = async (idUsuario) => {
  const { data, error } = await supabase
    .from(TABLA)
    .select('datos')
    .eq('id_usuario', idUsuario)
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data?.datos ?? null;
};

/** Crea o actualiza (upsert) el perfil del usuario y lo devuelve. */
const guardar = async (idUsuario, datos) => {
  const { data, error } = await supabase
    .from(TABLA)
    .upsert(
      { id_usuario: idUsuario, datos, updated_at: new Date().toISOString() },
      { onConflict: 'id_usuario' },
    )
    .select('datos')
    .single();
  if (error) throw mapDbError(error);
  return data?.datos ?? datos;
};

module.exports = { obtener, guardar };
