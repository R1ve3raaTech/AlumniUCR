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
import { obtenerSugeridos, obtenerMisMatches, conectarConExalumno } from '@/lib/matchesEstudiante';

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

// Mismo cálculo que el dashboard: campos obligatorios de RF-03 (información
// académica, proyecto de graduación y áreas de interés), para que el % de
// perfil completo sea consistente en todas las pantallas.
function completitud(p: ReturnType<typeof usePerfilEstudiante>['perfil']): number {
  const campos = [
    p.carne, p.carrera, p.facultad, p.sede, p.anioIngreso, p.nivel,
    p.proyectoTitulo, p.proyectoDescripcion, p.areaTematica, p.proyectoTipo,
    p.proyectoAreas.length ? 'x' : '',
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
  const [conectando, setConectando] = useState<string | null>(null);

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

  // Inicia la conexión real (RF-06): crea/usa el match y dispara el email al exalumno.
  const conectar = async (idExalumno: string, nombre: string) => {
    if (!token || conectando) return;
    setConectando(idExalumno);
    try {
      await conectarConExalumno(token, idExalumno, misMatches);
      notificar(`✅ Le avisamos a ${nombre} que querés conectar. Te va a llegar su contacto cuando acepte.`);
      const actualizados = await obtenerMisMatches(token);
      setMisMatches(actualizados);
    } catch {
      notificar('❌ No pudimos enviar la solicitud. Intentá de nuevo en un momento.');
    } finally {
      setConectando(null);
    }
  };

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

            {/* Match Estratégico (mejor exalumno real) */}
            {destacado ? (
              <div className="overflow-hidden rounded-xl shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]">
                <div className="flex flex-col items-center gap-8 bg-gradient-to-br from-primary to-secondary p-8 md:flex-row">
                  <div className="relative shrink-0">
                    <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-xl border-4 border-secondary-container/30 bg-white/10 font-display-lg text-4xl font-bold text-white">
                      {destacado.foto_perfil ? <img src={destacado.foto_perfil} alt={destacado.nombre} className="h-full w-full object-cover" /> : iniciales(destacado.nombre)}
                    </div>
                    <span className="absolute -bottom-2 -right-2 rounded-lg bg-secondary-container px-2 py-1 text-[10px] font-bold text-on-secondary-container shadow-lg">MATCH {destacado.score}%</span>
                  </div>
                  <div className="flex-1 space-y-2 text-center text-white md:text-left">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      <span className="material-symbols-outlined text-[18px] text-secondary-fixed-dim">verified</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Mejor afinidad para vos</span>
                    </div>
                    <h2 className="font-headline-md text-2xl leading-none">{destacado.nombre}</h2>
                    <p className="text-secondary-fixed-dim">
                      {(destacado.carreras?.[0] || 'Exalumno UCR')}{destacado.anio_graduacion ? ` · UCR ’${String(destacado.anio_graduacion).slice(-2)}` : ''}
                    </p>
                    <p className="mx-auto max-w-lg text-sm leading-relaxed opacity-90 md:mx-0">
                      {destacado.comunes?.length
                        ? `Comparten interés en ${destacado.comunes.slice(0, 3).join(', ')}. Puede aportar a ${proyecto}.`
                        : `Forma parte de la red UCR y puede aportar a ${proyecto}.`}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-3 md:justify-start">
                      <button
                        onClick={() => conectar(destacado.id, destacado.nombre)}
                        disabled={conectando === destacado.id}
                        className="flex items-center gap-2 rounded-lg bg-[#54BCEB] px-6 py-3 text-sm font-bold text-primary transition-transform hover:scale-105 disabled:opacity-60"
                      >
                        {conectando === destacado.id ? 'Enviando…' : 'Solicitar Mentoría'} <span className="material-symbols-outlined text-[18px]">send</span>
                      </button>
                      <button onClick={() => router.push('/directorio')} className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
                        Ver Directorio
                      </button>
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
                    <button
                      onClick={() => conectar(s.id, s.nombre)}
                      disabled={conectando === s.id}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-400 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_add</span> {conectando === s.id ? 'Enviando…' : 'Conectar'}
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
