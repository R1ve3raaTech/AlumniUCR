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
      estado: 'pendiente',
    };
    const { data, error } = await supabase.from('blogs').insert(fila).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, mensaje: 'Tu publicación se envió y será revisada por el administrador.', data });
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

module.exports = { listarBlogs, crearBlog, misBlogs, listarEventos, panelAdmin, moderarBlog, crearEvento, moderarEvento };
