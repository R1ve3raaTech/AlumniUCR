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
        tipo_ayuda: datos.tipo_ayuda,
        area: datos.area,
        modalidad: datos.modalidad,
        monto: datos.monto,
        frecuencia: datos.frecuencia,
        empresa: datos.empresa,
        duracion: datos.duracion,
        tema: datos.tema,
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

/**
 * El propio voluntario edita su modalidad, disponibilidad y biografía.
 * Devuelve null si no tiene ninguna solicitud (no puede editar lo que no existe).
 */
const actualizarPerfilPropio = async (correoElectronico, { modalidad, disponibilidad, biografia, foto_perfil }) => {
  const { data: propia, error: errorBusqueda } = await supabase
    .from('solicitudes_voluntarios')
    .select('id')
    .eq('correo_electronico', correoElectronico)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (errorBusqueda) throw mapDbError(errorBusqueda);
  if (!propia) return null;

  const cambios = { updated_at: new Date().toISOString() };
  if (modalidad !== undefined) cambios.modalidad = modalidad;
  if (disponibilidad !== undefined) cambios.disponibilidad = disponibilidad;
  if (biografia !== undefined) cambios.biografia = biografia;
  if (foto_perfil !== undefined) cambios.foto_perfil = foto_perfil;

  const { data, error } = await supabase
    .from('solicitudes_voluntarios')
    .update(cambios)
    .eq('id', propia.id)
    .select()
    .single();
  if (error) throw mapDbError(error);
  return data;
};

module.exports = { listar, crear, actualizarAccesos, actualizarPerfilPropio };
