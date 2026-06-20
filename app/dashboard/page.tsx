'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
import StudentNav from '@/components/StudentNav';
import ExalumnoDashboard from '@/components/ExalumnoDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { obtenerInformacionEstudiante } from '@/lib/perfilAcademico';
import { obtenerProyectoDelEstudiante } from '@/lib/proyectoGraduacion';
import { obtenerHabilidadesDelEstudiante } from '@/lib/habilidades';
import {
  obtenerDirectorioEstudiantes,
  obtenerDirectorioExalumnos,
  calcularScore,
} from '@/lib/misMatches';
import { fotoDe, fotoPorNombre, FOTO_FALLBACK } from '@/lib/fotosDemo';

interface Perfil {
  nombre?: string;
  correo_electronico?: string;
  estado?: string;
  foto_url?: string;
  roles?: { nombre?: string } | null;
}

// Match calculado (exalumno sugerido para el estudiante) con score > 60.
interface MatchEstudiante {
  exa: { id: string; nombre?: string; carreras?: string[]; facultades?: string[] };
  score: number;
  comunes: string[];
  interdisciplinario: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading, signOut } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [perfilCargando, setPerfilCargando] = useState(true);

  // Estado de avance del perfil (RF-03), igual que en /perfil-estudiante.
  const [estado, setEstado] = useState({ academica: false, proyecto: false, habilidades: false });
  // RF-03: al llegar al 100% el sistema pregunta si el perfil quedó finalizado.
  const [finalizado, setFinalizado] = useState(false);
  // Saludo por hora del día (en efecto para evitar desajuste de hidratación SSR).
  const [saludo, setSaludo] = useState('Hola');
  // Matches (exalumnos sugeridos) con score > 60, calculados con el motor real.
  const [matches, setMatches] = useState<MatchEstudiante[]>([]);

  // Protección client-side: si no hay sesión una vez hidratado, redirige al login.
  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  // Carga el perfil (con rol) para mostrar el panel correspondiente.
  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const res = await obtenerPerfil(token);
        if (activo) setPerfil(res?.data ?? null);
      } catch {
        if (activo) setPerfil(null);
      } finally {
        if (activo) setPerfilCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [token]);

  const refrescarEstado = useCallback(async () => {
    if (!token || !user?.id) return;
    const [info, proyecto, habilidades] = await Promise.all([
      obtenerInformacionEstudiante(token, user.id).catch(() => null),
      obtenerProyectoDelEstudiante(token, user.id).catch(() => null),
      obtenerHabilidadesDelEstudiante(token, user.id).catch(() => null),
    ]);
    const academica = Boolean(info);
    const proyectoOk = Boolean(proyecto && (proyecto.titulo_proyecto || proyecto.id));
    const habilidadesOk = Array.isArray(habilidades)
      ? habilidades.length > 0
      : Boolean(habilidades && (habilidades.tecnicas || habilidades.id));
    setEstado({ academica, proyecto: proyectoOk, habilidades: habilidadesOk });
  }, [token, user?.id]);

  useEffect(() => {
    if (token && user?.id) refrescarEstado();
  }, [token, user?.id, refrescarEstado]);

  useEffect(() => {
    const h = new Date().getHours();
    setSaludo(h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches');
  }, []);

  // Matches del estudiante (RF-06): se cruza su propio perfil del directorio
  // contra los exalumnos y se filtran los de score > 60, igual que /mis-matches.
  useEffect(() => {
    const esEstudiante = perfil?.roles?.nombre?.toLowerCase().trim() === 'estudiante';
    if (!token || !user?.id || !esEstudiante) return;
    let activo = true;
    (async () => {
      try {
        const [dirEst, dirExa] = await Promise.all([
          obtenerDirectorioEstudiantes(token),
          obtenerDirectorioExalumnos(),
        ]);
        if (!activo) return;
        const yo = (dirEst?.data ?? []).find((e: { id: string }) => e.id === user.id);
        if (!yo) {
          setMatches([]);
          return;
        }
        const ranking = (dirExa?.data ?? [])
          .map((exa: MatchEstudiante['exa']) => ({ exa, ...calcularScore(exa, yo) }))
          .filter((m: MatchEstudiante) => m.score > 60)
          .sort((a: MatchEstudiante, b: MatchEstudiante) => b.score - a.score)
          .slice(0, 6);
        setMatches(ranking as MatchEstudiante[]);
      } catch {
        if (activo) setMatches([]);
      }
    })();
    return () => {
      activo = false;
    };
  }, [token, user?.id, perfil]);

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  // Evita parpadeo de contenido protegido mientras se hidrata o se redirige.
  if (loading || !token || perfilCargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ucr-surface font-brand-body text-ucr-on-surface">
        Cargando…
      </div>
    );
  }

  const correo = user?.email ?? perfil?.correo_electronico ?? '—';
  const rol = perfil?.roles?.nombre?.toLowerCase().trim();

  // Panel dedicado del exalumno (identidad de marca).
  if (rol === 'exalumno') {
    return (
      <ExalumnoDashboard
        perfil={perfil}
        correo={correo}
        onSignOut={handleSignOut}
        userId={user?.id}
        token={token ?? undefined}
      />
    );
  }

  // Panel del administrador (identidad del landing) con matching interdisciplinario.
  if (rol === 'admin') {
    return <AdminDashboard correo={correo} onSignOut={handleSignOut} />;
  }

  const completadas = [estado.academica, estado.proyecto, estado.habilidades].filter(Boolean).length;
  const progreso = Math.round((completadas / 3) * 100);
  const nombre = perfil?.nombre?.trim().split(/\s+/)[0] || correo.split('@')[0] || 'estudiante';
  // Foto del estudiante: foto_url (BD) → foto por nombre → retrato de respaldo.
  const fotoSrc = fotoDe(perfil);

  return (
    <div className="min-h-screen bg-ucr-surface font-brand-body text-ucr-on-surface">
      <StudentNav onSignOut={handleSignOut} />

      {/* Contenido principal */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {/* Encabezado */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ucr-on-surface-variant">Panel de estudiante</p>
            <h1 className="mt-1 font-ucr-display text-3xl font-bold tracking-tight text-ucr-primary sm:text-4xl">
              {saludo}, {nombre}
            </h1>
          </div>
          <Link
            href="/perfil-estudiante"
            className="inline-flex items-center gap-2 rounded-full bg-ucr-esmeralda px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-base">tune</span> Completar perfil
          </Link>
        </header>

        {/* RF-03: al llegar al 100% el sistema pregunta si el perfil quedó finalizado */}
        {progreso === 100 && (
          <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ucr-esmeralda/30 bg-ucr-esmeralda/5 p-6">
            {finalizado ? (
              <p className="font-brand-heading text-base font-semibold text-ucr-esmeralda">
                ✓ Marcaste tu perfil como finalizado. Ya está listo para aparecer en el directorio.
              </p>
            ) : (
              <>
                <div>
                  <h2 className="font-brand-heading text-lg font-bold text-ucr-on-surface">
                    ¿Diste por finalizado tu perfil?
                  </h2>
                  <p className="mt-1 text-sm text-ucr-on-surface-variant">
                    Llegaste al 100%. Confirma si ya está listo o seguí editándolo.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setFinalizado(true)} className="btn-primary">
                    Sí, está listo
                  </button>
                  <Link
                    href="/perfil-estudiante"
                    className="rounded-full border border-ucr-outline-variant px-5 py-2 text-sm font-semibold text-ucr-primary"
                  >
                    Seguir editando
                  </Link>
                </div>
              </>
            )}
          </section>
        )}

        {/* Bento moderno */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Columna principal */}
          <div className="space-y-6 lg:col-span-2">
            {/* Fila 1: perfil destacado + métricas */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Tarjeta de perfil con foto (usa foto_url; respaldo a retrato real) */}
              <article className="relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-3xl shadow-lg">
                <img
                  src={fotoSrc}
                  alt={perfil?.nombre || nombre}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src.indexOf(FOTO_FALLBACK) === -1) img.src = FOTO_FALLBACK;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ucr-primary via-ucr-primary/35 to-transparent" />
                <div className="relative p-6 text-white">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    <span className="material-symbols-outlined text-sm">school</span> Estudiante UCR
                  </span>
                  <h2 className="mt-3 font-brand-heading text-xl font-bold">{perfil?.nombre || nombre}</h2>
                  <p className="text-sm text-white/85">
                    {progreso === 100 ? 'Perfil completo' : `Perfil al ${progreso}%`}
                  </p>
                  <Link
                    href="/perfil-estudiante"
                    className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold text-ucr-primary"
                  >
                    Ver mi perfil <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </article>

              <div className="grid gap-6">
                {/* KPI avance + dot-matrix */}
                <article className="rounded-3xl bg-white p-6 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-ucr-display text-4xl font-bold text-ucr-primary">{progreso}%</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ucr-outline">
                        Avance de tu perfil
                      </p>
                    </div>
                    <span className="material-symbols-outlined rounded-full bg-ucr-esmeralda/10 p-2 text-ucr-esmeralda">
                      trending_up
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < Math.round((progreso / 100) * 30) ? 'bg-ucr-esmeralda' : 'bg-ucr-surface-container'
                        }`}
                      />
                    ))}
                  </div>
                </article>
                {/* Dos mini tiles */}
                <div className="grid grid-cols-2 gap-6">
                  <article className="rounded-3xl bg-white p-5 shadow-lg">
                    <p className="font-ucr-display text-2xl font-bold text-ucr-primary">{completadas}/3</p>
                    <p className="text-xs text-ucr-on-surface-variant">Secciones completas</p>
                  </article>
                  <article className="rounded-3xl bg-white p-5 shadow-lg">
                    <p className={`font-ucr-display text-2xl font-bold ${progreso === 100 ? 'text-ucr-esmeralda' : 'text-ucr-naranja'}`}>
                      {progreso === 100 ? 'Sí' : 'No'}
                    </p>
                    <p className="text-xs text-ucr-on-surface-variant">En el directorio</p>
                  </article>
                </div>
              </div>
            </div>

            {/* Fila 2: gauge + mentores */}
            <div className="grid gap-6 sm:grid-cols-2">
              <article className="rounded-3xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 font-brand-heading text-base font-bold text-ucr-on-surface">Seguí tu avance</h3>
                <div className="flex items-center gap-5">
                  <div
                    className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
                    style={{ background: `conic-gradient(var(--ucr-esmeralda) ${progreso * 3.6}deg, #e7eef0 0deg)` }}
                  >
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
                      <span className="font-ucr-display text-2xl font-bold text-ucr-primary">{progreso}%</span>
                    </div>
                  </div>
                  <ul className="flex-1 space-y-2 text-sm">
                    {[
                      { ok: estado.academica, label: 'Académica' },
                      { ok: estado.proyecto, label: 'Proyecto' },
                      { ok: estado.habilidades, label: 'Habilidades' },
                    ].map((s) => (
                      <li key={s.label} className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${s.ok ? 'bg-ucr-esmeralda' : 'bg-ucr-outline-variant'}`} />
                        <span className={s.ok ? 'text-ucr-on-surface' : 'text-ucr-on-surface-variant'}>{s.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-lg">
                <div>
                  <h3 className="font-brand-heading text-base font-bold text-ucr-on-surface">Mentores para vos</h3>
                  <p className="mt-1 text-sm text-ucr-on-surface-variant">
                    Exalumnos que pueden apoyar tu proyecto de graduación.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {['bg-ucr-primary', 'bg-ucr-secondary', 'bg-ucr-esmeralda', 'bg-ucr-naranja'].map((c, i) => (
                      <span
                        key={i}
                        className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-bold text-white ${c}`}
                      >
                        {['A', 'U', 'C', 'R'][i]}
                      </span>
                    ))}
                  </div>
                  <Link href="/mis-matches" className="inline-flex items-center gap-1 text-sm font-bold text-ucr-secondary">
                    Ver matches <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </article>
            </div>
          </div>

          {/* Columna lateral */}
          <aside className="space-y-6">
            <article className="rounded-3xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 font-brand-heading text-base font-bold text-ucr-on-surface">Estado de tu perfil</h3>
              <ul className="space-y-3">
                {[
                  { ok: estado.academica, icon: 'school', label: 'Académica y situación socioeconómica' },
                  { ok: estado.proyecto, icon: 'lightbulb', label: 'Proyecto, áreas y tipo de apoyo' },
                  { ok: estado.habilidades, icon: 'stars', label: 'Habilidades' },
                ].map((s) => (
                  <li key={s.label} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ucr-surface-container">
                      <span className="material-symbols-outlined text-ucr-secondary">{s.icon}</span>
                    </span>
                    <span className="flex-1 text-sm text-ucr-on-surface">{s.label}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        s.ok ? 'bg-ucr-esmeralda/15 text-ucr-esmeralda' : 'bg-ucr-naranja/15 text-ucr-naranja'
                      }`}
                    >
                      {s.ok ? 'Completo' : 'Pendiente'}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl bg-gradient-to-br from-ucr-esmeralda to-ucr-primary p-6 text-white shadow-lg">
              <p className="text-sm text-white/80">Tu perfil</p>
              <p className="font-ucr-display text-4xl font-bold">{progreso}%</p>
              <p className="mt-1 text-sm text-white/85">
                {progreso === 100
                  ? '¡Completo! Ya aparecés en el directorio.'
                  : 'Completalo al 100% para aparecer en el directorio.'}
              </p>
              <Link
                href="/perfil-estudiante"
                className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold text-ucr-primary"
              >
                Continuar <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </article>

            <article className="rounded-3xl bg-white p-6 shadow-lg">
              <h3 className="mb-3 font-brand-heading text-base font-bold text-ucr-on-surface">Accesos rápidos</h3>
              <ul className="flex flex-col gap-1 text-sm">
                {[
                  { href: '/mis-matches', icon: 'handshake', label: 'Mis matches con mentores' },
                  { href: '/estudiantes', icon: 'groups', label: 'Directorio de exalumnos' },
                  { href: '/posiciones', icon: 'work', label: 'Empleos y pasantías' },
                  { href: '/mi-curriculum', icon: 'description', label: 'Mi currículum (CV + IA)' },
                ].map((a) => (
                  <li key={a.href}>
                    <Link
                      href={a.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-ucr-on-surface transition-colors hover:bg-ucr-surface-container"
                    >
                      <span className="material-symbols-outlined text-ucr-secondary">{a.icon}</span>
                      {a.label}
                      <span className="material-symbols-outlined ml-auto text-ucr-outline">chevron_right</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          </aside>
        </div>

        {/* Matches con score > 60 (RF-06, motor de scoring real) */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-brand-heading text-lg font-bold text-ucr-on-surface">
                Tus mejores coincidencias
              </h2>
              <p className="text-sm text-ucr-on-surface-variant">
                Exalumnos con afinidad mayor a 60 según tu carrera, áreas de interés y tipo de apoyo.
              </p>
            </div>
            <Link
              href="/mis-matches"
              className="inline-flex items-center gap-1 text-sm font-bold text-ucr-secondary"
            >
              Ver todos <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {matches.length === 0 ? (
            <p className="rounded-2xl bg-ucr-surface-container/60 p-6 text-center text-sm text-ucr-on-surface-variant">
              Aún no hay mentores con afinidad mayor a 60. Completá tu perfil (carrera, áreas de
              interés y tipo de apoyo) para mejorar tus coincidencias.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((m) => (
                <article key={m.exa.id} className="rounded-2xl border border-ucr-outline-variant p-4">
                  <div className="flex items-center gap-3">
                    {fotoPorNombre(m.exa.nombre) ? (
                      <img
                        src={fotoPorNombre(m.exa.nombre)}
                        alt={m.exa.nombre}
                        className="h-11 w-11 shrink-0 rounded-full object-cover object-top"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FOTO_FALLBACK;
                        }}
                      />
                    ) : (
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ucr-primary/10 font-bold text-ucr-primary">
                        {(m.exa.nombre || '?')
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-brand-heading text-sm font-bold text-ucr-on-surface">
                        {m.exa.nombre}
                      </h3>
                      <p className="truncate text-xs text-ucr-on-surface-variant">
                        {m.exa.carreras?.[0] || '—'}
                        {m.exa.facultades?.[0] ? ` · ${m.exa.facultades[0]}` : ''}
                      </p>
                    </div>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
                        m.score >= 70 ? 'bg-ucr-esmeralda' : 'bg-ucr-secondary'
                      }`}
                    >
                      {m.score}
                    </span>
                  </div>
                  {m.comunes?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.comunes.slice(0, 3).map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-ucr-celeste/10 px-2 py-0.5 text-xs font-medium text-ucr-secondary"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    {m.interdisciplinario ? (
                      <span className="rounded-full bg-ucr-naranja/15 px-2 py-0.5 text-xs font-semibold text-ucr-naranja">
                        Interdisciplinario
                      </span>
                    ) : (
                      <span />
                    )}
                    <Link href="/mis-matches" className="text-xs font-bold text-ucr-secondary">
                      Conectar →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
