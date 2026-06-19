'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import { obtenerMatchesAdmin, actualizarMatchAdmin } from '@/lib/adminMatches';
import styles from './matches.module.css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CarreraInfo { carreras: { nombre: string } | null }
interface Persona {
  id: string;
  nombre: string | null;
  correo_electronico?: string | null;
  carreras?: CarreraInfo[];
  info?: Record<string, unknown>[];
}

interface Match {
  id: string;
  score_match: number | null;
  estado: string;
  iniciado_por: string | null;
  resultado: string | null;
  notas_admin: string | null;
  created_at: string;
  updated_at: string;
  exalumno: Persona | null;
  estudiante: Persona | null;
  alerta_seguimiento: boolean;
}

type FiltroEstado = 'todos' | 'sugerido' | 'contactado' | 'activo' | 'cerrado';

// Iconos SVG en lugar de emojis
const FILTROS_ESTADO: { clave: FiltroEstado; label: string }[] = [
  { clave: 'todos',      label: 'Todos' },
  { clave: 'sugerido',   label: 'Sugeridos' },
  { clave: 'contactado', label: 'Contactados' },
  { clave: 'activo',     label: 'Activos' },
  { clave: 'cerrado',    label: 'Cerrados' },
];
const ESTADOS_EDITABLES = ['sugerido', 'contactado', 'activo', 'cerrado'];
const TIPOS_APOYO = ['Mentoría', 'Empleo', 'Pasantía', 'Financiamiento'];

const fmtFecha = (f?: string) => (f ? new Date(f).toLocaleDateString('es-CR') : '—');
const nom = (p: Persona | null) => p?.nombre || '—';
const iniciales = (nombre: string | null) => {
  if (!nombre) return '?';
  const parts = nombre.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : nombre[0].toUpperCase();
};

