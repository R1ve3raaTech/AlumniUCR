'use client';

// /mis-matches (RF-06) — Sugerencias de conexión ordenadas por score.
// Role-aware:
//   • Exalumno: estudiantes rankeados por la fórmula del documento (carrera 30 /
//     áreas 30 / sector↔área 20 / apoyo 20). Inicia conexión (reutiliza el flujo
//     de contacto). Estados: sugerido→contactado→activo. Al aceptar (estudiante),
//     se revela el correo.
//   • Estudiante: solicitudes de conexión recibidas, para aceptar o rechazar.
//
// Pendiente de BE (Adri): la notificación por email al iniciar/aceptar la conexión
// y el aviso al admin de "nuevo match activo".

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
import AlumniLogo from '@/components/AlumniLogo';
import ReportarPerfil from '@/components/ReportarPerfil';
import {
  obtenerDirectorioEstudiantes,
  obtenerDirectorioExalumnos,
  solicitarContacto,
  obtenerSolicitudesRecibidas,
  responderSolicitudContacto,
  calcularScore,
  estadoMatch,
} from '@/lib/misMatches';
import styles from './mis-matches.module.css';

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
  sugerido: 'Sugerido', contactado: 'Conexión enviada', activo: 'Conexión activa', rechazada: 'No aceptada',
};

export default function MisMatchesPage() {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const [rol, setRol] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null);

  // Exalumno
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [miPerfilExa, setMiPerfilExa] = useState<ExalumnoDir | null>(null);
  // Estudiante
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
        /* se mantiene simple */
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token, user]);

  // Ranking de estudiantes para el exalumno (excluye score 0, ordena desc).
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
      await solicitarContacto(token as string, idEstudiante, 'Me gustaría conectar para apoyar tu proyecto.');
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

  const iniciales = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Mis Matches</h1>
        <p className={styles.heroText}>
          {rol === 'estudiante'
            ? 'Solicitudes de conexión que recibiste de exalumnos. Aceptá para revelar tu contacto.'
            : 'Estudiantes sugeridos según tu carrera, áreas de interés, sector y tipo de apoyo. Ordenados por compatibilidad.'}
        </p>
      </section>

      <main className={styles.main}>
        {cargando ? (
          <p className={styles.vacio}>Calculando tus matches…</p>
        ) : rol === 'estudiante' ? (
          /* ── Vista ESTUDIANTE: solicitudes recibidas ── */
          recibidas.length === 0 ? (
            <p className={styles.vacio}>Todavía no recibiste solicitudes de conexión.</p>
          ) : (
            <div className={styles.grid}>
              {recibidas.map((s) => (
                <article key={s.id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <span className={styles.ini}>{iniciales(s.nombre_exalumno)}</span>
                    <div><h3 className={styles.nombre}>{s.nombre_exalumno}</h3><span className={styles.sub}>Exalumno</span></div>
                  </div>
                  {s.mensaje && <p className={styles.mensaje}>“{s.mensaje}”</p>}
                  {s.estado === 'pendiente' ? (
                    <div className={styles.acciones}>
                      <button className={styles.btnOk} disabled={enviando === s.id} onClick={() => responder(s.id, true)}>Aceptar</button>
                      <button className={styles.btnNo} disabled={enviando === s.id} onClick={() => responder(s.id, false)}>Rechazar</button>
                    </div>
                  ) : (
                    <span className={`${styles.estado} ${s.estado === 'aceptada' ? styles.activo : styles.rech}`}>
                      {s.estado === 'aceptada' ? 'Conexión activa' : 'Rechazada'}
                    </span>
                  )}
                </article>
              ))}
            </div>
          )
        ) : rol === 'exalumno' ? (
          /* ── Vista EXALUMNO: estudiantes rankeados ── */
          !miPerfilExa ? (
            <p className={styles.vacio}>Completá tu perfil de exalumno para generar tus matches.</p>
          ) : ranking.length === 0 ? (
            <p className={styles.vacio}>No hay estudiantes compatibles por ahora.</p>
          ) : (
            <div className={styles.grid}>
              {ranking.map(({ est, score, comunes, interdisciplinario }) => {
                const estado = estadoMatch(est.solicitud);
                return (
                  <article key={est.id} className={styles.card}>
                    <div className={styles.scoreBadge}>{score}<span>/100</span></div>
                    <div className={styles.cardHead}>
                      <span className={styles.ini}>{iniciales(est.nombre)}</span>
                      <div>
                        <h3 className={styles.nombre}>{est.nombre}</h3>
                        <span className={styles.sub}>{est.carreras[0] || '—'}{est.facultades[0] ? ` · ${est.facultades[0]}` : ''}</span>
                      </div>
                    </div>

                    <p className={styles.proyecto}><strong>Proyecto:</strong> {est.proyecto?.titulo}</p>
                    {interdisciplinario && <span className={styles.inter}>Interdisciplinario</span>}

                    {comunes.length > 0 && (
                      <div className={styles.areas}>
                        <span className={styles.areasLabel}>Áreas en común:</span>
                        {comunes.map((a) => <span key={a} className={styles.areaChip}>{a}</span>)}
                      </div>
                    )}

                    <div className={styles.barra}><span className={styles.barraFill} style={{ width: `${score}%` }} /></div>

                    <div className={styles.footer}>
                      <span className={`${styles.estado} ${styles[estado]}`}>{ESTADO_LABEL[estado]}</span>
                      {estado === 'activo' && est.correo ? (
                        <a href={`mailto:${est.correo}`} className={styles.contacto}>{est.correo}</a>
                      ) : estado === 'sugerido' ? (
                        <button className={styles.btnConectar} disabled={enviando === est.id} onClick={() => conectar(est.id)}>
                          {enviando === est.id ? 'Enviando…' : 'Solicitar conexión'}
                        </button>
                      ) : null}
                    </div>
                    <div className={styles.reportar}><ReportarPerfil idReportado={est.id} nombre={est.nombre} /></div>
                  </article>
                );
              })}
            </div>
          )
        ) : (
          <p className={styles.vacio}>El matching está disponible para estudiantes y exalumnos. El panel del admin tiene su propia vista.</p>
        )}
      </main>
    </div>
  );
}
