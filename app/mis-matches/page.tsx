'use client';

// Centro de Matches (estudiante): grid de tarjetas de conexión con datos reales.
// Los perfiles sugeridos son exalumnos reales del directorio (RF-02) puntuados
// por afinidad (carrera 30 + áreas 40 + apoyo 30); las solicitudes salen del
// motor RF-06 (/matches-mentoria/mis-matches).

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
import { obtenerSugeridos, obtenerMisMatches } from '@/lib/matchesEstudiante';

const APOYO: { k: string; label: string; icon: string }[] = [
  { k: 'mentoria', label: 'Mentoría', icon: 'school' },
  { k: 'empleo', label: 'Empleo', icon: 'work' },
  { k: 'pasantia', label: 'Pasantía', icon: 'menu_book' },
  { k: 'colaboracion', label: 'Colaboración', icon: 'diversity_3' },
  { k: 'donacion', label: 'Donación', icon: 'volunteer_activism' },
];

const ESTADO_SOLICITUD: Record<string, { label: string; color: string; barra: string; pct: number }> = {
  sugerido: { label: 'Sugerido', color: 'text-outline', barra: 'bg-outline', pct: 20 },
  contactado: { label: 'En revisión', color: 'text-secondary', barra: 'bg-secondary', pct: 65 },
  activo: { label: 'Conectado', color: 'text-tertiary', barra: 'bg-tertiary', pct: 100 },
};

function completitud(p: ReturnType<typeof usePerfilEstudiante>['perfil']): number {
  const campos = [
    p.nombre, p.apellidos, p.telefono, p.carrera, p.resumen, p.foto,
    p.proyectoTitulo, p.habilidadesTecnicas,
    p.experiencias.length ? 'x' : '', p.intereses.length ? 'x' : '',
  ];
  return Math.round((campos.filter((c) => String(c).trim()).length / campos.length) * 100);
}

const iniciales = (n: string) => (n || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
const apoyoDe = (exa: any) => APOYO.find((a) => exa?.apoyo?.[a.k]);

export default function MisMatchesPage() {
  const router = useRouter();
  const { token, loading } = useAuth();
  const { perfil } = usePerfilEstudiante();

  const [sugeridos, setSugeridos] = useState<any[]>([]);
  const [misMatches, setMisMatches] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!loading && !token) router.replace('/login');
  }, [loading, token, router]);

  useEffect(() => {
    let activo = true;
    (async () => {
      const [sug, mm] = await Promise.all([
        obtenerSugeridos(perfil),
        token ? obtenerMisMatches(token) : Promise.resolve([]),
      ]);
      if (!activo) return;
      setSugeridos(sug);
      setMisMatches(mm);
      setCargando(false);
    })();
    return () => { activo = false; };
  }, [perfil, token]);

  const pct = useMemo(() => completitud(perfil), [perfil]);
  const solicitudes = misMatches.filter((m) => m.estado !== 'sugerido');
  const interesar = (nombre: string) => notificar(`📨 Registramos tu interés por ${nombre}. Te avisaremos cuando responda.`);

  return (
    <StudentShell active="matches">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Encabezado */}
        <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-headline-md text-2xl text-primary sm:text-3xl">Mis Matches</h1>
            <p className="max-w-2xl text-on-surface-variant">Conexiones de la red de egresados, ordenadas por compatibilidad con tu perfil.</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
            <span className="material-symbols-outlined text-[16px]">bolt</span> {pct}% Perfil Completado
          </span>
        </section>

        {/* Banner del algoritmo */}
        <section className="flex items-start gap-3 rounded-2xl border border-secondary/20 bg-secondary/5 p-5">
          <span className="material-symbols-outlined mt-0.5 text-secondary">auto_awesome</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-secondary">Tus conexiones personalizadas</p>
            <p className="text-sm text-on-surface-variant">
              El algoritmo calculó tu compatibilidad con cada exalumno según <b>carrera (30 pts)</b>, <b>áreas en común (40 pts)</b> y <b>tipo de apoyo (30 pts)</b>.
            </p>
          </div>
        </section>

        {/* Grid de tarjetas de conexión */}
        {cargando ? (
          <p className="py-16 text-center text-sm text-on-surface-variant">Buscando perfiles afines…</p>
        ) : sugeridos.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-10 text-center">
            <span className="material-symbols-outlined mb-2 text-4xl text-outline">groups</span>
            <p className="font-body-semibold text-primary">Aún no hay exalumnos para conectar</p>
            <p className="text-sm text-on-surface-variant">Completá tus áreas e intereses en el perfil para mejorar tus coincidencias.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sugeridos.map((s) => {
              const ap = apoyoDe(s);
              const tags = (s.comunes?.length ? s.comunes : s.areas || []).slice(0, 3);
              return (
                <article key={s.id} className="flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-1 hover:border-secondary/50 hover:shadow-[0_20px_44px_-16px_rgba(0,40,55,0.3)]">
                  <div className="mb-3 flex items-start gap-3">
                    {s.foto_perfil ? (
                      <img src={s.foto_perfil} alt={s.nombre} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">{iniciales(s.nombre)}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-body-semibold text-primary">{s.nombre}</h3>
                      <p className="truncate text-xs text-on-surface-variant">{s.carreras?.[0] || s.facultades?.[0] || 'Exalumno UCR'}</p>
                      <p className="text-[11px] text-on-surface-variant">Graduado UCR{s.anio_graduacion ? ` · ${s.anio_graduacion}` : ''}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-on-primary">{s.score}%</span>
                  </div>

                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-primary">Exalumno</span>
                    {ap && (
                      <span className="flex items-center gap-1 rounded border border-secondary/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
                        <span className="material-symbols-outlined text-[12px]">{ap.icon}</span>{ap.label}
                      </span>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {tags.map((t: string) => (
                        <span key={t} className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex gap-2">
                    <button type="button" onClick={() => interesar(s.nombre)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-on-primary transition-colors hover:bg-secondary">
                      <span className="material-symbols-outlined text-[18px]">diamond</span> Conectar
                    </button>
                    <button type="button" onClick={() => router.push('/directorio')} title="Ver perfil" aria-label={`Ver perfil de ${s.nombre}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-outline-variant text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Explorar */}
        {sugeridos.length > 0 && (
          <div className="flex justify-center pt-2">
            <button type="button" onClick={() => notificar('Estás viendo todas tus conexiones afines.')} className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-3 text-sm font-bold text-primary transition-colors hover:border-secondary">
              <span className="material-symbols-outlined text-[18px]">travel_explore</span> Explorar todas las conexiones
            </button>
          </div>
        )}

        {/* Solicitudes enviadas (motor RF-06) */}
        {solicitudes.length > 0 && (
          <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-primary">Solicitudes Enviadas</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {solicitudes.map((m) => {
                const e = ESTADO_SOLICITUD[m.estado] || ESTADO_SOLICITUD.sugerido;
                return (
                  <div key={m.id}>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="truncate font-body-semibold text-primary">{m.usuarios?.nombre || 'Conexión'}</span>
                      <span className={e.color}>{e.label}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className={`h-full ${e.barra}`} style={{ width: `${e.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </StudentShell>
  );
}
