'use client';

// Dashboard del administrador con la identidad del landing (paleta --ucr-/
// --brand-, Barlow Condensed, textura tech-grid). Muestra el resumen, el
// Matching Interdisciplinario (proyectos ↔ estudiantes ↔ mentores) y la
// gestión de solicitudes de colaboración.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AlumniLogo from './AlumniLogo';
import AdminSolicitudes from './AdminSolicitudes';
import { obtenerMatching } from '@/lib/matching';
import styles from './AdminDashboard.module.css';

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const IProject = () => (<svg {...base}><path d="M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2" /><path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>);
const IUsers = () => (<svg {...base}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
const ILink = () => (<svg {...base}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>);
const IShuffle = () => (<svg {...base}><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" /></svg>);
const ILogout = () => (<svg {...base}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>);
const IStudent = () => (<svg {...base}><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" /></svg>);

interface Mentor {
  id: string;
  nombre: string;
  empresa?: string;
  cargo?: string;
  facultad?: string | null;
  carrera?: string | null;
  areasComunes: string[];
  interdisciplinario: boolean;
  score: number;
}
interface Proyecto {
  id: number;
  titulo: string;
  descripcion?: string;
  avance: number;
  estudiante: { nombre: string; carrera?: string | null; facultad?: string | null };
  areas: string[];
  mentores: Mentor[];
}
interface MatchingData {
  resumen: { proyectos: number; mentores: number; coincidencias: number; interdisciplinarias: number };
  proyectos: Proyecto[];
}

export default function AdminDashboard({
  correo,
  onSignOut,
}: {
  correo: string;
  onSignOut: () => void;
}) {
  const [token, setToken] = useState<string>('');
  const [matching, setMatching] = useState<MatchingData | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // El token se lee aquí para no acoplar el componente al contexto.
    let activo = true;
    (async () => {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('ct_auth') : null;
        const tk = raw ? JSON.parse(raw).token : '';
        if (!activo) return;
        setToken(tk);
        const res = await obtenerMatching(tk);
        if (activo) setMatching(res?.data ?? null);
      } catch {
        if (activo) setMatching(null);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const r = matching?.resumen;
  const stats = [
    { icon: <IProject />, valor: r?.proyectos ?? '—', label: 'Proyectos' },
    { icon: <IUsers />, valor: r?.mentores ?? '—', label: 'Mentores' },
    { icon: <ILink />, valor: r?.coincidencias ?? '—', label: 'Coincidencias' },
    { icon: <IShuffle />, valor: r?.interdisciplinarias ?? '—', label: 'Interdisciplinarias' },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.nav}>
          <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
          <nav className={styles.navLinks}>
            <Link href="/proyectos" className={styles.navLink}>Proyectos</Link>
            <Link href="/mentorias" className={styles.navLink}>Mentorías</Link>
            <Link href="/ayuda" className={styles.navLink}>Ayuda</Link>
          </nav>
          <button type="button" className={styles.logout} onClick={onSignOut}>
            <ILogout /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.welcome}>
          <span className={styles.welcomeTexture} aria-hidden />
          <div className={styles.welcomeContent}>
            <span className={styles.badge}>Administración</span>
            <h1 className={styles.welcomeTitle}>Panel del administrador</h1>
            <p className={styles.welcomeText}>
              Gestiona la comunidad y potencia el <strong>matching interdisciplinario</strong>:
              conecta proyectos estudiantiles con mentores de otras disciplinas.
            </p>
          </div>
        </section>

        <div className={styles.container}>
          {/* Resumen */}
          <section className={styles.stats}>
            {stats.map((s) => (
              <article key={s.label} className={styles.statCard}>
                <span className={styles.statIcon}>{s.icon}</span>
                <div>
                  <span className={styles.statValor}>{s.valor}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              </article>
            ))}
          </section>

          {/* Matching interdisciplinario */}
          <section className={styles.bloque}>
            <div className={styles.bloqueHead}>
              <h2 className={styles.bloqueTitulo}>Matching Interdisciplinario</h2>
              <span className={styles.bloqueHint}>
                Proyecto · estudiante · mentores recomendados por áreas en común
              </span>
            </div>

            {cargando ? (
              <p className={styles.vacio}>Calculando coincidencias…</p>
            ) : !matching || matching.proyectos.length === 0 ? (
              <p className={styles.vacio}>
                Aún no hay proyectos con áreas temáticas para cruzar. Cuando existan proyectos,
                estudiantes y mentores con áreas asignadas, aquí aparecerán las coincidencias.
              </p>
            ) : (
              <div className={styles.matchGrid}>
                {matching.proyectos.map((p) => (
                  <article key={p.id} className={styles.matchCard}>
                    <div className={styles.matchTop}>
                      <h3 className={styles.matchTitulo}>{p.titulo}</h3>
                      <div className={styles.estudiante}>
                        <span className={styles.estudianteIcon}><IStudent /></span>
                        <span>
                          <strong>{p.estudiante.nombre}</strong>
                          {p.estudiante.facultad ? <em> · {p.estudiante.facultad}</em> : null}
                        </span>
                      </div>
                      <div className={styles.areas}>
                        {p.areas.map((a) => (
                          <span key={a} className={styles.areaChip}>{a}</span>
                        ))}
                      </div>
                      <div className={styles.barra}>
                        <span className={styles.barraFill} style={{ width: `${p.avance}%` }} />
                      </div>
                      <span className={styles.avanceTxt}>{p.avance}% de avance</span>
                    </div>

                    <div className={styles.mentores}>
                      <span className={styles.mentoresLabel}>
                        Mentores recomendados ({p.mentores.length})
                      </span>
                      {p.mentores.length === 0 ? (
                        <p className={styles.sinMentores}>Sin coincidencias por ahora.</p>
                      ) : (
                        p.mentores.map((m) => (
                          <div key={m.id} className={styles.mentor}>
                            <div className={styles.mentorHead}>
                              <strong>{m.nombre}</strong>
                              {m.interdisciplinario && (
                                <span className={styles.interBadge}>Interdisciplinario</span>
                              )}
                            </div>
                            {(m.cargo || m.facultad) && (
                              <span className={styles.mentorSub}>
                                {m.cargo}{m.empresa ? ` @ ${m.empresa}` : ''}
                                {m.facultad ? ` · ${m.facultad}` : ''}
                              </span>
                            )}
                            <div className={styles.areasComunes}>
                              {m.areasComunes.map((a) => (
                                <span key={a} className={styles.comunChip}>{a}</span>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Solicitudes de colaboración */}
          <section className={styles.bloque}>
            <div className={styles.bloqueHead}>
              <h2 className={styles.bloqueTitulo}>Solicitudes de colaboración</h2>
              <span className={styles.bloqueHint}>Voluntarios externos y accesos</span>
            </div>
            {token && <AdminSolicitudes token={token} />}
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <AlumniLogo height={30} />
        <span className={styles.footerCopy}>Sesión: {correo} · © 2025 Alumni UCR</span>
      </footer>
    </div>
  );
}
