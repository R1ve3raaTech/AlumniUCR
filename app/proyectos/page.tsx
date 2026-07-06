'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import AlumniLogo from '@/components/AlumniLogo';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
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
const AREAS = ['Todas las áreas', 'Ingeniería', 'Artes y Letras', 'Ciencias Sociales', 'Salud'];
const POR_PAGINA = 3;

type Proyecto = {
  img: string;
  area: string;
  titulo: string;
  afinidad: number;
  fechaMs: number;
  impacto: number;
  autor: { iniciales?: string; img?: string; nombre: string };
  cta: string;
  ctaVariant: 'primary' | 'outline';
} & (
  | { tipo: 'meta'; metaLabel: string; meta: string; progreso: number }
  | { tipo: 'requerimiento'; requerimiento: string }
);

// Fotografía de alto contenido gráfico (Unsplash), consistente con el set real
// de proyectos que ya se muestra en el landing (components/landing/ProyectosGraduacion).
const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;
const DIA = 24 * 60 * 60 * 1000;

const PROYECTOS: Proyecto[] = [
  {
    img: IMG('1576091160550-2173dba999ef'),
    area: 'Salud',
    titulo: 'Med-Link CR — Telemedicina rural',
    afinidad: 98,
    fechaMs: Date.now() - 1 * DIA,
    impacto: 90,
    autor: { iniciales: 'CT', nombre: 'Carlos Torres' },
    tipo: 'meta',
    metaLabel: 'Meta de financiamiento',
    meta: '$3,200',
    progreso: 65,
    cta: 'Apoyar proyecto',
    ctaVariant: 'primary',
  },
  {
    img: IMG('1573497019940-1c28c88b4f3e'),
    area: 'Salud',
    titulo: 'Bienestar UCR — Salud mental estudiantil',
    afinidad: 91,
    fechaMs: Date.now() - 7 * DIA,
    impacto: 99,
    autor: { iniciales: 'DC', nombre: 'Daniela Campos' },
    tipo: 'meta',
    metaLabel: 'Meta de impacto',
    meta: '$3,800',
    progreso: 80,
    cta: 'Apoyar proyecto',
    ctaVariant: 'primary',
  },
  {
    img: IMG('1500382017468-9049fed747ef'),
    area: 'Ingeniería',
    titulo: 'AgroSensor Café — IoT para cafetaleros',
    afinidad: 88,
    fechaMs: Date.now() - 3 * DIA,
    impacto: 84,
    autor: { iniciales: 'MV', nombre: 'Mariana Vargas' },
    tipo: 'requerimiento',
    requerimiento: 'Busca: Mentoría en Ing. Eléctrica',
    cta: 'Conectar con Mariana',
    ctaVariant: 'outline',
  },
  {
    img: IMG('1509391366360-2e959784a276'),
    area: 'Ingeniería',
    titulo: 'SolarComunidad — Microredes solares',
    afinidad: 85,
    fechaMs: Date.now() - 5 * DIA,
    impacto: 88,
    autor: { iniciales: 'DM', nombre: 'Diego Mora' },
    tipo: 'meta',
    metaLabel: 'Financiamiento requerido',
    meta: '$5,000',
    progreso: 45,
    cta: 'Apoyar proyecto',
    ctaVariant: 'primary',
  },
  {
    img: IMG('1487958449943-2429e8be8625'),
    area: 'Artes y Letras',
    titulo: 'Casa Trópico — Vivienda bioclimática',
    afinidad: 92,
    fechaMs: Date.now() - 2 * DIA,
    impacto: 80,
    autor: { iniciales: 'SB', nombre: 'Sofía Blanco' },
    tipo: 'requerimiento',
    requerimiento: 'Busca: Mentoría técnica en arquitectura',
    cta: 'Conectar con Sofía',
    ctaVariant: 'outline',
  },
  {
    img: IMG('1504384308090-c894fdcc538d'),
    area: 'Artes y Letras',
    titulo: 'Voces UCR — Podcast de divulgación',
    afinidad: 77,
    fechaMs: Date.now() - 10 * DIA,
    impacto: 72,
    autor: { iniciales: 'VN', nombre: 'Valeria Núñez' },
    tipo: 'meta',
    metaLabel: 'Meta de producción',
    meta: '$1,800',
    progreso: 55,
    cta: 'Apoyar proyecto',
    ctaVariant: 'primary',
  },
  {
    img: IMG('1554224155-6726b3ff858f'),
    area: 'Ciencias Sociales',
    titulo: 'Fin-Connect — Educación financiera',
    afinidad: 90,
    fechaMs: Date.now() - 4 * DIA,
    impacto: 86,
    autor: { iniciales: 'AR', nombre: 'Ana Rojas' },
    tipo: 'meta',
    metaLabel: 'Meta académica',
    meta: '$2,500',
    progreso: 30,
    cta: 'Ver detalles',
    ctaVariant: 'primary',
  },
  {
    img: IMG('1485827404703-89b55fcc595e'),
    area: 'Ciencias Sociales',
    titulo: 'EduRobótica — STEM en colegios',
    afinidad: 89,
    fechaMs: Date.now() - 6 * DIA,
    impacto: 83,
    autor: { iniciales: 'JR', nombre: 'José Ramírez' },
    tipo: 'requerimiento',
    requerimiento: 'Busca: Ingeniero de software voluntario',
    cta: 'Conectar con José',
    ctaVariant: 'outline',
  },
];

