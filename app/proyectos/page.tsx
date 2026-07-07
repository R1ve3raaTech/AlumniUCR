'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import AlumniLogo from '@/components/AlumniLogo';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
import { obtenerDirectorioEstudiantes, obtenerProyectosPublicos, solicitarContacto } from '@/lib/directorioEstudiantes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './proyectos.module.css';

if (typeof window !== 'undefined') { gsap.registerPlugin(ScrollTrigger); }

// ─── Íconos SVG inline ─────────────────────────────────────────────────────
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const IChevronLeft  = () => <svg {...base}><path d="m15 18-6-6 6-6" /></svg>;
const IChevronRight = () => <svg {...base}><path d="m9 18 6-6-6-6" /></svg>;
const IGrid    = () => <svg {...base}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const ISearch  = () => <svg {...base}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
const IGroups  = () => <svg {...base}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IUser    = () => <svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
const ILock    = () => <svg {...base}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const IClose   = () => <svg {...base}><path d="M18 6 6 18M6 6l12 12" /></svg>;

// ─── Datos ────────────────────────────────────────────────────────────────
const POR_PAGINA = 3;

// Proyecto real de graduación (RF-05 / Journey 1): viene del directorio de
// estudiantes con perfil completo; nada es inventado.
type Proyecto = {
  id: string; // id del estudiante autor
  img: string;
  area: string;
  titulo: string;
  avance: number;
  tipoProyecto: string;
  autor: { iniciales: string; nombre: string };
  busca: string[]; // apoyos que el estudiante declaró buscar
  solicitud: null | 'pendiente' | 'aceptada' | 'rechazada';
};

// Ilustraciones decorativas (Unsplash) rotadas por tarjeta; los datos del
// proyecto son reales, la foto es solo ambiente visual.
const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;
const IMGS_DECORATIVAS = [
  IMG('1576091160550-2173dba999ef'),
  IMG('1500382017468-9049fed747ef'),
  IMG('1509391366360-2e959784a276'),
  IMG('1487958449943-2429e8be8625'),
  IMG('1554224155-6726b3ff858f'),
  IMG('1485827404703-89b55fcc595e'),
];

const TIPO_PROYECTO_LABEL: Record<string, string> = {
  tfg: 'TFG',
  tesis: 'Tesis',
  practica_dirigida: 'Práctica Dirigida',
  seminario: 'Seminario',
};

const BUSCA_LABEL: Record<string, string> = {
  financiamiento: 'Financiamiento',
  mentoria: 'Mentoría',
  empleo: 'Empleo',
  pasantia: 'Pasantía',
};

// Tipos de apoyo del modal "Ofrecer apoyo" (Journey 1 del requerimiento).
const TIPOS_APOYO = [
  { clave: 'mentoria', label: 'Mentoría', desc: 'Tiempo y conocimiento para guiar el proyecto' },
  { clave: 'pasantia', label: 'Pasantía', desc: 'Práctica profesional relacionada con el proyecto' },
  { clave: 'proyecto', label: 'Proyecto empresarial', desc: 'Colaboración en la tesis/TFG con tu empresa' },
  { clave: 'donacion', label: 'Donación económica', desc: 'Aporte monetario directo al proyecto' },
];

// ─── Roles con acceso completo ────────────────────────────────────────────
const ROLES_PERMITIDOS = ['exalumno', 'voluntario', 'admin', 'administrador'];

export default function ProyectosPage() {
  return (
    <React.Suspense fallback={<div className={styles.page}>Cargando...</div>}>
      <ProyectosContent />
    </React.Suspense>
  );
}

