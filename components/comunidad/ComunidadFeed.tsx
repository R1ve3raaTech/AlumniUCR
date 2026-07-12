'use client';

// Espacio de Comunidad: feed de aportes aprobados + compositor por modal.
// Soporta estudiantes, exalumnos y voluntarios. Mobile-first.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificar } from '@/components/student/Toast';
import { listarBlogs, listarEventos, crearBlog, editarBlog, eliminarBlog, misBlogs } from '@/lib/comunidad/comunidad';

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface Blog {
  id: string;
  autor_nombre: string;
  autor_rol: string;
  tipo: 'noticia' | 'sugerencia' | 'comentario';
  titulo: string;
  contenido: string;
  estado: string;
  created_at: string;
  updated_at?: string | null;
}

interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora?: string;
  lugar: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

const iniciales = (n: string) =>
  (n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const fechaCorta = (iso: string) => {
  const [, m, d] = (iso || '').split('-').map(Number);
  return { dia: d || '', mes: MESES[(m || 1) - 1] || '' };
};

// La edición se detecta por updated_at: el BE lo actualiza al editar. Se usa
// un margen de 1 min para ignorar diferencias de milisegundos al insertar.
const fueEditado = (b: Blog) =>
  Boolean(b.updated_at) &&
  new Date(b.updated_at as string).getTime() - new Date(b.created_at).getTime() > 60_000;

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} d`;
};

// ── Config tipos ───────────────────────────────────────────────────────────────
const TIPOS = {
  noticia:    { label: 'Noticia',    icon: 'campaign',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  sugerencia: { label: 'Sugerencia', icon: 'lightbulb', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  comentario: { label: 'Comentario', icon: 'forum',     color: 'bg-violet-50 text-violet-700 border-violet-200' },
} as const;

// ── Componente ─────────────────────────────────────────────────────────────────
export default function ComunidadFeed() {
  const { token } = useAuth();

  const [blogs,   setBlogs  ] = useState<Blog[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [mios,    setMios   ] = useState<Blog[]>([]);
  const [filtro,  setFiltro ] = useState<'todas' | 'noticia' | 'sugerencia' | 'comentario'>('todas');
  const [cargando, setCargando] = useState(true);

  // Modal compositor (crear o editar: editandoId indica el modo edición)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tipo,      setTipo     ] = useState<'noticia' | 'sugerencia' | 'comentario'>('noticia');
  const [titulo,    setTituloV  ] = useState('');
  const [contenido, setContenido] = useState('');
  const [enviando,  setEnviando ] = useState(false);

  // Modal mis publicaciones + confirmación de eliminación
  const [misPublicAbierto, setMisPublicAbierto] = useState(false);
  const [aEliminar, setAEliminar] = useState<Blog | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // ── Carga de datos ────────────────────────────────────────────────────────
  const cargar = useCallback(() => {
    setCargando(true);
    Promise.all([
      listarBlogs().catch(() => []),
      listarEventos().catch(() => []),
    ]).then(([b, e]) => {
      setBlogs(b);
      setEventos(e);
      setCargando(false);
    });
    if (token) {
      misBlogs(token).catch(() => []).then(setMios);
    }
  }, [token]);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Filtro ────────────────────────────────────────────────────────────────
  const visibles = useMemo(
    () => filtro === 'todas' ? blogs : blogs.filter((b) => b.tipo === filtro),
    [blogs, filtro],
  );

  // ── Publicar o guardar edición ────────────────────────────────────────────
  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim())    { notificar('Escribí un título'); return; }
    if (!contenido.trim()) { notificar('Escribí el contenido'); return; }
    setEnviando(true);
    try {
      const payload = { tipo, titulo: titulo.trim(), contenido: contenido.trim() };
      if (editandoId) {
        await editarBlog(token as string, editandoId, payload);
        notificar('✅ Publicación actualizada');
      } else {
        await crearBlog(token as string, payload);
        notificar('✅ ¡Publicado! Tu aporte ya es visible en la comunidad');
      }
      setTituloV(''); setContenido('');
      setEditandoId(null);
      setModalAbierto(false);
      cargar(); // refresca el feed para reflejar el cambio de inmediato
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo enviar';
      notificar(`⚠️ ${msg}`);
    } finally {
      setEnviando(false);
    }
  };

  // ── Editar: abre el compositor precargado con la publicación ─────────────
  const abrirEdicion = (b: Blog) => {
    setEditandoId(b.id);
    setTipo(b.tipo);
    setTituloV(b.titulo);
    setContenido(b.contenido);
    setMisPublicAbierto(false);
    setModalAbierto(true);
  };

  // ── Eliminar (tras confirmar en el modal) ─────────────────────────────────
  const confirmarEliminacion = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await eliminarBlog(token as string, aEliminar.id);
      notificar('🗑️ Publicación eliminada');
      setAEliminar(null);
      cargar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar';
      notificar(`⚠️ ${msg}`);
    } finally {
      setEliminando(false);
    }
  };

  // ── Cerrar modal al click en overlay ─────────────────────────────────────
  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setTituloV(''); setContenido('');
  };

  // Colaboradores destacados: autores únicos de las publicaciones reales.
  const autores = useMemo(() => {
    const vistos = new Map<string, Blog>();
    for (const b of blogs) if (b.autor_nombre && !vistos.has(b.autor_nombre)) vistos.set(b.autor_nombre, b);
    return Array.from(vistos.values()).slice(0, 4);
  }, [blogs]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <div className="grid grid-cols-12 gap-6">

        {/* ══ Columna principal ══ */}
        <div className="col-span-12 space-y-5 lg:col-span-8">

          {/* Encabezado + filtros */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-headline-md text-2xl font-bold text-on-surface">Feed de la Comunidad</h1>
              <p className="mt-0.5 text-sm text-on-surface-variant">Conectá, colaborá y compartí con la red Alumni UCR.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['todas', 'noticia', 'sugerencia', 'comentario'] as const).map((t) => (
                <button
                  key={t}
                  id={`filtro-${t}`}
                  onClick={() => setFiltro(t)}
                  className={`cursor-pointer rounded-full border-0 px-4 py-2 text-xs font-bold transition-all ${
                    filtro === t
                      ? 'bg-[#F34B26] text-white shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant shadow-sm hover:text-[#E8890C]'
                  }`}
                >
                  {t === 'todas' ? 'Todas' : TIPOS[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Compositor inline: abre el modal de nueva publicación */}
          {token && (
            <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-[0_4px_24px_-10px_rgba(20,20,20,0.12)]">
              <button
                id="btn-nueva-publicacion"
                type="button"
                onClick={() => setModalAbierto(true)}
                className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FF9B18]/15 text-[#E8890C]">
                  <span className="material-symbols-outlined">person</span>
                </span>
                <span className="flex-1 rounded-full bg-surface-container-low px-5 py-3 text-sm text-on-surface-variant transition-colors hover:bg-surface-container">
                  ¿Qué tenés en mente hoy?
                </span>
              </button>
              <div className="mt-4 flex items-center justify-between gap-2">
                {mios.length > 0 ? (
                  <button
                    id="btn-mis-publicaciones"
                    type="button"
                    onClick={() => setMisPublicAbierto(true)}
                    className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-xs font-bold text-on-surface-variant transition-colors hover:text-[#E8890C]"
                  >
                    <span className="material-symbols-outlined text-[15px]">list_alt</span>
                    Mis publicaciones
                  </button>
                ) : <span />}
                <button
                  type="button"
                  onClick={() => setModalAbierto(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[#F34B26] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-base">send</span> Publicar
                </button>
              </div>
            </div>
          )}

          {/* Feed */}
          <section className="space-y-4">
            {cargando ? (
              // Skeleton loader
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-3xl bg-surface-container-lowest p-6 shadow-[0_4px_24px_-10px_rgba(20,20,20,0.12)]">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-surface-variant" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 rounded-full bg-surface-variant" />
                        <div className="h-2.5 w-20 rounded-full bg-surface-variant" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-2/3 rounded-full bg-surface-variant" />
                      <div className="h-3 rounded-full bg-surface-variant" />
                      <div className="h-3 w-4/5 rounded-full bg-surface-variant" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibles.length === 0 ? (
              <div className="rounded-3xl bg-surface-container-lowest p-12 text-center shadow-[0_4px_24px_-10px_rgba(20,20,20,0.12)]">
                <span className="material-symbols-outlined mb-3 text-5xl text-outline">forum</span>
                <p className="font-semibold text-on-surface">Aún no hay publicaciones</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {token ? 'Sé la primera persona en aportar.' : 'Iniciá sesión para publicar.'}
                </p>
              </div>
            ) : (
              visibles.map((b) => {
                const t = TIPOS[b.tipo] || TIPOS.noticia;
                return (
                  <article
                    key={b.id}
                    className="rounded-3xl bg-surface-container-lowest p-6 shadow-[0_4px_24px_-10px_rgba(20,20,20,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-12px_rgba(20,20,20,0.18)]"
                  >
                    {/* Header del post */}
                    <div className="mb-3 flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FF9B18]/15 text-sm font-bold text-[#E8890C]">
                        {iniciales(b.autor_nombre)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-on-surface">{b.autor_nombre}</p>
                        <p className="text-[11px] capitalize text-on-surface-variant">{b.autor_rol}</p>
                      </div>
                      {/* Badge tipo */}
                      <span className={`flex shrink-0 items-center gap-1 rounded-full border-0 px-3 py-1.5 text-[11px] font-bold ${t.color}`}>
                        <span className="material-symbols-outlined text-[13px]">{t.icon}</span>
                        {t.label}
                      </span>
                    </div>

                    {/* Contenido */}
                    <h3 className="mb-1.5 font-headline-md text-base font-semibold leading-snug text-on-surface">{b.titulo}</h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">{b.contenido}</p>

                    {/* Pie: solo la fecha (sin likes ni comentarios: no existen en la base) */}
                    <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-on-surface-variant/70">
                      {fueEditado(b) && (
                        <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">
                          Editada
                        </span>
                      )}
                      {timeAgo(b.created_at)}
                    </div>
                  </article>
                );
              })
            )}
          </section>

          {/* CTA login si no hay token */}
          {!token && (
            <div className="rounded-3xl bg-surface-container-lowest p-6 text-center shadow-[0_4px_24px_-10px_rgba(20,20,20,0.12)]">
              <span className="material-symbols-outlined mb-2 text-3xl text-[#E8890C]">lock_open</span>
              <h3 className="font-semibold text-on-surface">Sumá tu voz a la comunidad</h3>
              <p className="mb-4 mt-1 text-sm text-on-surface-variant">
                Iniciá sesión como estudiante, exalumno o voluntario para publicar.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#F34B26] px-6 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105"
              >
                Iniciar sesión
              </a>
            </div>
          )}
        </div>

        {/* ══ Columna derecha ══ */}
        <aside className="col-span-12 space-y-5 lg:col-span-4">

          {/* Próximos Eventos */}
          <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-[0_4px_24px_-10px_rgba(20,20,20,0.12)]">
            <h2 className="font-headline-md text-base font-bold text-on-surface">Próximos Eventos</h2>
            <div className="mt-4 space-y-4">
              {eventos.length === 0 && (
                <p className="text-xs italic text-on-surface-variant">No hay eventos programados por ahora.</p>
              )}
              {eventos.slice(0, 4).map((ev) => {
                const f = fechaCorta(ev.fecha);
                return (
                  <div key={ev.id} className="flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FF9B18]/15 text-[#E8890C]">
                      <span className="text-lg font-bold leading-none">{f.dia}</span>
                      <span className="text-[9px] font-bold uppercase">{f.mes}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-on-surface">{ev.titulo}</h3>
                      <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
                        {ev.hora ? `${String(ev.hora).slice(0, 5)} · ` : ''}{ev.lugar}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colaboradores Destacados (autores reales del feed) */}
          {autores.length > 0 && (
            <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-[0_4px_24px_-10px_rgba(20,20,20,0.12)]">
              <h2 className="font-headline-md text-base font-bold text-on-surface">Colaboradores Destacados</h2>
              <div className="mt-4 space-y-3">
                {autores.map((a) => (
                  <div key={a.autor_nombre} className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FF9B18]/15 text-xs font-bold text-[#E8890C]">
                      {iniciales(a.autor_nombre)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">{a.autor_nombre}</p>
                      <p className="text-[11px] capitalize text-on-surface-variant">{a.autor_rol}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pulso de la Comunidad (datos reales, en naranja de marca) */}
          <div className="rounded-3xl bg-gradient-to-br from-[#F34B26] to-[#FF9B18] p-6 text-white shadow-[0_10px_30px_-10px_rgba(243,75,38,0.45)]">
            <h2 className="font-headline-md text-base font-bold">Pulso de la Comunidad</h2>
            <p className="mt-0.5 text-xs text-white/85">Actividad real de la red Alumni UCR.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/15 p-3">
                <p className="text-xl font-bold leading-none">{blogs.length}</p>
                <p className="mt-1 text-[11px] font-semibold text-white/85">Publicaciones</p>
              </div>
              <div className="rounded-xl bg-white/15 p-3">
                <p className="text-xl font-bold leading-none">{eventos.length}</p>
                <p className="mt-1 text-[11px] font-semibold text-white/85">Eventos próximos</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── MODAL COMPOSITOR ──────────────────────────────────────────────── */}
      {modalAbierto && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={cerrarModal}
        >
          <div
            className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle móvil */}
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-outline-variant sm:hidden" />

            <div className="p-6">
              {/* Cabecera */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-headline-md text-lg font-bold text-primary">
                  {editandoId ? 'Editar publicación' : 'Nueva publicación'}
                </h2>
                <button
                  id="btn-cerrar-modal"
                  onClick={cerrarModal}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={publicar} className="space-y-4">
                {/* Selector de tipo */}
                <div className="flex gap-2">
                  {(Object.entries(TIPOS) as [keyof typeof TIPOS, typeof TIPOS[keyof typeof TIPOS]][]).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      id={`tipo-${k}`}
                      onClick={() => setTipo(k)}
                      className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 text-xs font-bold transition-all ${
                        tipo === k
                          ? `${v.color} border-current shadow-sm`
                          : 'border-outline-variant bg-surface-container text-on-surface-variant hover:border-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{v.icon}</span>
                      {v.label}
                    </button>
                  ))}
                </div>

                {/* Título */}
                <input
                  id="input-titulo"
                  value={titulo}
                  onChange={(e) => setTituloV(e.target.value)}
                  placeholder="Título de tu publicación"
                  maxLength={120}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />

                {/* Contenido */}
                <textarea
                  id="input-contenido"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Compartí tu noticia, sugerencia o comentario con la comunidad UCR…"
                  rows={5}
                  maxLength={1200}
                  className="w-full resize-none rounded-xl border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />

                {/* Aviso */}
                <p className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] text-emerald-500">bolt</span>
                  {editandoId
                    ? 'La publicación mostrará la etiqueta "Editada".'
                    : 'Tu publicación aparecerá en la comunidad de inmediato.'}
                </p>

                {/* Botón */}
                <button
                  id="btn-enviar-publicacion"
                  type="submit"
                  disabled={enviando}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-[#F34B26] py-3 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-lg">{editandoId ? 'save' : 'send'}</span>
                  {enviando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Publicar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL MIS PUBLICACIONES ───────────────────────────────────────── */}
      {misPublicAbierto && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setMisPublicAbierto(false)}
        >
          <div
            className="w-full max-w-lg animate-slide-up overflow-hidden rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera con degradado de marca */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#003B5C] to-[#0080B5] px-6 py-5 text-white">
              <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/30 sm:hidden" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
                    <span className="material-symbols-outlined text-xl">list_alt</span>
                  </span>
                  <div>
                    <h2 className="font-headline-md text-lg font-bold leading-tight">Mis publicaciones</h2>
                    <p className="text-xs text-white/70">
                      {mios.length === 1 ? '1 aporte publicado' : `${mios.length} aportes publicados`} en la comunidad
                    </p>
                  </div>
                </div>
                <button
                  id="btn-cerrar-mis-publicaciones"
                  onClick={() => setMisPublicAbierto(false)}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            <div className="p-5">
              {mios.length === 0 ? (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined mb-2 text-5xl text-outline">post_add</span>
                  <p className="font-semibold text-primary">Aún no publicaste nada</p>
                  <p className="mt-1 text-sm text-on-surface-variant">Tu primer aporte aparecerá aquí.</p>
                </div>
              ) : (
                <ul className="max-h-[60vh] space-y-3 overflow-y-auto overscroll-contain pr-1">
                  {mios.map((m) => {
                    const t = TIPOS[m.tipo] || TIPOS.noticia;
                    return (
                      <li
                        key={m.id}
                        className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-all hover:border-secondary/40 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          {/* Ícono del tipo */}
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${t.color}`}>
                            <span className="material-symbols-outlined text-lg">{t.icon}</span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-primary">{m.titulo}</p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-on-surface-variant">
                              <span className="font-bold uppercase tracking-wide">{t.label}</span>
                              <span aria-hidden>·</span>
                              {timeAgo(m.created_at)}
                              {fueEditado(m) && (
                                <span className="rounded-full bg-surface-variant px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">
                                  Editada
                                </span>
                              )}
                            </p>
                          </div>
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Publicado
                          </span>
                        </div>

                        {/* Acciones */}
                        <div className="mt-3 flex justify-end gap-2 border-t border-outline-variant/60 pt-3">
                          <button
                            type="button"
                            onClick={() => abrirEdicion(m)}
                            className="flex items-center gap-1.5 rounded-full border border-outline-variant px-3.5 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:border-secondary hover:bg-secondary/10 hover:text-secondary"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setAEliminar(m)}
                            className="flex items-center gap-1.5 rounded-full border border-outline-variant px-3.5 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:border-error hover:bg-error/10 hover:text-error"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                            Eliminar
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMAR ELIMINACIÓN ───────────────────────────────────── */}
      {aEliminar && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => { if (!eliminando) setAEliminar(null); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined mb-2 text-4xl text-error">delete_forever</span>
            <h2 className="font-headline-md text-lg font-bold text-primary">¿Eliminar publicación?</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              <span className="font-semibold">“{aEliminar.titulo}”</span> se eliminará de la comunidad de forma permanente.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setAEliminar(null)}
                disabled={eliminando}
                className="flex-1 rounded-xl border border-outline-variant py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={eliminando}
                className="flex-1 cursor-pointer rounded-full border-0 bg-error py-2.5 text-sm font-bold text-on-error shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
              >
                {eliminando ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