// ─── Roles con acceso completo ────────────────────────────────────────────
const ROLES_PERMITIDOS = ['exalumno', 'voluntario', 'administrador'];

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
  const [orden, setOrden]             = useState<'recientes' | 'afinidad' | 'impacto'>('recientes');
  const [pagina, setPagina]           = useState(1);
  const [query, setQuery]             = useState('');

  // ─── Rol del usuario ─────────────────────────────────────────────────
  const [rolUsuario, setRolUsuario]   = useState<string | null>(null);
  useEffect(() => {
    if (!user || !token) return;
    obtenerPerfil(token)
      .then((perfil: { rol?: string }) => setRolUsuario(perfil?.rol ?? null))
      .catch(() => setRolUsuario(null));
  }, [user, token]);

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

  // ─── Guard del CTA ────────────────────────────────────────────────────
  const handleCta = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!tieneAcceso) { abrirModal(); return; }
    // Con acceso: aquí iría la navegación real al detalle
  };

  // ─── Guard del buscador: sin acceso → mismo modal que "Apoyar proyecto" ─
  const handleBuscarGuard = (e: React.SyntheticEvent) => {
    if (!tieneAcceso) { e.preventDefault(); abrirModal(); return; }
  };

  // ─── Filtrado + ordenamiento + paginación ────────────────────────────
  const areaSeleccionada = AREAS[areaActiva];

  const proyectosFiltrados = PROYECTOS
    .filter(p => {
      if (areaSeleccionada !== 'Todas las áreas' && p.area !== areaSeleccionada) return false;
      if (query) {
        const q = query.toLowerCase();
        return p.titulo.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.autor.nombre.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (orden === 'afinidad') return b.afinidad - a.afinidad;
      if (orden === 'impacto')  return b.impacto  - a.impacto;
      return b.fechaMs - a.fechaMs; // recientes
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
                <option value="recientes">Recientes</option>
                <option value="afinidad">Afinidad</option>
                <option value="impacto">Impacto</option>
              </select>
            </div>
          </section>

          {/* Grilla de proyectos */}
          <div className={styles.grid} ref={gridAnimRef}>
            {proyectosPag.length === 0 ? (
              <div className={styles.noResults}>No se encontraron proyectos.</div>
            ) : (
              proyectosPag.map((p) => (
                <article key={p.titulo} className={`${styles.card} prj-card`}>
                  <div className={styles.cardMedia}>
                    <img className={styles.cardImg} src={p.img} alt={p.titulo} />
                    <span className={styles.afinidad}>{p.afinidad}% Afinidad</span>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardArea}>{p.area}</p>
                    <h3 className={styles.cardTitle}>{p.titulo}</h3>

                    <div className={styles.autor}>
                      {p.autor.img ? (
                        <img className={styles.autorImg} src={p.autor.img} alt={p.autor.nombre} />
                      ) : (
                        <span className={styles.autorIniciales}>{p.autor.iniciales}</span>
                      )}
                      <span className={styles.autorNombre}>{p.autor.nombre}</span>
                    </div>

                    <div className={styles.cardFooter}>
                      {p.tipo === 'meta' ? (
                        <>
                          <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>{p.metaLabel}</span>
                            <span className={styles.metaValor}>{p.meta}</span>
                          </div>
                          <div className={styles.barra}>
                            <span className={`${styles.barraFill} prj-bar`} style={{ width: `${p.progreso}%` }} />
                          </div>
                        </>
                      ) : (
                        <div className={styles.requerimiento}>
                          <p className={styles.requerimientoLabel}>Requerimiento</p>
                          <p className={styles.requerimientoTexto}>{p.requerimiento}</p>
                        </div>
                      )}
                      <button
                        id={`cta-${p.titulo.replace(/\s+/g, '-').toLowerCase()}`}
                        type="button"
                        className={p.ctaVariant === 'primary' ? styles.ctaPrimary : styles.ctaOutline}
                        onClick={handleCta}
                      >
                        {p.cta}
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
    </div>
  );
}
