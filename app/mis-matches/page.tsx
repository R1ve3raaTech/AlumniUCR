'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
import StudentNav from '@/components/StudentNav';
import ReportarPerfil from '@/components/ReportarPerfil';
import {
  obtenerDirectorioEstudiantes,
  obtenerDirectorioExalumnos,
  solicitarContacto,
  calcularScore,
  estadoMatch,
} from '@/lib/misMatches';

interface Estudiante {
  id: string;
  nombre: string;
  carreras: string[];
  facultades: string[];
  proyecto: { titulo: string; avance: number };
  areas: string[];
  busca: { financiamiento: boolean; mentoria: boolean; empleo: boolean; pasantia: boolean };
  solicitud: null | 'pendiente' | 'aceptada' | 'rechazada';
  correo: string | null;
}
interface ExalumnoDir {
  id: string;
  nombre: string;
  carreras: string[];
  facultades: string[];
  sectores: string[];
  areas: string[];
  apoyo: { mentoria: boolean; empleo: boolean; pasantia: boolean; colaboracion: boolean; donacion: boolean };
  correo?: string | null;
}
export default function MisMatchesPage() {
  const router = useRouter();
  const { token, user, loading: authLoading, signOut } = useAuth();
  const [rol, setRol] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null);

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [miPerfilExa, setMiPerfilExa] = useState<ExalumnoDir | null>(null);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token || !user) return;
    let activo = true;
    (async () => {
      try {
        const perfil = await obtenerPerfil(token);
        const r = perfil?.data?.roles?.nombre?.toLowerCase().trim() ?? null;
        if (!activo) return;
        setRol(r);

        if (r === 'exalumno') {
          const [dirEst, dirExa] = await Promise.all([
            obtenerDirectorioEstudiantes(token),
            obtenerDirectorioExalumnos(),
          ]);
          if (!activo) return;
          setEstudiantes(dirEst?.data ?? []);
          const yo = (dirExa?.data ?? []).find((e: ExalumnoDir) => e.id === user.id) ?? null;
          setMiPerfilExa(yo);
        }
      } catch {
        /* simple */
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token, user]);

  const ranking = useMemo(() => {
    if (!miPerfilExa) return [];
    return estudiantes
      .map((est) => ({ est, ...calcularScore(miPerfilExa, est) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [estudiantes, miPerfilExa]);

  async function conectar(idEstudiante: string) {
    setEnviando(idEstudiante);
    try {
      await solicitarContacto(token as string, idEstudiante, 'Me gustaria conectar para apoyar tu proyecto.');
      setEstudiantes((l) => l.map((e) => (e.id === idEstudiante ? { ...e, solicitud: 'pendiente' } : e)));
    } finally {
      setEnviando(null);
    }
  }

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  const iniciales = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-ucr-surface font-brand-body text-ucr-on-surface">
      <StudentNav onSignOut={handleSignOut} />

      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-ucr-primary to-ucr-secondary p-8 text-white shadow-sm">
          <h1 className="font-ucr-display text-3xl font-bold tracking-tight sm:text-4xl">Mis Matches</h1>
          <p className="mt-2 text-sm text-white/80">
            Estudiantes sugeridos segun tu carrera, areas de interes, sector y tipo de apoyo. Ordenados por compatibilidad.
          </p>
        </section>

        <div className="mt-6">
          {cargando ? (
            <p className="py-16 text-center text-sm text-ucr-on-surface-variant">Calculando tus matches...</p>

          /* ── VISTA EXALUMNO ── */
          ) : rol === 'exalumno' ? (
            !miPerfilExa ? (
              <p className="py-16 text-center text-sm text-ucr-on-surface-variant">Completa tu perfil de exalumno para generar tus matches.</p>
            ) : ranking.length === 0 ? (
              <p className="py-16 text-center text-sm text-ucr-on-surface-variant">No hay estudiantes compatibles por ahora.</p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {ranking.map(({ est, score, comunes, interdisciplinario }) => {
                  const estado = estadoMatch(est.solicitud);
                  return (
                    <article key={est.id} className={`flex flex-col rounded-3xl bg-white p-5 shadow-sm ${estado === 'activo' ? 'ring-2 ring-ucr-esmeralda/30' : ''}`}>
                      {/* Cabecera */}
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ucr-secondary-container/40 font-ucr-display text-lg font-bold text-ucr-primary">
                            {iniciales(est.nombre)}
                          </div>
                          <div>
                            <h3 className="font-brand-heading text-base font-bold text-ucr-on-surface">{est.nombre}</h3>
                            <span className="text-xs text-ucr-on-surface-variant">{est.carreras[0] || '?'}{est.facultades[0] ? ` - ${est.facultades[0]}` : ''}</span>
                          </div>
                        </div>
                        {/* Score badge */}
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white ${
                          score >= 70 ? 'bg-ucr-esmeralda' : score >= 40 ? 'bg-ucr-secondary' : 'bg-ucr-outline'
                        }`}>{score}/100</span>
                      </div>

                      {/* Proyecto */}
                      <p className="mb-2 text-sm text-ucr-on-surface">
                        <span className="font-semibold">Proyecto:</span> {est.proyecto?.titulo}
                      </p>

                      {/* Tags */}
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {interdisciplinario && (
                          <span className="rounded-full bg-ucr-celeste/10 px-2.5 py-0.5 text-xs font-semibold text-ucr-secondary">Interdisciplinario</span>
                        )}
                        {comunes.map((a: string) => (
                          <span key={a} className="rounded-full bg-ucr-surface-container px-2.5 py-0.5 text-xs text-ucr-on-surface-variant">#{a}</span>
                        ))}
                      </div>

                      {/* Accion */}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <span className="text-xs font-medium text-ucr-on-surface-variant">
                          {estado === 'activo' ? 'Conexion activa' : estado === 'contactado' ? 'Conexion enviada' : estado === 'rechazada' ? 'No aceptada' : 'Sugerido'}
                        </span>
                        {estado === 'activo' && est.correo ? (
                          <a href={`mailto:${est.correo}`} className="text-sm font-semibold text-ucr-secondary underline">{est.correo}</a>
                        ) : estado === 'sugerido' ? (
                          <button onClick={() => conectar(est.id)} disabled={enviando === est.id}
                            className="rounded-2xl bg-ucr-secondary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                            {enviando === est.id ? 'Enviando...' : 'Solicitar conexion'}
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-3 flex justify-end border-t border-ucr-outline-variant pt-2">
                        <ReportarPerfil idReportado={est.id} nombre={est.nombre} />
                      </div>
                    </article>
                );
              })}
            </div>
          )
        ) : (
          <p className="py-16 text-center text-sm text-ucr-on-surface-variant">El matching esta disponible para estudiantes y exalumnos. El panel del admin tiene su propia vista.</p>
        )}
        </div>
      </main>
    </div>
  );
}
