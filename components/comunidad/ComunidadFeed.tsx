'use client';

// Espacio de Comunidad: feed de aportes aprobados + compositor por modal.
// Soporta estudiantes, exalumnos y voluntarios. Mobile-first.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificar } from '@/components/student/Toast';
import { listarBlogs, listarEventos, crearBlog, misBlogs } from '@/lib/comunidad';

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

const ROL_COLOR: Record<string, string> = {
  estudiante: 'bg-primary/10 text-primary',
  exalumno:   'bg-secondary/10 text-secondary',
  voluntario: 'bg-tertiary/10 text-tertiary',
  admin:      'bg-error/10 text-error',
};

const ESTADO_CLS: Record<string, string> = {
  aprobado:  'bg-emerald-100 text-emerald-700',
  rechazado: 'bg-red-100 text-red-700',
  pendiente: 'bg-amber-100 text-amber-700',
};

// ── Componente ─────────────────────────────────────────────────────────────────
export default function ComunidadFeed() {
  const { token } = useAuth();

  const [blogs,   setBlogs  ] = useState<Blog[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [mios,    setMios   ] = useState<Blog[]>([]);
  const [filtro,  setFiltro ] = useState<'todas' | 'noticia' | 'sugerencia' | 'comentario'>('todas');
  const [cargando, setCargando] = useState(true);

  // Modal compositor
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipo,      setTipo     ] = useState<'noticia' | 'sugerencia' | 'comentario'>('noticia');
  const [titulo,    setTituloV  ] = useState('');
  const [contenido, setContenido] = useState('');
  const [enviando,  setEnviando ] = useState(false);

  // Modal mis publicaciones
  const [misPublicAbierto, setMisPublicAbierto] = useState(false);

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

  // ── Publicar ──────────────────────────────────────────────────────────────
  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim())    { notificar('Escribí un título'); return; }
    if (!contenido.trim()) { notificar('Escribí el contenido'); return; }
    setEnviando(true);
    try {
      await crearBlog(token as string, { tipo, titulo: titulo.trim(), contenido: contenido.trim() });
      setTituloV(''); setContenido('');
      setModalAbierto(false);
      notificar('✅ Enviado — el admin lo revisará pronto');
      if (token) misBlogs(token).catch(() => []).then(setMios);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo enviar';
      notificar(`⚠️ ${msg}`);
    } finally {
      setEnviando(false);
    }
  };

  // ── Cerrar modal al click en overlay ─────────────────────────────────────
  const cerrarModal = () => { setModalAbierto(false); };

  const pendientes = mios.filter((m) => m.estado === 'pendiente').length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">

      {/* ── Hero compacto ── */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003B5C] via-[#005B82] to-[#0080B5] px-6 py-8 text-white shadow-lg">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">groups</span>
              <h1 className="font-headline-md text-2xl font-bold">Comunidad UCR</h1>
            </div>
            <p className="max-w-sm text-sm text-white/80">
              Compartí noticias, sugerencias y comentarios con la red. El administrador revisa cada publicación.
            </p>
          </div>
          {token && (
            <button
              id="btn-nueva-publicacion"
              onClick={() => setModalAbierto(true)}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#003B5C] shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">edit_note</span>
              Nueva publicación
            </button>
          )}
        </div>
      </header>

      {/* ── Próximos eventos ── */}
      {eventos.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            <span className="material-symbols-outlined text-base text-secondary">calendar_month</span>
            Próximos eventos
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {eventos.slice(0, 4).map((ev) => {
              const f = fechaCorta(ev.fecha);
              return (
                <article
                  key={ev.id}
                  className="flex gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-on-primary">
                    <span className="text-xl font-bold leading-none">{f.dia}</span>
                    <span className="text-[9px] font-bold uppercase">{f.mes}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-primary">{ev.titulo}</h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-on-surface-variant">
                      {ev.hora && (
                        <><span className="material-symbols-outlined text-[13px]">schedule</span>{String(ev.hora).slice(0, 5)}</>
                      )}
                      <span className="material-symbols-outlined text-[13px]">location_on</span>
                      <span className="truncate">{ev.lugar}</span>
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-on-surface-variant/70">{ev.descripcion}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Barra de filtros + indicador mis publicaciones ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['todas', 'noticia', 'sugerencia', 'comentario'] as const).map((t) => (
            <button
              key={t}
              id={`filtro-${t}`}
              onClick={() => setFiltro(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                filtro === t
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-secondary/60'
              }`}
            >
              {t === 'todas' ? 'Todas' : TIPOS[t].label}
            </button>
          ))}
        </div>
        {token && mios.length > 0 && (
          <button
            id="btn-mis-publicaciones"
            onClick={() => setMisPublicAbierto(true)}
            className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:border-secondary/60 hover:text-secondary"
          >
            <span className="material-symbols-outlined text-[14px]">list_alt</span>
            Mis publicaciones
            {pendientes > 0 && (
              <span className="h-4 min-w-[16px] rounded-full bg-amber-400 px-1 text-center text-[10px] font-bold text-white">
                {pendientes}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ── Feed ── */}
      <section className="space-y-4">
        {cargando ? (
          // Skeleton loader
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
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
          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center">
            <span className="material-symbols-outlined mb-3 text-5xl text-outline">forum</span>
            <p className="font-semibold text-primary">Aún no hay publicaciones</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              {token ? 'Sé la primera persona en aportar.' : 'Iniciá sesión para publicar.'}
            </p>
          </div>
        ) : (
          visibles.map((b) => {
            const t = TIPOS[b.tipo] || TIPOS.noticia;
            const rolCls = ROL_COLOR[b.autor_rol] || 'bg-surface-variant text-on-surface-variant';
            return (
              <article
                key={b.id}
                className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Header del post */}
                <div className="mb-3 flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {iniciales(b.autor_nombre)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-primary">{b.autor_nombre}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${rolCls}`}>
                        {b.autor_rol}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">{timeAgo(b.created_at)}</p>
                  </div>
                  {/* Badge tipo */}
                  <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${t.color}`}>
                    <span className="material-symbols-outlined text-[13px]">{t.icon}</span>
                    {t.label}
                  </span>
                </div>

                {/* Contenido */}
                <h3 className="mb-1.5 font-headline-md text-base font-semibold leading-snug text-primary">{b.titulo}</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">{b.contenido}</p>
              </article>
            );
          })
        )}
      </section>

      {/* ── CTA login si no hay token ── */}
      {!token && (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 text-center">
          <span className="material-symbols-outlined mb-2 text-3xl text-secondary">lock_open</span>
          <h3 className="font-semibold text-primary">Sumá tu voz a la comunidad</h3>
          <p className="mb-4 mt-1 text-sm text-on-surface-variant">
            Iniciá sesión como estudiante, exalumno o voluntario para publicar.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-transform hover:scale-105"
          >
            Iniciar sesión
          </a>
        </div>
      )}

      {/* ── Nota de comunidad ── */}
      <div className="flex items-start gap-3 rounded-2xl bg-[#E6F4F9] p-5">
        <span className="material-symbols-outlined text-2xl text-secondary">diversity_3</span>
        <div>
          <p className="font-semibold text-primary">Comunidad con propósito</p>
          <p className="mt-0.5 text-sm text-on-secondary-fixed-variant">
            Cada aporte fortalece la red Alumni UCR. Publicá con respeto y empatía.
          </p>
        </div>
      </div>

      {/* ── MODAL COMPOSITOR ──────────────────────────────────────────────── */}
      {modalAbierto && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={cerrarModal}
        >
          <div
            className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle móvil */}
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-outline-variant sm:hidden" />

            <div className="p-6">
              {/* Cabecera */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-headline-md text-lg font-bold text-primary">Nueva publicación</h2>
                <button
                  id="btn-cerrar-modal"
                  onClick={cerrarModal}
                  className="grid h-8 w-8 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
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
                  <span className="material-symbols-outlined text-[14px] text-amber-500">info</span>
                  Tu publicación será revisada por el administrador antes de aparecer.
                </p>

                {/* Botón */}
                <button
                  id="btn-enviar-publicacion"
                  type="submit"
                  disabled={enviando}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-bold text-on-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                  {enviando ? 'Enviando…' : 'Enviar solicitud'}
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
            className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-surface-container-lowest shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-outline-variant sm:hidden" />
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-headline-md text-lg font-bold text-primary">Mis publicaciones</h2>
                <button
                  id="btn-cerrar-mis-publicaciones"
                  onClick={() => setMisPublicAbierto(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {mios.length === 0 ? (
                <p className="py-8 text-center text-sm text-on-surface-variant">No tenés publicaciones aún.</p>
              ) : (
                <ul className="max-h-80 space-y-3 overflow-y-auto">
                  {mios.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4"
                    >
                      <span className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TIPOS[m.tipo]?.color || ''}`}>
                        {TIPOS[m.tipo]?.label || m.tipo}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-primary">{m.titulo}</p>
                        <p className="text-[11px] text-on-surface-variant">{timeAgo(m.created_at)}</p>
                      </div>
                      <span className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${ESTADO_CLS[m.estado] || 'bg-surface-variant text-on-surface-variant'}`}>
                        {m.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
