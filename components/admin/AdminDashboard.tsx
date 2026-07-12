'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  Link2, GraduationCap, CreditCard, Handshake,
  TriangleAlert, Megaphone, MessageSquare,
  Zap, Clock, Bell, X
} from 'lucide-react';
import AlumniLogo from '../common/AlumniLogo';
import AdminSolicitudes from './AdminSolicitudes';
import AdminConsultas from './AdminConsultas';
import AdminExalumnosPendientes from './AdminExalumnosPendientes';
import AdminDonacionesPendientes from './AdminDonacionesPendientes';
import AdminReportesAnomalias from './AdminReportesAnomalias';
import AdminComunidad from './AdminComunidad';
import KPICard from '../ui/KPICard';
import MatchingModal from './MatchingModal';
import { obtenerMatching } from '@/lib/matching/matching';
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

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const fadeItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

type TabId = 'matching' | 'exalumnos' | 'donaciones' | 'solicitudes' | 'reportes' | 'comunidad' | 'soporte';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'matching',    label: 'Matching',    icon: <Link2 size={15} strokeWidth={2.2} /> },
  { id: 'exalumnos',  label: 'Exalumnos',   icon: <GraduationCap size={15} strokeWidth={2.2} /> },
  { id: 'donaciones', label: 'Donaciones',   icon: <CreditCard size={15} strokeWidth={2.2} /> },
  { id: 'solicitudes',label: 'Solicitudes',  icon: <Handshake size={15} strokeWidth={2.2} /> },
  { id: 'reportes',   label: 'Reportes',     icon: <TriangleAlert size={15} strokeWidth={2.2} /> },
  { id: 'comunidad',  label: 'Comunidad',    icon: <Megaphone size={15} strokeWidth={2.2} /> },
  { id: 'soporte',    label: 'Soporte',      icon: <MessageSquare size={15} strokeWidth={2.2} /> },
];

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
  const [activeTab, setActiveTab] = useState<TabId>('matching');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState<Proyecto | null>(null);

  useEffect(() => {
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
    return () => { activo = false; };
  }, []);

  const r = matching?.resumen;
  const stats = [
    { icon: <IProject />, valor: r?.proyectos ?? '—', label: 'Proyectos' },
    { icon: <IUsers />, valor: r?.mentores ?? '—', label: 'Mentores' },
    { icon: <ILink />, valor: r?.coincidencias ?? '—', label: 'Coincidencias' },
    { icon: <IShuffle />, valor: r?.interdisciplinarias ?? '—', label: 'Interdisciplinarias' },
  ];

  // Alertas de prioridad
  const alertas = [
    { id: 'sla',      color: '#e65100', icon: <Clock size={13} />,          msg: 'Donaciones cerca de vencer SLA 24h — revisa la pestaña Donaciones' },
    { id: 'reportes', color: '#b71c1c', icon: <Bell size={13} />,            msg: 'Nuevos reportes de estudiantes pendientes de revisión' },
  ];

  return (
    <div className={styles.page}>
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className={styles.nav}>
          <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Inicio</Link>
            <Link href="/admin/matches" className={styles.navLink}>Matches</Link>
            <Link href="/admin/usuarios" className={styles.navLink}>Usuarios</Link>
            <Link href="/admin/donaciones" className={styles.navLink}>Donaciones</Link>
            <Link href="/admin/reportes" className={styles.navLink}>Impacto</Link>
          </nav>
          <button type="button" className={styles.logout} onClick={onSignOut}>
            <ILogout /> Cerrar sesión
          </button>
        </div>
      </motion.header>

      <main className={styles.main}>
        <motion.section
          className={styles.welcome}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className={styles.welcomeTexture} aria-hidden />
          <motion.div
            className={styles.welcomeContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <span className={styles.badge}>Administración</span>
            <h1 className={styles.welcomeTitle}>Panel del administrador</h1>
            <p className={styles.welcomeText}>
              Gestiona la comunidad y potencia el <strong>matching interdisciplinario</strong>:
              conecta proyectos estudiantiles con mentores de otras disciplinas.
            </p>
          </motion.div>
        </motion.section>

        <div className={styles.container}>
          {/* Resumen */}
          <motion.section
            className={styles.stats}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeItem}>
                <KPICard icon={s.icon} valor={s.valor} label={s.label} />
              </motion.div>
            ))}
          </motion.section>



          {/* ─── Banner de alertas urgentes ─────────────────────────── */}
          <AnimatePresence>
            {!alertDismissed && (
              <motion.div
                className={styles.alertBanner}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.alertBannerInner}>
                  <span className={styles.alertBannerTitle}>
                    <Zap size={13} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                    Atención requerida
                  </span>
                  <div className={styles.alertList}>
                    {alertas.map((a) => (
                      <div key={a.id} className={styles.alertItem} style={{ '--alert-color': a.color } as React.CSSProperties}>
                        <span className={styles.alertIcon}>{a.icon}</span>
                        <span>{a.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className={styles.alertClose}
                  onClick={() => setAlertDismissed(true)}
                  aria-label="Cerrar alertas"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Sistema de pestañas ────────────────────────────────── */}
          <section className={styles.bloque}>
            <div className={styles.tabBar} role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  <span className={styles.tabLabel}>{tab.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className={styles.tabPanel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                role="tabpanel"
              >
                {activeTab === 'matching' && (
                  <>
                    <p className={styles.tabDesc}>Proyecto · estudiante · mentores recomendados por áreas en común.</p>
                    {cargando ? (
                      <p className={styles.vacio}>Calculando coincidencias…</p>
                    ) : !matching || matching.proyectos.length === 0 ? (
                      <p className={styles.vacio}>
                        Aún no hay proyectos con áreas temáticas para cruzar.
                      </p>
                    ) : (
                      <motion.div
                        className={styles.matchGridCompact}
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                      >
                        {matching.proyectos.map((p) => (
                          <motion.article key={p.id} className={styles.matchCardCompact} variants={fadeItem}>
                            {/* Mini barra de avance */}
                            <div className={styles.miniBarraWrap}>
                              <span
                                className={styles.miniBarraFill}
                                style={{ width: `${p.avance}%` }}
                              />
                            </div>
                            <div className={styles.compactBody}>
                              <h3 className={styles.compactTitulo}>{p.titulo}</h3>
                              <div className={styles.compactMeta}>
                                <span className={styles.compactEstudiante}>
                                  <IStudent />
                                  {p.estudiante.nombre}
                                </span>
                                <span className={styles.compactSeparator}>·</span>
                                <span className={styles.compactAreas}>{p.areas.length} áreas</span>
                                <span className={styles.compactSeparator}>·</span>
                                <span className={styles.compactMentores}>{p.mentores.length} mentores</span>
                              </div>
                              <div className={styles.compactChips}>
                                {p.areas.slice(0, 2).map((a) => (
                                  <span key={a} className={styles.areaChip}>{a}</span>
                                ))}
                                {p.areas.length > 2 && (
                                  <span className={styles.moreChip}>+{p.areas.length - 2}</span>
                                )}
                              </div>
                            </div>
                            <div className={styles.compactFooter}>
                              <span className={styles.avanceBadge}>{p.avance}%</span>
                              <button
                                className={styles.verBtn}
                                onClick={() => setSelectedProyecto(p)}
                              >
                                Ver detalles
                              </button>
                            </div>
                          </motion.article>
                        ))}
                      </motion.div>
                    )}
                  </>
                )}
                {activeTab === 'exalumnos' && (
                  <>
                    <p className={styles.tabDesc}>Aprueba o rechaza el ingreso de nuevos egresados a la plataforma.</p>
                    {token && <AdminExalumnosPendientes token={token} />}
                  </>
                )}
                {activeTab === 'donaciones' && (
                  <>
                    <p className={styles.tabDesc}>Cola por antigüedad · alerta a las 24 h hábiles sin confirmar.</p>
                    {token && <AdminDonacionesPendientes token={token} />}
                  </>
                )}
                {activeTab === 'solicitudes' && (
                  <>
                    <p className={styles.tabDesc}>Voluntarios externos y solicitudes de accesos especiales.</p>
                    {token && <AdminSolicitudes token={token} />}
                  </>
                )}
                {activeTab === 'reportes' && (
                  <>
                    <p className={styles.tabDesc}>Denuncias, quejas y sugerencias enviadas por estudiantes.</p>
                    {token && <AdminReportesAnomalias token={token} />}
                  </>
                )}
                {activeTab === 'comunidad' && (
                  <>
                    <p className={styles.tabDesc}>Aprobá aportes de la comunidad y publicá eventos.</p>
                    {token && <AdminComunidad token={token} />}
                  </>
                )}
                {activeTab === 'soporte' && (
                  <>
                    <p className={styles.tabDesc}>Mensajes enviados desde el Centro de Ayuda.</p>
                    {token && <AdminConsultas token={token} />}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <AlumniLogo height={30} />
        <span className={styles.footerCopy}>Sesión: {correo} · © 2026 Alumni UCR</span>
      </footer>

      {/* Modal GSAP */}
      <MatchingModal
        proyecto={selectedProyecto}
        onClose={() => setSelectedProyecto(null)}
      />
    </div>
  );
}
