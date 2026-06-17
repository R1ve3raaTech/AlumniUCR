'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
import AlumniLogo from '@/components/AlumniLogo';
import {
  obtenerDirectorioEstudiantes,
  obtenerDirectorioExalumnos,
  solicitarContacto,
  obtenerSolicitudesRecibidas,
  responderSolicitudContacto,
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
}
interface SolicitudRecibida {
  id: string;
  nombre_exalumno: string;
  mensaje: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
}

const ESTADO_LABEL: Record<string, string> = {
  sugerido: 'Sugerido', contactado: 'Conexion enviada', activo: 'Conexion activa', rechazada: 'No aceptada',
};

export default function MisMatchesPage() {
  const router = useRouter();
  const { token, user, loading: authLoading, signOut } = useAuth();
  const [rol, setRol] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null);

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [miPerfilExa, setMiPerfilExa] = useState<ExalumnoDir | null>(null);
  const [recibidas, setRecibidas] = useState<SolicitudRecibida[]>([]);

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
        } else if (r === 'estudiante') {
          const sol = await obtenerSolicitudesRecibidas(token);
          if (activo) setRecibidas(sol?.data ?? []);
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

  async function responder(id: string, aceptar: boolean) {
    setEnviando(id);
    try {
      await responderSolicitudContacto(token as string, id, aceptar);
      setRecibidas((l) => l.map((s) => (s.id === id ? { ...s, estado: aceptar ? 'aceptada' : 'rechazada' } : s)));
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
    <div className="min-h-screen bg-ucr-surface font-brand-body text-ucr-on-surface lg:flex">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ucr-outline-variant bg-white px-6 py-8 lg:flex lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <Link href="/" aria-label="Alumni UCR inicio" className="mb-10 block">
          <AlumniLogo height={32} />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ucr-outline">Paneles</p>
          <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container">
            <span className="material-symbols-outlined">dashboard</span>Dashboard
          </Link>
          <Link href={rol === 'estudiante' ? '/perfil-estudiante' : '/perfil-exalumno'} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container">
            <span className="material-symbols-outlined">person</span>Mi perfil
          </Link>
          <span className="flex items-center gap-3 rounded-xl bg-ucr-secondary-container/30 px-3 py-2 text-sm font-semibold text-ucr-primary">
            <span className="material-symbols-outlined">handshake</span>Mis matches
          </span>
          {rol === 'estudiante' && (
            <Link href="/estudiantes?rol=estudiante" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container">
              <span className="material-symbols-outlined">groups</span>Directorio
            </Link>
          )}
        </nav>
        <button type="button" onClick={handleSignOut} className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container">
          <span className="material-symbols-outlined">logout</span>Cerrar sesion
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-ucr-primary to-ucr-secondary p-8 text-white shadow-sm">
          <h1 className="font-ucr-display text-3xl font-bold tracking-tight sm:text-4xl">Mis Matches</h1>
          <p className="mt-2 text-sm text-white/80">
            {rol === 'estudiante'
              ? 'Solicitudes de conexion que recibiste de exalumnos. Acepta para revelar tu contacto.'
              : 'Estudiantes sugeridos segun tu carrera, areas de interes, sector y tipo de apoyo. Ordenados por compatibilidad.'}
          </p>
        </section>

        <div className="mt-6">
          {cargando ? (
            <p className="py-16 text-center text-sm text-ucr-on-surface-variant">Calculando tus matches...</p>
          ) : rol === 'estudiante' ? (
            recibidas.length === 0 ? (
              <p className="py-16 text-center text-sm text-ucr-on-surface-variant">Todavia no recibiste solicitudes de conexion.</p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recibidas.map((s) => (
                  <article key={s.id} className="flex flex-col rounded-3xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ucr-secondary-container/40 font-ucr-display text-lg font-bold text-ucr-primary">
                        {iniciales(s.nombre_exalumno)}
                      </div>
                      <div>
                        <h3 className="font-brand-heading text-base font-bold text-ucr-on-surface">{s.nombre_exalumno}</h3>
                        <span className="text-xs text-ucr-on-surface-variant">Exalumno</span>
                      </div>
                    </div>
                    {s.mensaje && <p className="mb-3 text-sm italic text-ucr-on-surface-variant">"{s.mensaje}"</p>}
                    <div className="mt-auto">
                      {s.estado === 'pendiente' ? (
                        <div className="flex gap-2">
                          <button onClick={() => responder(s.id, true)} disabled={enviando === s.id}
                            className="flex-1 rounded-2xl bg-ucr-secondary py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                            Aceptar
                          </button>
                          <button onClick={() => responder(s.id, false)} disabled={enviando === s.id}
                            className="flex-1 rounded-2xl border border-ucr-outline-variant py-2 text-sm font-semibold text-ucr-on-surface-variant transition hover:bg-ucr-surface-container disabled:opacity-60">
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${s.estado === 'aceptada' ? 'bg-ucr-esmeralda/10 text-ucr-esmeralda' : 'bg-ucr-surface-container text-ucr-outline'}`}>
                          {s.estado === 'aceptada' ? 'Conexion activa' : 'Rechazada'}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )
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
                    <article key={est.id} className="flex flex-col rounded-3xl bg-white p-5 shadow-sm">
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
                        <span className="shrink-0 rounded-full bg-ucr-secondary px-2.5 py-1 text-xs font-bold text-white">{score}/100</span>
                      </div>

                      <p className="mb-2 text-sm text-ucr-on-surface"><span className="font-semibold">Proyecto:</span> {est.proyecto?.titulo}</p>

                      {interdisciplinario && (
                        <span className="mb-2 inline-block rounded-full bg-ucr-celeste/10 px-2.5 py-0.5 text-xs font-semibold text-ucr-secondary">Interdisciplinario</span>
                      )}

                      {comunes.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {comunes.map((a: string) => (
                            <span key={a} className="rounded-full bg-ucr-surface-container px-2.5 py-0.5 text-xs text-ucr-on-surface-variant">#{a}</span>
                          ))}
                        </div>
                      )}

                      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-ucr-surface-container">
                        <span className="block h-full rounded-full bg-gradient-to-r from-ucr-secondary to-ucr-esmeralda" style={{ width: `${score}%` }} />
                      </div>

                      <div className="mt-auto">
                        {estado === 'activo' && est.correo ? (
                          <a href={`mailto:${est.correo}`} className="text-sm font-semibold text-ucr-secondary underline">{est.correo}</a>
                        ) : estado === 'sugerido' ? (
                          <button onClick={() => conectar(est.id)} disabled={enviando === est.id}
                            className="w-full rounded-2xl border border-ucr-outline-variant py-2 text-sm font-semibold text-ucr-on-surface transition hover:border-ucr-secondary hover:text-ucr-secondary disabled:opacity-60">
                            {enviando === est.id ? 'Enviando...' : 'Solicitar conexion'}
                          </button>
                        ) : (
                          <span className="text-xs text-ucr-outline">{ESTADO_LABEL[estado]}</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )
          ) : (
            <p className="py-16 text-center text-sm text-ucr-on-surface-variant">El matching esta disponible para estudiantes y exalumnos.</p>
          )}
        </div>
      </main>
    </div>
  );
}
