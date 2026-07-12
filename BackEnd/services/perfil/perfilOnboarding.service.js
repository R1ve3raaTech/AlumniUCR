// Servicio del perfil de onboarding del estudiante (fuente única en Supabase).
// Un registro por usuario; el perfil completo se guarda como JSONB.

const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

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

  // Sincroniza el nombre con la tabla usuarios: es la fuente que usan los
  // correos, el directorio y los matches. Sin esto, el nombre editado en el
  // onboarding queda solo en el frontend y el resto del sistema muestra el
  // nombre del registro original.
  const nombreCompleto = [datos?.nombre, datos?.apellidos]
    .map((s) => String(s || '').trim())
    .filter(Boolean)
    .join(' ');
  if (nombreCompleto) {
    const { error: errNombre } = await supabase
      .from('usuarios')
      .update({ nombre: nombreCompleto })
      .eq('id', idUsuario);
    if (errNombre) console.warn('⚠️ No se pudo sincronizar el nombre en usuarios:', errNombre.message);
  }

  return data?.datos ?? datos;
};

module.exports = { obtener, guardar };
