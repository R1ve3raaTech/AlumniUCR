// Comunidad: Blogs (aportes de estudiantes/exalumnos, aprobados por el admin) y
// Eventos (gestionados por la administración). Usa la service_role de Supabase.
const supabase = require('../config/supabase');

const err400 = (m) => { const e = new Error(m); e.statusCode = 400; return e; };
const TIPOS = ['noticia', 'sugerencia', 'comentario'];

// ── Blogs ──────────────────────────────────────────────────────────────────
const listarBlogs = async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('blogs').select('*').eq('estado', 'aprobado').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (e) { next(e); }
};

const crearBlog = async (req, res, next) => {
  try {
    const { tipo, titulo, contenido } = req.body || {};
    if (!titulo || !String(titulo).trim()) throw err400('El título es obligatorio.');
    if (!contenido || !String(contenido).trim()) throw err400('El contenido es obligatorio.');
    const fila = {
      id_autor: req.user?.id || null,
      autor_nombre: req.user?.profile?.nombre || 'Miembro de la comunidad',
      autor_rol: (req.user?.profile?.roles?.nombre || 'estudiante').toLowerCase(),
      tipo: TIPOS.includes(tipo) ? tipo : 'noticia',
      titulo: String(titulo).trim(),
      contenido: String(contenido).trim(),
      // Publicación directa: no pasa por revisión del admin. El admin conserva
      // la moderación a posteriori (puede rechazarla desde su panel).
      estado: 'aprobado',
    };
    const { data, error } = await supabase.from('blogs').insert(fila).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, mensaje: 'Tu publicación ya está visible en la comunidad.', data });
  } catch (e) { next(e); }
};

// Solo el autor puede editar/eliminar su publicación.
const blogDelAutor = async (id, idUsuario) => {
  const { data, error } = await supabase.from('blogs').select('id, id_autor').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) throw Object.assign(new Error('La publicación no existe.'), { statusCode: 404 });
  if (!idUsuario || data.id_autor !== idUsuario) {
    throw Object.assign(new Error('Solo el autor puede modificar esta publicación.'), { statusCode: 403 });
  }
  return data;
};

const actualizarBlog = async (req, res, next) => {
  try {
    await blogDelAutor(req.params.id, req.user?.id);
    const { tipo, titulo, contenido } = req.body || {};
    if (!titulo || !String(titulo).trim()) throw err400('El título es obligatorio.');
    if (!contenido || !String(contenido).trim()) throw err400('El contenido es obligatorio.');
    const cambios = {
      titulo: String(titulo).trim(),
      contenido: String(contenido).trim(),
      // updated_at marca la edición: el FE muestra la etiqueta "Editada"
      // cuando difiere de created_at.
      updated_at: new Date().toISOString(),
    };
    if (TIPOS.includes(tipo)) cambios.tipo = tipo;
    const { data, error } = await supabase
      .from('blogs').update(cambios).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.status(200).json({ success: true, mensaje: 'Publicación actualizada.', data });
  } catch (e) { next(e); }
};

const eliminarBlog = async (req, res, next) => {
  try {
    await blogDelAutor(req.params.id, req.user?.id);
    const { error } = await supabase.from('blogs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(200).json({ success: true, mensaje: 'Publicación eliminada.' });
  } catch (e) { next(e); }
};

const misBlogs = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('blogs').select('*').eq('id_autor', req.user?.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (e) { next(e); }
};

// ── Eventos ─────────────────────────────────────────────────────────────────
const listarEventos = async (_req, res, next) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('eventos').select('*').eq('estado', 'aprobado').gte('fecha', hoy).order('fecha', { ascending: true });
    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (e) { next(e); }
};

// ── Administración ──────────────────────────────────────────────────────────
const panelAdmin = async (_req, res, next) => {
  try {
    const [bp, ev] = await Promise.all([
      supabase.from('blogs').select('*').eq('estado', 'pendiente').order('created_at', { ascending: false }),
      supabase.from('eventos').select('*').order('fecha', { ascending: true }),
    ]);
    res.status(200).json({ success: true, data: { blogsPendientes: bp.data || [], eventos: ev.data || [] } });
  } catch (e) { next(e); }
};

const moderarBlog = async (req, res, next) => {
  try {
    const { estado } = req.body || {};
    const { data, error } = await supabase
      .from('blogs').update({ estado, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

const crearEvento = async (req, res, next) => {
  try {
    const { titulo, descripcion, fecha, hora, lugar } = req.body || {};
    if (!titulo || !String(titulo).trim()) throw err400('El título es obligatorio.');
    if (!descripcion || !String(descripcion).trim()) throw err400('La descripción es obligatoria.');
    if (!fecha) throw err400('La fecha es obligatoria.');
    if (!lugar || !String(lugar).trim()) throw err400('El lugar es obligatorio.');
    const fila = {
      titulo: String(titulo).trim(), descripcion: String(descripcion).trim(), fecha,
      hora: hora || null, lugar: String(lugar).trim(),
      id_autor: req.user?.id || null, autor_nombre: req.user?.profile?.nombre || 'Administración',
      estado: 'aprobado',
    };
    const { data, error } = await supabase.from('eventos').insert(fila).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (e) { next(e); }
};

const moderarEvento = async (req, res, next) => {
  try {
    const { estado } = req.body || {};
    const { data, error } = await supabase
      .from('eventos').update({ estado, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

module.exports = { listarBlogs, crearBlog, actualizarBlog, eliminarBlog, misBlogs, listarEventos, panelAdmin, moderarBlog, crearEvento, moderarEvento };
