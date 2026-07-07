// Almacén de solicitudes de voluntarios/colaboradores externos (opción "Otros"
// del registro). Persiste en la tabla `solicitudes_voluntarios` de Supabase
// (ver BE/db/solicitudes_voluntarios.sql). El acceso es solo del backend con la
// service_role: la tabla tiene RLS habilitado sin políticas.

const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lista las solicitudes, de la más reciente a la más antigua. */
const listar = async () => {
  const { data, error } = await supabase
    .from('solicitudes_voluntarios')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw mapDbError(error);
  return data ?? [];
};

/** Crea una solicitud nueva en estado 'pendiente'. */
const crear = async (datos) => {
  const { data, error } = await supabase
    .from('solicitudes_voluntarios')
    .insert([
      {
        nombre: datos.nombre,
        correo_electronico: datos.correo_electronico,
        telefono: datos.telefono,
        organizacion: datos.organizacion,
        area_colaboracion: datos.area_colaboracion,
        disponibilidad: datos.disponibilidad,
        mensaje: datos.mensaje,
        estado: 'pendiente',
      },
    ])
    .select()
    .single();
  if (error) throw mapDbError(error);
  return data;
};

/**
 * Actualiza los accesos otorgados por el administrador y marca la solicitud
 * como 'aprobado' (o 'rechazado' si no se otorga ningún acceso y se indica).
 * Devuelve null si la solicitud no existe (el controlador responde 404).
 */
const actualizarAccesos = async (id, { acceso_proyectos, acceso_mentorias, acceso_estudiantes, estado }) => {
  if (!UUID_RE.test(String(id))) return null;

  const { data, error } = await supabase
    .from('solicitudes_voluntarios')
    .update({
      acceso_proyectos: Boolean(acceso_proyectos),
      acceso_mentorias: Boolean(acceso_mentorias),
      acceso_estudiantes: Boolean(acceso_estudiantes),
      estado: estado || 'aprobado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw mapDbError(error);
  return data;
};

module.exports = { listar, crear, actualizarAccesos };
