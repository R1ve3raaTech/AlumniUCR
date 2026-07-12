// Almacén de reportes (denuncias / quejas / sugerencias) que envían los
// estudiantes sobre estudiantes o exalumnos. Persiste en la tabla
// `reportes_anomalias` de Supabase (ver BackEnd/db/schema/reportes_anomalias.sql).
// Los lee el administrador en su panel. Acceso solo del backend (service_role).

const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lista los reportes, del más reciente al más antiguo. */
const listar = async () => {
  const { data, error } = await supabase
    .from('reportes_anomalias')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw mapDbError(error);
  return data ?? [];
};

/** Reportes de un usuario (su historial). */
const listarPorUsuario = async (idUsuario) => {
  if (!UUID_RE.test(String(idUsuario))) return [];

  const { data, error } = await supabase
    .from('reportes_anomalias')
    .select('*')
    .eq('reportado_por', idUsuario)
    .order('created_at', { ascending: false });
  if (error) throw mapDbError(error);
  return data ?? [];
};

/** Crea un reporte nuevo en estado 'nueva'. */
const crear = async (datos) => {
  const { data, error } = await supabase
    .from('reportes_anomalias')
    .insert([
      {
        tipo: datos.tipo, // Denuncia | Queja | Sugerencia
        persona_tipo: datos.persona_tipo || '', // Estudiante | Exalumno | General
        persona_nombre: datos.persona_nombre || '',
        persona_identificador: datos.persona_identificador || '',
        motivo: datos.motivo || '',
        descripcion: datos.descripcion,
        anonimo: Boolean(datos.anonimo),
        // Se guarda quién reportó para auditoría del admin; al reportado NO se le revela.
        reportado_por: datos.reportado_por || null,
        reportado_por_nombre: datos.reportado_por_nombre || '',
        estado: 'nueva', // nueva | en_revision | resuelta
      },
    ])
    .select()
    .single();
  if (error) throw mapDbError(error);
  return data;
};

/** Cambia el estado de un reporte (admin). Null si no existe. */
const marcar = async (id, estado) => {
  if (!UUID_RE.test(String(id))) return null;

  const { data, error } = await supabase
    .from('reportes_anomalias')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data;
};

module.exports = { listar, listarPorUsuario, crear, marcar };