function ProyectosContent() {
  const { user, token } = useAuth();
  const router = useRouter();

  // ─── Estado de filtros / orden / página / búsqueda ─────────────────────
  const [areaActiva, setAreaActiva]   = useState(0);
  const [orden, setOrden]             = useState<'avance' | 'titulo'>('avance');
  const [pagina, setPagina]           = useState(1);
  const [query, setQuery]             = useState('');

  // ─── Rol del usuario ─────────────────────────────────────────────────
  const [rolUsuario, setRolUsuario]   = useState<string | null>(null);
  useEffect(() => {
    if (!user || !token) return;
    obtenerPerfil(token)
      .then((res: any) => {
        // El perfil viene en data.roles.nombre (join a la tabla roles).
        const rol = res?.data?.roles?.nombre?.toLowerCase().trim();
        setRolUsuario(rol ?? null);
      })
      .catch(() => setRolUsuario(null));
  }, [user, token]);

  // ─── Proyectos reales (directorio de estudiantes, RF-05) ──────────────
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargandoProyectos, setCargandoProyectos] = useState(true);

  // ─── Modal "Ofrecer apoyo" (Journey 1) ─────────────────────────────────
  const [apoyoProyecto, setApoyoProyecto] = useState<Proyecto | null>(null);
  const [apoyoEnviando, setApoyoEnviando] = useState(false);
  const [apoyoResultado, setApoyoResultado] = useState<'ok' | 'error' | null>(null);

  const tieneAccesoDatos = !!(user && token && rolUsuario && ROLES_PERMITIDOS.includes(rolUsuario));

  useEffect(() => {
    let activo = true;
    setCargandoProyectos(true);
    // Con sesión de exalumno se usa el directorio completo (incluye el estado
    // de la solicitud); sin sesión, el endpoint público (mismas tarjetas, sin
    // datos privados). Cualquier persona puede VER los proyectos.
    const cargar = tieneAccesoDatos && token
      ? obtenerDirectorioEstudiantes(token)
      : obtenerProyectosPublicos();
    cargar
      .then((res: any) => {
        if (!activo) return;
        const lista: Proyecto[] = (res?.data ?? [])
          .filter((e: any) => e.proyecto?.titulo)
          .map((e: any, i: number) => ({
            id: e.id,
            img: IMGS_DECORATIVAS[i % IMGS_DECORATIVAS.length],
            area: e.proyecto?.area_tematica || e.areas?.[0] || 'Proyecto de graduación',
            titulo: e.proyecto.titulo,
            avance: e.proyecto?.avance ?? 0,
            tipoProyecto: TIPO_PROYECTO_LABEL[e.proyecto?.tipo || ''] || 'TFG',
            autor: {
              iniciales: (e.nombre || '?').split(/\s+/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase(),
              nombre: e.nombre || 'Estudiante UCR',
            },
            busca: Object.entries(e.busca || {})
              .filter(([, v]) => v)
              .map(([k]) => BUSCA_LABEL[k])
              .filter(Boolean) as string[],
            solicitud: e.solicitud ?? null,
          }));
        setProyectos(lista);
      })
      .catch(() => { if (activo) setProyectos([]); })
      .finally(() => { if (activo) setCargandoProyectos(false); });
    return () => { activo = false; };
  }, [tieneAccesoDatos, token]);

  // Ofrecer apoyo: donación → módulo de donaciones con el proyecto destino;
  // mentoría/pasantía/proyecto → solicitud de contacto real al estudiante.
  const elegirApoyo = async (tipo: string) => {
    if (!apoyoProyecto || !token) return;
    if (tipo === 'donacion') {
      router.push(`/donaciones?proyecto=${encodeURIComponent(apoyoProyecto.id)}`);
      return;
    }
    setApoyoEnviando(true);
    try {
      const label = TIPOS_APOYO.find((t) => t.clave === tipo)?.label || tipo;
      await solicitarContacto(token, apoyoProyecto.id, `Ofrezco ${label.toLowerCase()} para tu proyecto "${apoyoProyecto.titulo}".`);
      setProyectos((prev) => prev.map((p) => (p.id === apoyoProyecto.id ? { ...p, solicitud: 'pendiente' } : p)));
      setApoyoResultado('ok');
    } catch {
      setApoyoResultado('error');
    } finally {
      setApoyoEnviando(false);
    }
  };

  const cerrarApoyo = () => { setApoyoProyecto(null); setApoyoResultado(null); };

  // ─── Modal GSAP ──────────────────────────────────────────────────────
  const overlayRef  = useRef<HTMLDivElement>(null);
  const boxRef      = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ─── Refs para animaciones ─────────────────────────────────────────────
  const heroRef     = useRef<HTMLElement>(null);
  const filtersRef  = useRef<HTMLElement>(null);
  const gridAnimRef = useRef<HTMLDivElement>(null);

  // ─── GSAP: Hero Entrance — clip-path + blur reveal ────────────────────
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx: gsap.Context = gsap.context(() => {
      const mm: gsap.MatchMedia = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl: gsap.core.Timeline = gsap.timeline({ delay: 0.15 });
        tl.fromTo(`.${styles.badge}`,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.7, ease: 'power3.inOut' }
        )
        .fromTo(`.${styles.heroTitle}`,
          { y: 70, opacity: 0, filter: 'blur(10px)', rotateX: -12 },
          { y: 0, opacity: 1, filter: 'blur(0px)', rotateX: 0, duration: 1.1, ease: 'power4.out' },
          '-=0.3'
        )
        .fromTo(`.${styles.heroText}`,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.6'
        );
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([`.${styles.badge}`, `.${styles.heroTitle}`, `.${styles.heroText}`], { opacity: 1 });
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // ─── GSAP: Filters slide-down (ScrollTrigger) ─────────────────────────
  useEffect(() => {
    if (!filtersRef.current) return;
    const ctx: gsap.Context = gsap.context(() => {
      gsap.fromTo(filtersRef.current,
        { y: -25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out',
          scrollTrigger: { trigger: filtersRef.current, start: 'top 92%' } }
      );
    }, filtersRef);
    return () => ctx.revert();
  }, []);

  // ─── GSAP: Cards 3D stagger + progress bars (Scroll Dynamics) ─────────
  useEffect(() => {
    if (!gridAnimRef.current) return;
    const ctx: gsap.Context = gsap.context(() => {
      const mm: gsap.MatchMedia = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo('.prj-card',
          { y: 60, opacity: 0, rotateY: 10, transformPerspective: 900, scale: 0.94 },
          { y: 0, opacity: 1, rotateY: 0, scale: 1,
            duration: 0.75, stagger: 0.13, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: gridAnimRef.current, start: 'top 85%' } }
        );
        // Progress bars fill on scroll
        gridAnimRef.current!.querySelectorAll<HTMLSpanElement>('.prj-bar').forEach((bar) => {
          gsap.from(bar, { width: '0%', duration: 1.3, ease: 'power2.out',
            scrollTrigger: { trigger: bar, start: 'top 90%' } });
        });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.prj-card', { opacity: 1 });
      });
    }, gridAnimRef);
    return () => ctx.revert();
  }, [pagina, areaActiva, orden, query]);

  const abrirModal = useCallback(() => {
    setModalOpen(true);
    gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', pointerEvents: 'all', duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(boxRef.current,
      { y: 28, scale: 0.96, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)', delay: 0.05 }
    );
  }, []);

  const cerrarModal = useCallback(() => {
    gsap.to(boxRef.current, { y: 16, scale: 0.97, opacity: 0, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.1,
      onComplete: () => { setModalOpen(false); gsap.set(overlayRef.current, { visibility: 'hidden', pointerEvents: 'none' }); }
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && modalOpen) cerrarModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, cerrarModal]);

  // ─── Acceso del usuario (mismo criterio para CTA y buscador) ──────────
  const tieneAcceso = !!(user && rolUsuario && ROLES_PERMITIDOS.includes(rolUsuario));

  // ─── CTA "Ofrecer apoyo": sin acceso → modal de cuenta; con acceso → tipos de apoyo ─
  const abrirApoyo = (p: Proyecto) => {
    if (!tieneAcceso) { abrirModal(); return; }
    setApoyoProyecto(p);
    setApoyoResultado(null);
  };

  // ─── Guard del buscador: sin acceso → mismo modal que "Apoyar proyecto" ─
  const handleBuscarGuard = (e: React.SyntheticEvent) => {
    if (!tieneAcceso) { e.preventDefault(); abrirModal(); return; }
  };

  // ─── Áreas construidas desde los proyectos reales ─────────────────────
  const AREAS = ['Todas las áreas', ...Array.from(new Set(proyectos.map(p => p.area))).sort()];

  // ─── Filtrado + ordenamiento + paginación ────────────────────────────
  const areaSeleccionada = AREAS[areaActiva] ?? 'Todas las áreas';

  const proyectosFiltrados = proyectos
    .filter(p => {
      if (areaSeleccionada !== 'Todas las áreas' && p.area !== areaSeleccionada) return false;
      if (query) {
        const q = query.toLowerCase();
        return p.titulo.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.autor.nombre.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (orden === 'titulo') return a.titulo.localeCompare(b.titulo);
      return b.avance - a.avance; // avance
    });

  const totalPaginas  = Math.max(1, Math.ceil(proyectosFiltrados.length / POR_PAGINA));
  const paginaReal    = Math.min(pagina, totalPaginas);
  const proyectosPag  = proyectosFiltrados.slice((paginaReal - 1) * POR_PAGINA, paginaReal * POR_PAGINA);

  const cambiarArea = (i: number) => { setAreaActiva(i); setPagina(1); };
  const cambiarOrden = (v: string) => { setOrden(v as typeof orden); setPagina(1); };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero diagonal */}
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <span className={styles.badge}>
                <span className={styles.badgeLine} aria-hidden /> Innovación Académica
              </span>
              <h1 className={styles.heroTitle}>Explorador de<br />Proyectos</h1>
              <p className={styles.heroText}>
                Vinculación estratégica entre el talento estudiantil y la experiencia de
                nuestra red Alumni. Descubre, apoya y conecta.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.container}>
          {/* Filtros */}
          <section className={styles.filters} ref={filtersRef}>
            <div className={styles.areaBtns}>
              {AREAS.map((a, i) => (
                <button
                  key={a}
                  type="button"
                  id={`area-btn-${i}`}
                  className={`${styles.areaBtn} ${i === areaActiva ? styles.areaBtnActive : ''}`}
                  onClick={() => cambiarArea(i)}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Buscador inline — mismo estilo que el Navbar */}
            <div className={styles.filterSearch}>
              <input
                id="buscar-proyectos"
                type="search"
                placeholder="Buscar proyectos..."
                className={styles.filterSearchInput}
                value={query}
                readOnly={!tieneAcceso}
                onMouseDown={handleBuscarGuard}
                onFocus={handleBuscarGuard}
                onChange={e => {
                  if (!tieneAcceso) { abrirModal(); return; }
                  setQuery(e.target.value); setPagina(1);
                }}
                aria-label="Buscar proyectos"
              />
              <button
                type="button"
                className={styles.filterSearchBtn}
                aria-label="Buscar"
                onClick={handleBuscarGuard}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>

            <div className={styles.sort}>
              <span className={styles.sortLabel}>Ordenar por:</span>
              <select
                id="sort-proyectos"
                className={styles.sortSelect}
                aria-label="Ordenar proyectos"
                value={orden}
                onChange={e => cambiarOrden(e.target.value)}
              >
                <option value="avance">Avance</option>
                <option value="titulo">A-Z</option>
              </select>
            </div>
          </section>

          {/* Grilla de proyectos */}
          <div className={styles.grid} ref={gridAnimRef}>
            {cargandoProyectos ? (
              <div className={styles.noResults}>Cargando proyectos…</div>
            ) : proyectosPag.length === 0 ? (
              <div className={styles.noResults}>
                {proyectos.length === 0
                  ? 'Aún no hay proyectos de graduación publicados por estudiantes.'
                  : 'No se encontraron proyectos con esos criterios.'}
              </div>
            ) : (
              proyectosPag.map((p) => (
                <article key={p.id} className={`${styles.card} prj-card`}>
                  <div className={styles.cardMedia}>
                    <img className={styles.cardImg} src={p.img} alt="" />
                    <span className={styles.afinidad}>{p.avance}% Avance</span>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardArea}>{p.area} · {p.tipoProyecto}</p>
                    <h3 className={styles.cardTitle}>{p.titulo}</h3>

                    <div className={styles.autor}>
                      <span className={styles.autorIniciales}>{p.autor.iniciales}</span>
                      <span className={styles.autorNombre}>{p.autor.nombre}</span>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Avance del proyecto</span>
                        <span className={styles.metaValor}>{p.avance}%</span>
                      </div>
                      <div className={styles.barra}>
                        <span className={`${styles.barraFill} prj-bar`} style={{ width: `${p.avance}%` }} />
                      </div>
                      {p.busca.length > 0 && (
                        <div className={styles.requerimiento}>
                          <p className={styles.requerimientoLabel}>Busca</p>
                          <p className={styles.requerimientoTexto}>{p.busca.join(' · ')}</p>
                        </div>
                      )}
                      <button
                        id={`cta-${p.id}`}
                        type="button"
                        className={p.solicitud ? styles.ctaOutline : styles.ctaPrimary}
                        onClick={() => abrirApoyo(p)}
                        disabled={p.solicitud === 'pendiente' || p.solicitud === 'aceptada'}
                        style={p.solicitud === 'pendiente' || p.solicitud === 'aceptada' ? { opacity: 0.65, cursor: 'default' } : undefined}
                      >
                        {p.solicitud === 'pendiente' ? 'Solicitud enviada'
                          : p.solicitud === 'aceptada' ? 'Conectado ✓'
                          : 'Ofrecer apoyo'}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                id="pag-anterior"
                className={styles.pageArrow}
                aria-label="Anterior"
                disabled={paginaReal === 1}
                onClick={() => setPagina(p => Math.max(1, p - 1))}
              >
                <IChevronLeft />
              </button>
              <div className={styles.pageNums}>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    id={`pag-${n}`}
                    type="button"
                    className={`${styles.pageNum} ${n === paginaReal ? styles.pageNumActive : ''}`}
                    onClick={() => setPagina(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                id="pag-siguiente"
                className={styles.pageArrow}
                aria-label="Siguiente"
                disabled={paginaReal === totalPaginas}
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              >
                <IChevronRight />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrandCol}>
              <AlumniLogo height={44} />
              <p className={styles.footerDesc}>
                Plataforma institucional de vinculación profesional y académica.
                Fortaleciendo el ecosistema de innovación costarricense.
              </p>
            </div>
            <div className={styles.footerCols}>
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Plataforma</span>
                <Link href="/proyectos">Explorar</Link>
                <Link href="/#impacto">Impacto</Link>
                <Link href="/#historias">Historias</Link>
              </div>
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Legal</span>
                <a href="#">Privacidad</a>
                <a href="#">Términos</a>
              </div>
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Soporte</span>
                <Link href="/ayuda">Contacto</Link>
                <Link href="/ayuda">Ayuda</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>© 2026 Fundación Alumni UCR. Diseño estratégico.</p>
          </div>
        </div>
      </footer>

      {/* Navegación inferior (móvil) */}
      <nav className={styles.bottomNav}>
        <Link href="/" className={styles.bottomItem}><IGrid /><span>Inicio</span></Link>
        <span className={`${styles.bottomItem} ${styles.bottomItemActive}`}><ISearch /><span>Proyectos</span></span>
        <Link href="/#impacto" className={styles.bottomItem}><IGroups /><span>Impacto</span></Link>
        <Link href="/dashboard" className={styles.bottomItem}><IUser /><span>Perfil</span></Link>
      </nav>

      {/* ─── Modal de acceso restringido (GSAP) ──────────────────────── */}
      <div
        ref={overlayRef}
        className={styles.modalOverlay}
        id="modal-acceso"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={e => { if (e.target === overlayRef.current) cerrarModal(); }}
      >
        <div ref={boxRef} className={styles.modalBox}>
          <button
            id="modal-cerrar"
            type="button"
            className={styles.modalClose}
            onClick={cerrarModal}
            aria-label="Cerrar"
          >
            <IClose />
          </button>

          <div className={styles.modalIcon}>
            <ILock />
          </div>

          <p className={styles.modalTag}>Acceso Restringido</p>
          <h2 id="modal-titulo" className={styles.modalTitle}>
            Cuenta requerida
          </h2>
          <p className={styles.modalText}>
            Para acceder a los proyectos y conectar con sus autores necesitas una
            cuenta de <strong>Exalumno</strong> o <strong>Voluntario</strong> de la
            red Alumni UCR. ¡Únete y sé parte del ecosistema!
          </p>

          <div className={styles.modalActions}>
            <button
              id="modal-registrarse"
              type="button"
              className={styles.modalBtnPrimary}
              onClick={() => { cerrarModal(); router.push('/unete'); }}
            >
              Crear cuenta — Es gratis
            </button>
            <button
              id="modal-iniciar-sesion"
              type="button"
              className={styles.modalBtnSecondary}
              onClick={() => { cerrarModal(); router.push('/login'); }}
            >
              Ya tengo cuenta — Iniciar sesión
            </button>
          </div>
        </div>
      </div>

      {/* ─── Modal "Ofrecer apoyo" (Journey 1: tipo de apoyo → contacto o donación) ─── */}
      {apoyoProyecto && (
        <div
          className={styles.modalOverlay}
          style={{ opacity: 1, visibility: 'visible', pointerEvents: 'all' }}
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget && !apoyoEnviando) cerrarApoyo(); }}
        >
          <div className={styles.modalBox} style={{ opacity: 1, transform: 'none' }}>
            <button type="button" className={styles.modalClose} onClick={cerrarApoyo} aria-label="Cerrar">
              <IClose />
            </button>

            {apoyoResultado === 'ok' ? (
              <>
                <p className={styles.modalTag}>Solicitud enviada</p>
                <h2 className={styles.modalTitle}>¡Listo! 🎉</h2>
                <p className={styles.modalText}>
                  Tu ofrecimiento le llegó a <strong>{apoyoProyecto.autor.nombre}</strong>. Cuando
                  acepte tu solicitud vas a poder coordinar directamente.
                </p>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.modalBtnPrimary} onClick={cerrarApoyo}>Entendido</button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.modalTag}>Ofrecer apoyo</p>
                <h2 className={styles.modalTitle}>{apoyoProyecto.titulo}</h2>
                <p className={styles.modalText}>
                  Elegí cómo querés apoyar el proyecto de <strong>{apoyoProyecto.autor.nombre}</strong>:
                </p>
                {apoyoResultado === 'error' && (
                  <p className={styles.modalText} style={{ color: '#dc2626' }}>
                    No se pudo enviar la solicitud. Probá de nuevo.
                  </p>
                )}
                <div className={styles.modalActions}>
                  {TIPOS_APOYO.map((t) => (
                    <button
                      key={t.clave}
                      type="button"
                      className={t.clave === 'donacion' ? styles.modalBtnPrimary : styles.modalBtnSecondary}
                      onClick={() => elegirApoyo(t.clave)}
                      disabled={apoyoEnviando}
                      title={t.desc}
                    >
                      {apoyoEnviando ? 'Enviando…' : t.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
