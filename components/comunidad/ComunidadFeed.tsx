'use client';

// Espacio de Comunidad (compartido por estudiantes, exalumnos y visitantes):
// eventos próximos + blog de aportes (noticias, sugerencias, comentarios) que se
// publican tras la aprobación del administrador. Diseño bento de marca, responsivo.

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificar } from '@/components/student/Toast';
import { listarBlogs, listarEventos, crearBlog, misBlogs } from '@/lib/comunidad';

const card = 'rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';

const TIPOS: Record<string, { label: string; icon: string; cls: string }> = {
  noticia: { label: 'Noticia', icon: 'campaign', cls: 'bg-secondary/10 text-secondary' },
  sugerencia: { label: 'Sugerencia', icon: 'lightbulb', cls: 'bg-tertiary/10 text-tertiary' },
  comentario: { label: 'Comentario', icon: 'forum', cls: 'bg-primary/10 text-primary' },
};
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const iniciales = (n: string) => (n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const fechaCorta = (iso: string) => {
  const [y, m, d] = (iso || '').split('-').map(Number);
  return { dia: d || '', mes: MESES[(m || 1) - 1] || '' };
};

export default function ComunidadFeed() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [mios, setMios] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<string>('todas');

  // Compositor
  const [tipo, setTipo] = useState('noticia');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    listarBlogs().then(setBlogs);
    listarEventos().then(setEventos);
    if (token) misBlogs(token).then(setMios);
  };
  useEffect(cargar, [token]);

  const visibles = useMemo(
    () => (filtro === 'todas' ? blogs : blogs.filter((b) => b.tipo === filtro)),
    [blogs, filtro],
  );

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) { notificar('Completá el título y el contenido'); return; }
    setEnviando(true);
    try {
      await crearBlog(token as string, { tipo, titulo: titulo.trim(), contenido: contenido.trim() });
      setTitulo(''); setContenido('');
      notificar('✅ Publicación enviada — la revisará el administrador');
      if (token) misBlogs(token).then(setMios);
    } catch {
      notificar('No se pudo publicar. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-8 p-6 lg:p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 text-white">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10">
          <span className="material-symbols-outlined mb-2 text-4xl">groups</span>
          <h1 className="font-headline-md text-2xl sm:text-3xl">Comunidad UCR</h1>
          <p className="mt-1 max-w-2xl text-white/90">Noticias, sugerencias y eventos de nuestra red. Compartí tu voz y mantenete al día con lo que construimos juntos.</p>
        </div>
      </section>

      {/* Eventos próximos */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-headline-md text-xl text-primary">
          <span className="material-symbols-outlined text-secondary">calendar_month</span> Próximos eventos
        </h2>
        {eventos.length === 0 ? (
          <div className={`${card} p-6 text-center text-sm text-on-surface-variant`}>Aún no hay eventos publicados. ¡Volvé pronto!</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((ev) => {
              const f = fechaCorta(ev.fecha);
              return (
                <article key={ev.id} className={`${card} flex gap-4 p-5 transition-all hover:-translate-y-1`}>
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-on-primary">
                    <span className="text-2xl font-bold leading-none">{f.dia}</span>
                    <span className="text-[10px] font-bold uppercase">{f.mes}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-body-semibold text-primary">{ev.titulo}</h3>
                    <p className="mb-1 flex items-center gap-3 text-xs text-on-surface-variant">
                      {ev.hora && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{String(ev.hora).slice(0, 5)}</span>}
                      <span className="flex items-center gap-1 truncate"><span className="material-symbols-outlined text-[14px]">location_on</span>{ev.lugar}</span>
                    </p>
                    <p className="line-clamp-2 text-sm text-on-surface-variant">{ev.descripcion}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Feed del blog */}
        <section className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-headline-md text-xl text-primary">
              <span className="material-symbols-outlined text-secondary">article</span> Blog de la comunidad
            </h2>
            <div className="flex flex-wrap gap-2">
              {['todas', 'noticia', 'sugerencia', 'comentario'].map((t) => (
                <button key={t} onClick={() => setFiltro(t)}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition-colors ${filtro === t ? 'bg-primary text-on-primary' : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-secondary'}`}>
                  {t === 'todas' ? 'Todas' : TIPOS[t].label}
                </button>
              ))}
            </div>
          </div>

          {visibles.length === 0 ? (
            <div className={`${card} p-10 text-center`}>
              <span className="material-symbols-outlined mb-2 text-4xl text-outline">forum</span>
              <p className="font-body-semibold text-primary">Todavía no hay publicaciones</p>
              <p className="text-sm text-on-surface-variant">Sé la primera persona en aportar a la comunidad.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibles.map((b) => {
                const t = TIPOS[b.tipo] || TIPOS.noticia;
                return (
                  <article key={b.id} className={`${card} p-6 transition-all hover:-translate-y-0.5`}>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-bold text-primary">{iniciales(b.autor_nombre)}</span>
                      <div className="min-w-0">
                        <p className="font-body-semibold text-primary">{b.autor_nombre}</p>
                        <p className="text-[11px] uppercase tracking-wider text-on-surface-variant">{b.autor_rol} · {new Date(b.created_at).toLocaleDateString('es-CR')}</p>
                      </div>
                      <span className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${t.cls}`}>
                        <span className="material-symbols-outlined text-[14px]">{t.icon}</span>{t.label}
                      </span>
                    </div>
                    <h3 className="mb-1 font-headline-md text-lg text-primary">{b.titulo}</h3>
                    <p className="whitespace-pre-line text-on-surface-variant">{b.contenido}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Compositor / lateral */}
        <aside className="space-y-6">
          {token ? (
            <form onSubmit={publicar} className={`${card} p-6`}>
              <h3 className="mb-4 flex items-center gap-2 font-body-semibold text-primary">
                <span className="material-symbols-outlined text-secondary">edit_note</span> Aportá a la comunidad
              </h3>
              <div className="mb-3 flex flex-wrap gap-2">
                {Object.entries(TIPOS).map(([k, v]) => (
                  <button key={k} type="button" onClick={() => setTipo(k)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${tipo === k ? 'bg-secondary text-on-secondary' : 'border border-outline-variant text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[16px]">{v.icon}</span>{v.label}
                  </button>
                ))}
              </div>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título"
                className="mb-3 w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30" />
              <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder="Compartí tu noticia, sugerencia o comentario…"
                className="mb-3 min-h-[120px] w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30" />
              <button type="submit" disabled={enviando}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-3 font-bold text-on-primary transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                <span className="material-symbols-outlined">send</span> {enviando ? 'Enviando…' : 'Publicar'}
              </button>
              <p className="mt-2 text-center text-[11px] text-on-surface-variant">Tu publicación será revisada por el administrador antes de aparecer.</p>

              {mios.length > 0 && (
                <div className="mt-5 border-t border-outline-variant pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mis publicaciones</p>
                  <ul className="space-y-2">
                    {mios.slice(0, 5).map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-on-surface">{m.titulo}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${m.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700' : m.estado === 'rechazado' ? 'bg-error/10 text-error' : 'bg-amber-100 text-amber-800'}`}>{m.estado}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          ) : (
            <div className={`${card} p-6 text-center`}>
              <span className="material-symbols-outlined mb-2 text-3xl text-secondary">lock_open</span>
              <h3 className="font-body-semibold text-primary">Sumá tu voz</h3>
              <p className="mb-4 text-sm text-on-surface-variant">Iniciá sesión como estudiante o exalumno para publicar en la comunidad.</p>
              <a href="/login" className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-on-secondary">Iniciar sesión</a>
            </div>
          )}

          <div className="rounded-2xl border-none bg-[#E6F4F9] p-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-3xl text-secondary">diversity_3</span>
              <div>
                <h3 className="font-body-semibold text-primary">Comunidad con propósito</h3>
                <p className="mt-1 text-sm text-on-secondary-fixed-variant">Cada aporte fortalece la red Alumni UCR. Compartí con respeto y empatía.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
