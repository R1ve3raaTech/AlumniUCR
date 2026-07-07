// Almacén de consultas de soporte enviadas desde el Centro de Ayuda por
// personas visitantes (sin sesión). Persiste en la tabla `consultas_soporte`
// de Supabase (ver BE/db/consultas_soporte.sql). Acceso solo del backend con
// la service_role.

const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lista las consultas, de la más reciente a la más antigua. */
const listar = async () => {
  const { data, error } = await supabase
    .from('consultas_soporte')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw mapDbError(error);
  return data ?? [];
};

/** Crea una consulta nueva en estado 'nueva'. */
const crear = async (datos) => {
  const { data, error } = await supabase
    .from('consultas_soporte')
    .insert([
      {
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        cedula: datos.cedula,
        telefono: datos.telefono,
        mensaje: datos.mensaje,
        estado: 'nueva', // nueva | atendida
      },
    ])
    .select()
    .single();
  if (error) throw mapDbError(error);
  return data;
};

/** Cambia el estado de una consulta (p. ej. 'atendida'). Null si no existe. */
const actualizarEstado = async (id, estado) => {
  if (!UUID_RE.test(String(id))) return null;

  const { data, error } = await supabase
    .from('consultas_soporte')
    .update({ estado: estado || 'atendida', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data;
};

module.exports = { listar, crear, actualizarEstado };