export default function AdminMatchesPage() {
  const router  = useRouter();
  const { token, loading: authLoading } = useAuth();

  const [lista,    setLista]    = useState<Match[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');

  // Filtros
  const [busqueda,      setBusqueda]      = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState<FiltroEstado>('todos');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroApoyo,   setFiltroApoyo]  = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Edición modal
  const [editando,    setEditando]    = useState<Match | null>(null);
  const [notaDraft,   setNotaDraft]   = useState('');
  const [estadoDraft, setEstadoDraft] = useState('');
  const [guardando,   setGuardando]   = useState(false);

  // Refs GSAP
  const heroTitleRef  = useRef<HTMLHeadingElement>(null);
  const heroTextRef   = useRef<HTMLParagraphElement>(null);
  const headerRef     = useRef<HTMLElement>(null);
  const filterRef     = useRef<HTMLDivElement>(null);
  const heroBgRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let vivo = true;
    (async () => {
      try {
        const ms = await obtenerMatchesAdmin(token);
        if (vivo) setLista(ms);
      } catch (e) {
        if (vivo) setError(e instanceof Error ? e.message : 'No se pudieron cargar los matches.');
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => { vivo = false; };
  }, [token]);

  const carrerasUnicas = useMemo(() => {
    const set = new Set<string>();
    lista.forEach(m => {
      m.estudiante?.carreras?.forEach(c => { if (c.carreras?.nombre) set.add(c.carreras.nombre); });
      m.exalumno?.carreras?.forEach(c =>   { if (c.carreras?.nombre) set.add(c.carreras.nombre); });
    });
    return Array.from(set).sort();
  }, [lista]);

  const visibles = useMemo(() => {
    const q  = busqueda.trim().toLowerCase();
    const d0 = desde ? new Date(desde).getTime() : -Infinity;
    const d1 = hasta ? new Date(hasta).getTime() + 86_399_999 : Infinity;

    return lista.filter(m => {
      if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false;
      const t = new Date(m.created_at).getTime();
      if (t < d0 || t > d1) return false;
      if (q && ![nom(m.estudiante), nom(m.exalumno)].join(' ').toLowerCase().includes(q)) return false;
      if (filtroCarrera) {
        const ec = m.estudiante?.carreras?.map(c => c.carreras?.nombre) ?? [];
        const xc = m.exalumno?.carreras?.map(c =>  c.carreras?.nombre) ?? [];
        if (!ec.includes(filtroCarrera) && !xc.includes(filtroCarrera)) return false;
      }
      if (filtroApoyo) {
        const ie = (m.estudiante?.info?.[0] ?? {}) as Record<string, unknown>;
        const ix = (m.exalumno?.info?.[0]  ?? {}) as Record<string, unknown>;
        let ok = false;
        if (filtroApoyo === 'Mentoría'       && (ie.busca_mentoria      || ix.ofrece_mentoria)) ok = true;
        if (filtroApoyo === 'Empleo'         && (ie.busca_empleo        || ix.ofrece_empleo))   ok = true;
        if (filtroApoyo === 'Pasantía'       && (ie.busca_pasantia      || ix.ofrece_pasantia)) ok = true;
        if (filtroApoyo === 'Financiamiento' && (ie.busca_financiamiento || ix.ofrece_donacion)) ok = true;
        if (!ok) return false;
      }
      return true;
    });
  }, [lista, filtroEstado, desde, hasta, busqueda, filtroCarrera, filtroApoyo]);

  const alertas = useMemo(() => lista.filter(m => m.alerta_seguimiento).length, [lista]);
  const activos  = useMemo(() => lista.filter(m => m.estado === 'activo').length, [lista]);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (headerRef.current) {
      tl.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5 });
    }
    if (heroTitleRef.current) {
      tl.fromTo(heroTitleRef.current,
        { opacity: 0, y: 30, skewY: 1.5 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.6 }, '-=0.25');
    }
    if (heroTextRef.current) {
      tl.fromTo(heroTextRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5 }, '-=0.35');
    }
    if (filterRef.current) {
      tl.fromTo(filterRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
    }

    // Animación fluida continua de los blobs de color con GSAP
    if (heroBgRef.current) {
      const blobs = heroBgRef.current.querySelectorAll('.blob-anim');
      gsap.to(blobs, {
        x: 'random(-50, 50)',
        y: 'random(-30, 30)',
        rotation: 'random(-15, 15)',
        scale: 'random(0.85, 1.15)',
        duration: 'random(5, 8)',
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.5
      });
    }
  }, []);

  useGSAP(() => {
    if (!cargando && visibles.length > 0) {
      gsap.fromTo('.match-card',
        { opacity: 0, y: 25, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
    }
  }, [cargando, visibles]);

  useGSAP(() => {
    if (editando) {
      gsap.fromTo('.modal-sm',
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.2)' });
    }
  }, [editando]);

  function abrirEdicion(m: Match) {
    setEditando(m);
    setNotaDraft(m.notas_admin || '');
    setEstadoDraft(m.estado);
  }

  async function guardarEdicion() {
    if (!editando) return;
    setGuardando(true);
    setError('');
    try {
      const datos: { notas_admin: string; estado?: string } = { notas_admin: notaDraft.trim() };
      if (estadoDraft && estadoDraft !== editando.estado) datos.estado = estadoDraft;
      await actualizarMatchAdmin(token as string, editando.id, datos);
      setLista(l => l.map(x =>
        x.id === editando.id
          ? { ...x, notas_admin: datos.notas_admin, estado: datos.estado ?? x.estado }
          : x));
      setEditando(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  function exportarCSV() {
    const cols = ['Estudiante','Exalumno','Score','Estado','Creado','Última act.','Alerta 6m','Notas'];
    const esc  = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = visibles.map(m => [
      nom(m.estudiante), nom(m.exalumno), m.score_match ?? '', m.estado,
      fmtFecha(m.created_at), fmtFecha(m.updated_at),
      m.alerta_seguimiento ? 'Sí' : 'No', m.notas_admin || '',
    ].map(esc).join(','));
    const csv  = [cols.map(esc).join(','), ...filas].join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `matches-alumni-ucr-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className={styles.header} ref={headerRef}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio">
          <AlumniLogo height={36} />
        </Link>
        <nav className={styles.headerNav}>
          <Link href="/" className={styles.navItem}>Inicio</Link>
          <Link href="/admin/matches" className={styles.navItem}>Matches</Link>
          <Link href="/admin/usuarios" className={styles.navItem}>Usuarios</Link>
          <Link href="/admin/donaciones" className={styles.navItem}>Donaciones</Link>
          <Link href="/admin/reportes" className={styles.navItem}>Impacto</Link>
          <Link href="/dashboard" className={styles.navItemCta}>Panel Principal ✨</Link>
        </nav>
      </header>

      {/* ── HERO CON VIDEO UCR ───────────────────────────── */}
      <section className={styles.heroClean} ref={heroBgRef}>
        <video
          className={styles.heroBgVideo}
          src="/images/video-ucr.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={styles.heroOverlay} />

        {/* Elementos de color flotantes (animados por GSAP) */}
        <div className={styles.heroBlobs}>
          <div className={`${styles.blob} ${styles.blobOrange} blob-anim`}></div>
          <div className={`${styles.blob} ${styles.blobBlue} blob-anim`}></div>
          <div className={`${styles.blob} ${styles.blobCyan} blob-anim`}></div>
        </div>

        <div className={styles.heroInnerCenter}>
          <h1 className={styles.titleMassive} ref={heroTitleRef}>
            Gestión de <span className={styles.textGradientMassive}>Matches</span>
          </h1>

          <p className={styles.textElevated} ref={heroTextRef}>
            Supervisá y conectá el talento de la universidad. Utilizá esta interfaz para filtrar rápidamente y potenciar relaciones estratégicas.
          </p>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Filtros */}
        <div className={styles.filterSection} ref={filterRef}>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre de estudiante o mentor…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          <div className={styles.filterControls}>
            <div className={styles.filterGroup}>
              <label>Carrera</label>
              <select value={filtroCarrera} onChange={e => setFiltroCarrera(e.target.value)}>
                <option value="">Todas las carreras</option>
                {carrerasUnicas.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Tipo de Apoyo</label>
              <select value={filtroApoyo} onChange={e => setFiltroApoyo(e.target.value)}>
                <option value="">Cualquier tipo</option>
                {TIPOS_APOYO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Rango de Fechas</label>
              <div className={styles.dateGroup}>
                <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
                <span>→</span>
                <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
              </div>
            </div>

            <button type="button" className={styles.btnCsv} onClick={exportarCSV} disabled={visibles.length === 0}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </button>
          </div>

          <div className={styles.tabs}>
            {FILTROS_ESTADO.map(f => (
              <button
                key={f.clave}
                className={`${styles.tab} ${filtroEstado === f.clave ? styles.tabOn : ''} ${styles['tab' + f.clave]}`}
                onClick={() => setFiltroEstado(f.clave)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className={styles.error}>⚠️ {error}</div>}

        {cargando ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Sincronizando constelación de matches…</p>
          </div>
        ) : visibles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
            </div>
            <p>Ningún match sobrevive a estos filtros.</p>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {visibles.map(m => (
              <div
                key={m.id}
                className={`match-card ${styles.card} ${m.alerta_seguimiento ? styles.cardAlerta : ''} ${styles['cardState_' + m.estado]}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.matchScores}>
                    <span className={styles.scoreBadge}>⭐ {m.score_match !== null ? m.score_match : '—'}</span>
                    <span className={`${styles.chip} ${styles['chip_' + m.estado]}`}>
                      {m.estado}
                    </span>
                  </div>
                  {m.alerta_seguimiento && (
                    <span className={styles.alertaBadge}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Revisión
                    </span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.participant}>
                    <div className={`${styles.participantAvatar} ${styles.avatarStudent}`}>
                      {iniciales(m.estudiante?.nombre ?? null)}
                    </div>
                    <div className={styles.participantInfo}>
                      <strong title={nom(m.estudiante)}>{nom(m.estudiante)}</strong>
                      <span className={styles.labelStudent}>Estudiante</span>
                    </div>
                  </div>

                  <div className={styles.connectionLine}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="8 17 12 21 16 17" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <polyline points="16 7 12 3 8 7" />
                      <line x1="12" y1="12" x2="12" y2="3" />
                    </svg>
                  </div>

                  <div className={styles.participant}>
                    <div className={`${styles.participantAvatar} ${styles.avatarMentor}`}>
                      {iniciales(m.exalumno?.nombre ?? null)}
                    </div>
                    <div className={styles.participantInfo}>
                      <strong title={nom(m.exalumno)}>{nom(m.exalumno)}</strong>
                      <span className={styles.labelMentor}>Mentor</span>
                    </div>
                  </div>
                </div>

                {m.notas_admin && (
                  <div className={styles.cardNote}>
                    <div className={styles.noteIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    </div>
                    <p>{m.notas_admin}</p>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.dateInfo}>
                    <small>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {fmtFecha(m.created_at)}
                    </small>
                    <small>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      {fmtFecha(m.updated_at)}
                    </small>
                  </div>
                  <button className={styles.btnEdit} onClick={() => abrirEdicion(m)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Gestionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── MODAL EDICIÓN ───────────────────────────────────────────── */}
      {editando && (
        <div className={styles.modalBg} onClick={() => setEditando(null)}>
          <div className={`modal-sm ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span>Gestionar Match</span>
              </div>
              <button className={styles.cerrar} onClick={() => setEditando(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSummary}>
                Conexión entre <strong className={styles.cBlue}>{nom(editando.estudiante)}</strong> y <strong className={styles.cOrange}>{nom(editando.exalumno)}</strong>
              </div>

              <label className={styles.campo}>
                <span>Estado actual</span>
                <div className={styles.selectWrapper}>
                  <select value={estadoDraft} onChange={e => setEstadoDraft(e.target.value)}>
                    {ESTADOS_EDITABLES.map(es => (
                      <option key={es} value={es}>{es.charAt(0).toUpperCase() + es.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </label>

              <label className={styles.campo}>
                <span>Notas privadas de admin</span>
                <textarea
                  rows={4}
                  placeholder="Escribe aquí las conclusiones o seguimiento de la reunión…"
                  value={notaDraft}
                  onChange={e => setNotaDraft(e.target.value)}
                />
              </label>
            </div>

            <div className={styles.modalAcciones}>
              <button className={styles.btnGhost} onClick={() => setEditando(null)}>Descartar</button>
              <button className={styles.btnOk} disabled={guardando} onClick={guardarEdicion}>
                {guardando ? 'Guardando...' : 'Aplicar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
