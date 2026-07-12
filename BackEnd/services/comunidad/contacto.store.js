// Almacén de solicitudes de contacto (exalumno → estudiante) del RF-03.
// Persiste en la tabla `solicitudes_contacto` de Supabase (ver
// BackEnd/db/schema/solicitudes_contacto.sql). Acceso solo del backend con la service_role.

const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lista todas las solicitudes, de la más reciente a la más antigua. */
const listar = async () => {
  const { data, error } = await supabase
    .from('solicitudes_contacto')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw mapDbError(error);
  return data ?? [];
};

/** Crea una solicitud (evita duplicar el mismo par; reactiva una rechazada). */
const crear = async ({ id_estudiante, id_exalumno, nombre_exalumno, mensaje }) => {
  const { data: existente, error: errorBusqueda } = await supabase
    .from('solicitudes_contacto')
    .select('*')
    .eq('id_estudiante', id_estudiante)
    .eq('id_exalumno', id_exalumno)
    .maybeSingle();
  if (errorBusqueda) throw mapDbError(errorBusqueda);

  if (existente) {
    // Si ya existe una pendiente/aceptada, se reutiliza. Si estaba rechazada,
    // se reactiva a 'pendiente' en lugar de crear un duplicado huérfano.
    if (existente.estado !== 'rechazada') return existente;

    const { data: reactivada, error: errorUpdate } = await supabase
      .from('solicitudes_contacto')
      .update({
        estado: 'pendiente',
        nombre_exalumno,
        mensaje: mensaje || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existente.id)
      .select()
      .single();
    if (errorUpdate) throw mapDbError(errorUpdate);
    return reactivada;
  }

  const { data, error } = await supabase
    .from('solicitudes_contacto')
    .insert([
      {
        id_estudiante,
        id_exalumno,
        nombre_exalumno,
        mensaje: mensaje || '',
        estado: 'pendiente',
      },
    ])
    .select()
    .single();
  if (error) throw mapDbError(error);
  return data;
};

/** El estudiante responde su solicitud (aceptada | rechazada). Null si no es suya. */
const responder = async (id, idEstudiante, estado) => {
  if (!UUID_RE.test(String(id))) return null;

  const { data, error } = await supabase
    .from('solicitudes_contacto')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('id_estudiante', idEstudiante)
    .select()
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data;
};

module.exports = { listar, crear, responder };
