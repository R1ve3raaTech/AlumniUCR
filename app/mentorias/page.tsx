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
import styles from './mentorias.module.css';

if (typeof window !== 'undefined') { gsap.registerPlugin(ScrollTrigger); }

// ─── Íconos SVG inline (heredan currentColor) ─────────────────────────────
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const ISearch = () => (<svg {...base}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>);
const IChevronDown = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (<svg className={className} style={style} {...base}><path d="m6 9 6 6 6-6" /></svg>);
const IArrowLeft = () => (<svg {...base}><path d="M19 12H5m7 7-7-7 7-7" /></svg>);
const IArrowRight = () => (<svg {...base}><path d="M5 12h14m-7-7 7 7-7 7" /></svg>);
const ILock = () => (<svg {...base}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const IClose = () => (<svg {...base}><path d="M18 6 6 18M6 6l12 12" /></svg>);

// ─── Datos y Roles ────────────────────────────────────────────────────────
const ROLES_PERMITIDOS = ['alumno', 'estudiante']; // Solo estudiantes/alumnos

const FILTROS = [
  { key: 'facultad', label: 'Facultad', opciones: ['Todas las Facultades', 'Ingeniería', 'Ciencias Sociales', 'Artes y Letras', 'Ciencias Básicas'] },
  { key: 'experticia', label: 'Experticia', opciones: ['Cualquier Experticia', 'Liderazgo', 'Software', 'Finanzas', 'Marketing', 'Gestión', 'Negocios', 'Diseño'] },
  { key: 'experiencia', label: 'Experiencia', opciones: ['Cualquier Experiencia', '1-5 años', '6-10 años', '10+ años'] },
];

type Mentor = {
  img: string;
  nombre: string;
  cargo: string;
  afinidad: string;
  tags: string[];
  facultad: string;
  experticia: string;
  experiencia: string;
};

const MENTORES: Mentor[] = [
  {
    img: '/images/ecosistema-ucr.png',
    nombre: 'Ing. Carlos Rodríguez',
    cargo: 'Senior Project Manager @ TechGlobal',
    afinidad: '98% Afinidad',
    tags: ['Gestión', 'Liderazgo', 'Software'],
    facultad: 'Ingeniería',
    experticia: 'Software',
    experiencia: '10+ años'
  },
  {
    img: '/images/campus.png',
    nombre: 'Dra. Elena Mora',
    cargo: 'Directora de Estrategia @ InnovaCR',
    afinidad: '92% Afinidad',
    tags: ['Negocios', 'Economía', 'Startups'],
    facultad: 'Ciencias Sociales',
    experticia: 'Negocios',
    experiencia: '10+ años'
  },
  {
    img: '/images/descarga-1.jpg',
    nombre: 'MSc. Javier Soto',
    cargo: 'UX/UI Design Lead @ GlobalPixels',
    afinidad: '89% Afinidad',
    tags: ['Diseño', 'Tecnología', 'Artes'],
    facultad: 'Artes y Letras',
    experticia: 'Diseño',
    experiencia: '6-10 años'
  },
  {
    img: '/images/ecosistema-ucr.png',
    nombre: 'Lic. Ana Quirós',
    cargo: 'Marketing Lead @ FinTech Latam',
    afinidad: '85% Afinidad',
    tags: ['Marketing', 'Finanzas', 'Gestión'],
    facultad: 'Ciencias Sociales',
    experticia: 'Marketing',
    experiencia: '6-10 años'
  },
  {
    img: '/images/campus.png',
    nombre: 'Dr. Roberto Brenes',
    cargo: 'Investigador Principal @ UCR',
    afinidad: '78% Afinidad',
    tags: ['Investigación', 'Ciencias Básicas'],
    facultad: 'Ciencias Básicas',
    experticia: 'Software',
    experiencia: '10+ años'
  },
  {
    img: '/images/descarga-1.jpg',
    nombre: 'Ing. Sofía Vargas',
    cargo: 'CTO @ StartupX',
    afinidad: '95% Afinidad',
    tags: ['Liderazgo', 'Software', 'Negocios'],
    facultad: 'Ingeniería',
    experticia: 'Software',
    experiencia: '1-5 años'
  },
];

export default function MentoriasPage() {
  return (
    <React.Suspense fallback={<div className={styles.page}>Cargando...</div>}>
      <MentoriasContent />
    </React.Suspense>
  );
}

function MentoriasContent() {
  const { user, token } = useAuth();
  const router = useRouter();

  // ─── Estado de Filtros y Paginación ──────────────────────────────────
  const [query, setQuery] = useState('');
  const [facultad, setFacultad] = useState('Todas las Facultades');
  const [experticia, setExperticia] = useState('Cualquier Experticia');
  const [experiencia, setExperiencia] = useState('Cualquier Experiencia');
  
  // Paginación y GSAP
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // ─── Refs de animación ──────────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const ctaRef  = useRef<HTMLElement>(null);

  // ─── Estado de Rol y Acceso ─────────────────────────────────────────
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  useEffect(() => {
    if (!user || !token) return;
    obtenerPerfil(token)
      .then((perfil: { rol?: string }) => setRolUsuario(perfil?.rol ?? null))
      .catch(() => setRolUsuario(null));
  }, [user, token]);

  // Si cambian los filtros, contraemos la lista
  useEffect(() => {
    setIsExpanded(false);
  }, [query, facultad, experticia, experiencia]);

  // ─── Modal GSAP (Acceso Restringido) ────────────────────────────────
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.1,
      onComplete: () => { setModalOpen(false); gsap.set(overlayRef.current, { visibility: 'hidden', pointerEvents: 'none' }); }
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && modalOpen) cerrarModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, cerrarModal]);

  // ─── GSAP: Hero — masked title + image sweep from right ───────────────
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx: gsap.Context = gsap.context(() => {
      const mm: gsap.MatchMedia = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl: gsap.core.Timeline = gsap.timeline({ delay: 0.1 });
        // Title mask reveal from bottom (clip-path)
        tl.fromTo(`.${styles.heroTitle}`,
          { clipPath: 'inset(100% 0 0 0)', y: 30 },
          { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 0.95, ease: 'expo.out' }
        )
        .fromTo(`.${styles.heroText}`,
          { x: -40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.75, ease: 'power3.out' },
          '-=0.5'
        )
        .fromTo(`.${styles.heroActions} > *`,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.15, ease: 'back.out(1.6)' },
          '-=0.4'
        )
        // Image sweeps in from right with clip-path
        .fromTo(`.${styles.heroFrame}`,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0, x: 50 },
          { clipPath: 'inset(0 0% 0 0)', opacity: 1, x: 0, duration: 1.1, ease: 'power4.inOut' },
          0
        )
        // Decorative corners pop in
        .fromTo([`.${styles.frameTL}`, `.${styles.frameBR}`],
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.45, stagger: 0.12, ease: 'back.out(2.5)' },
          0.9
        );
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([`.${styles.heroTitle}`, `.${styles.heroText}`, `.${styles.heroFrame}`],
          { clipPath: 'none', opacity: 1, x: 0, y: 0 });
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // ─── GSAP: Cards — alternating left/right reveal (Scroll Dynamics) ──────
  useEffect(() => {
    if (!gridRef.current) return;
    const ctx: gsap.Context = gsap.context(() => {
      const mm: gsap.MatchMedia = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = Array.from(
          gridRef.current!.querySelectorAll<HTMLElement>(`.${styles.card}`)
        );
        cards.forEach((card: HTMLElement, i: number) => {
          const fromX: number = i % 2 === 0 ? -70 : 70;
          gsap.fromTo(card,
            { x: fromX, opacity: 0, scale: 0.93 },
            { x: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 88%' } }
          );
        });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(`.${styles.card}`, { opacity: 1 });
      });
    }, gridRef);
    return () => ctx.revert();
  }, [query, facultad, experticia, experiencia, isExpanded]);

  // ─── GSAP: CTA — blur reveal + magnetic button (Core Motion Mechanics) ────
  useEffect(() => {
    if (!ctaRef.current) return;
    const ctx: gsap.Context = gsap.context(() => {
      const mm: gsap.MatchMedia = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl: gsap.core.Timeline = gsap.timeline({
          scrollTrigger: { trigger: ctaRef.current, start: 'top 78%' }
        });
        tl.fromTo(`.${styles.ctaTitle}`,
          { y: 50, opacity: 0, filter: 'blur(10px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power4.out' }
        )
        .fromTo(`.${styles.ctaText}`,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
          '-=0.5'
        )
        .fromTo(`.${styles.ctaBtn}`,
          { scale: 0.75, opacity: 0, y: 15 },
          { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(2.2)' },
          '-=0.4'
        );

        // Magnetic hover effect on CTA button
        const btn = ctaRef.current!.querySelector<HTMLAnchorElement>(`.${styles.ctaBtn}`);
        if (btn) {
          const onMove = (e: MouseEvent): void => {
            const r = btn.getBoundingClientRect();
            const dx: number = (e.clientX - (r.left + r.width  / 2)) * 0.3;
            const dy: number = (e.clientY - (r.top  + r.height / 2)) * 0.3;
            gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
          };
          const onLeave = (): void => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
          };
          btn.addEventListener('mousemove', onMove);
          btn.addEventListener('mouseleave', onLeave);
          // Return cleanup
          return () => {
            btn.removeEventListener('mousemove', onMove);
            btn.removeEventListener('mouseleave', onLeave);
          };
        }
      });
    }, ctaRef);
    return () => ctx.revert();
  }, []);

  // ─── GSAP: Animar expansión de mentores ─────────────────────────────
  const toggleMentores = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const gsap = (await import('gsap')).gsap;

    if (!isExpanded) {
      // Expandir: primero cambiamos estado para renderizar
      setIsExpanded(true);
    } else {
      // Contraer: primero animar salida de tarjetas extra
      if (gridRef.current) {
        const cards = Array.from(gridRef.current.children) as HTMLElement[];
        const extraCards = cards.slice(3);
        if (extraCards.length > 0) {
          await gsap.to(extraCards, {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.3,
            stagger: 0.05,
            ease: 'power2.in'
          });
        }
      }
      setIsExpanded(false);
      setIsAnimating(false);
      document.getElementById('mentores')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Efecto de entrada para tarjetas nuevas
  useEffect(() => {
    if (isExpanded && gridRef.current) {
      import('gsap').then(({ gsap }) => {
        const cards = Array.from(gridRef.current!.children) as HTMLElement[];
        const extraCards = cards.slice(3);
        if (extraCards.length > 0) {
          gsap.fromTo(extraCards, 
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.2)', onComplete: () => setIsAnimating(false) }
          );
        } else {
          setIsAnimating(false);
        }
      });
    }
  }, [isExpanded]);

  // ─── Manejadores de Acción ──────────────────────────────────────────
  const handleCta = (e: React.MouseEvent) => {
    e.preventDefault();
    const tieneAcceso = user && rolUsuario && ROLES_PERMITIDOS.includes(rolUsuario);
    if (!tieneAcceso) { abrirModal(); return; }
    // Aquí iría la lógica real si tiene acceso
  };

  const handleTagClick = (tag: string) => {
    const validExperticia = FILTROS.find(f => f.key === 'experticia')?.opciones.includes(tag);
    if (validExperticia) {
      setExperticia(tag);
    } else {
      setQuery(tag);
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // ─── Filtrado ───────────────────────────────────────────────────────
  const mentoresFiltrados = MENTORES.filter(m => {
    if (facultad !== 'Todas las Facultades' && m.facultad !== facultad) return false;
    if (experticia !== 'Cualquier Experticia' && m.experticia !== experticia && !m.tags.includes(experticia)) return false;
    if (experiencia !== 'Cualquier Experiencia' && m.experiencia !== experiencia) return false;
    if (query) {
      const q = query.toLowerCase();
      return m.nombre.toLowerCase().includes(q) ||
        m.cargo.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const mentoresVisibles = isExpanded ? mentoresFiltrados : mentoresFiltrados.slice(0, 3);
  const showToggleButton = mentoresFiltrados.length > 3;

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero diagonal */}
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroTexture} aria-hidden />
          <span className={styles.heroBlock} aria-hidden />
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Explorador de <span className={styles.heroAccent}>Mentorías</span>
              </h1>
              <p className={styles.heroText}>
                Conecte con graduados experimentados de la Universidad de Costa Rica.
                Encuentre el guía perfecto para acelerar su carrera profesional, compartir
                conocimientos y fortalecer la red de excelencia académica.
              </p>
              <div className={styles.heroActions}>
                <a href="#mentores" className={styles.btnPrimary}>Empieza Ahora</a>
                <a href="#postular" className={styles.btnGhost}>Ver Beneficios</a>
              </div>
            </div>
            <div className={styles.heroFrame}>
              <span className={styles.frameTL} aria-hidden />
              <span className={styles.frameBR} aria-hidden />
              <img className={styles.heroImg} src="/images/campus.png" alt="Sesión de mentoría" />
            </div>
          </div>
        </section>

        {/* Barra de filtros */}
        <section className={styles.filterBar}>
          <div className={styles.filterInner}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}><ISearch /></span>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Buscar mentor por nombre, especialidad..."
                aria-label="Buscar mentor"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className={styles.selects}>
              {FILTROS.map((f) => (
                <div key={f.label} className={styles.selectWrap}>
                  <select 
                    className={styles.select} 
                    aria-label={f.label}
                    value={f.key === 'facultad' ? facultad : f.key === 'experticia' ? experticia : experiencia}
                    onChange={(e) => {
                      if (f.key === 'facultad') setFacultad(e.target.value);
                      if (f.key === 'experticia') setExperticia(e.target.value);
                      if (f.key === 'experiencia') setExperiencia(e.target.value);
                    }}
                  >
                    {f.opciones.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <IChevronDown className={styles.selectIcon} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grilla de mentores */}
        <section id="mentores" className={styles.mentores}>
          <div className={styles.container}>
            <div className={styles.mentoresHead}>
              <div>
                <h2 className={styles.mentoresTitle}>Mentores Recomendados</h2>
                <p className={styles.mentoresSub}>Basado en su perfil y red de contactos.</p>
              </div>
              <div className={styles.carouselNav}>
                <button type="button" className={styles.carouselBtn} aria-label="Anterior"><IArrowLeft /></button>
                <button type="button" className={styles.carouselBtn} aria-label="Siguiente"><IArrowRight /></button>
              </div>
            </div>

            <div className={styles.grid} ref={gridRef}>
              {mentoresFiltrados.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '2rem 0', color: 'var(--ucr-outline)', textAlign: 'center', fontWeight: 'bold' }}>
                  No se encontraron mentores con esos criterios.
                </div>
              ) : (
                mentoresVisibles.map((m) => (
                  <article key={m.nombre} className={styles.card}>
                    <div className={styles.cardMedia}>
                      <img className={styles.cardImg} src={m.img} alt={m.nombre} />
                      <span className={styles.afinidad}>{m.afinidad}</span>
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardName}>{m.nombre}</h3>
                      <p className={styles.cardRole}>{m.cargo}</p>
                      <div className={styles.tags}>
                        {m.tags.map((t) => (
                          <span 
                            key={t} 
                            className={styles.tag} 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleTagClick(t)}
                            title={`Filtrar por ${t}`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className={styles.cardActions}>
                        <button type="button" className={styles.ctaPrimary} onClick={handleCta}>Ver Perfil</button>
                        <button type="button" className={styles.ctaOutline} onClick={handleCta}>Conectar</button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {showToggleButton && (
              <div className={styles.loadMore}>
                <button 
                  type="button" 
                  className={styles.loadBtn} 
                  onClick={toggleMentores}
                  disabled={isAnimating}
                >
                  {isExpanded ? 'Ver menos mentores' : 'Ver más mentores'} 
                  <IChevronDown className={styles.loadIcon} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </button>
                <span className={styles.loadRule} aria-hidden />
              </div>
            )}
          </div>
        </section>

        {/* CTA: ser mentor */}
        <section id="postular" className={styles.cta} ref={ctaRef}>
          <div className={styles.ctaTexture} aria-hidden />
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>¿Listo para ser un mentor?</h2>
            <p className={styles.ctaText}>
              Comparta su experiencia con la próxima generación de líderes de la UCR.
              Regístrese como mentor y deje su huella.
            </p>
            <Link href="/registro" className={styles.ctaBtn}>Postularme como Mentor</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <AlumniLogo height={36} />
          <nav className={styles.footerLinks}>
            <Link href="/ayuda">Contacto</Link>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="https://www.ucr.ac.cr" target="_blank" rel="noopener noreferrer">UCR.ac.cr</a>
          </nav>
          <p className={styles.footerCopy}>
            © 2025 Alumni UCR. Universidad de Costa Rica.<br />Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* ─── Modal de acceso restringido (GSAP) ──────────────────────── */}
      <div
        ref={overlayRef}
        className={styles.modalOverlay}
        id="modal-acceso-mentor"
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
            Para acceder a los perfiles de los mentores y solicitar conexiones necesitas una
            cuenta activa como <strong>Alumno</strong> o <strong>Estudiante</strong> de la
            red UCR Connect. ¡Regístrate ahora!
          </p>

          <div className={styles.modalActions}>
            <button
              id="modal-registrarse"
              type="button"
              className={styles.modalBtnPrimary}
              onClick={() => { cerrarModal(); router.push('/registro'); }}
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
