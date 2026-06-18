'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/landing/Navbar';
import AlumniLogo from '@/components/AlumniLogo';
import styles from './ayuda.module.css';

// Registro de plugins GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Íconos SVG inline ───────────────────────────────────────────────────
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const ISearch = () => (<svg {...base}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>);
const IProfile = () => (<svg {...base}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const ISchool = () => (<svg {...base}><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" /></svg>);
const IHub = () => (<svg {...base}><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" /><path d="M12 7.5v4m0 0-5 5m5-5 5 5" /></svg>);
const ICalendar = () => (<svg {...base}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
const IShield = () => (<svg {...base}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M9 12l2 2 4-4" /></svg>);
const IChevron = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (<svg className={className} style={style} {...base}><path d="m6 9 6 6 6-6" /></svg>);
const IChat = () => (<svg {...base}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>);
const ITicket = ({ style }: { style?: React.CSSProperties }) => (<svg style={style} {...base}><path d="M3 9a3 3 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z" /><path d="M13 5v14" /></svg>);
const IMessageSquare = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (<svg className={className} style={style} {...base}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);

// ─── Datos ────────────────────────────────────────────────────────────────
const CATEGORIAS = [
  { icon: <IProfile />, titulo: 'Gestión de Perfil', texto: 'Actualiza tu información académica y profesional.' },
  { icon: <ISchool />, titulo: 'Mentorías', texto: 'Guía para mentores y mentees sobre el proceso.' },
  { icon: <IHub />, titulo: 'Proyectos', texto: 'Colaboración y publicación de iniciativas Alumni.' },
  { icon: <ICalendar />, titulo: 'Eventos y Red', texto: 'Gestión de inscripciones y networking regional.' },
  { icon: <IShield />, titulo: 'Seguridad', texto: 'Recuperación de cuenta y privacidad de datos.' },
];

const FAQS = [
  { categoria: 'Mentorías', pregunta: '¿Cómo me convierto en mentor?', respuesta: 'Para convertirte en mentor, debes ir a tu perfil, seleccionar la pestaña "Mentorías" y completar el formulario de postulación. Revisaremos tu trayectoria profesional y académica en la UCR para validar tu perfil.' },
  { categoria: 'Proyectos', pregunta: '¿Quién puede ver mis proyectos?', respuesta: 'Tú controlas la visibilidad. Por defecto, los proyectos son visibles para la red verificada de Alumni UCR. Puedes ajustar la privacidad para que solo usuarios con intereses específicos puedan ver tus colaboraciones activas.' },
  { categoria: 'Seguridad', pregunta: '¿Cómo recupero mi cuenta institucional?', respuesta: 'Si has perdido acceso a tu cuenta, usa la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión para recibir un enlace de restablecimiento. Si el problema persiste con tu correo @ucr.ac.cr, contacta al Centro de Informática.' },
  { categoria: 'Gestión de Perfil', pregunta: '¿Cómo actualizo mi currículum?', respuesta: 'Dirígete a la configuración de tu cuenta y haz clic en "Perfil Profesional". Allí podrás subir un nuevo documento PDF o enlazar directamente tu perfil de LinkedIn.' },
  { categoria: 'Eventos y Red', pregunta: '¿Dónde encuentro eventos de networking?', respuesta: 'Todos los eventos presenciales y virtuales organizados por Alumni UCR se publican en el boletín semanal y en la pestaña "Eventos" del Navbar principal.' },
  { categoria: 'Mentorías', pregunta: '¿Puedo tener más de un mentor?', respuesta: 'Actualmente, el sistema permite conectar activamente con un máximo de 2 mentores simultáneamente para asegurar la calidad y el compromiso en el proceso de guía.' },
];

const SOPORTE_CORREO = 'soporte@ucrconnect.cr';

export default function AyudaPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<number | null>(null);

  const categoriasRef = useRef<HTMLElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contactoRef = useRef<HTMLElement>(null);
  const noResultsRef = useRef<HTMLDivElement>(null);

  // ─── Filtrado Predictivo ──────────────────────────────────────────────
  const faqsFiltradas = useMemo(() => {
    let filtradas = FAQS;
    // 1. Filtro por categoría (clic en tarjeta)
    if (categoriaActiva) {
      filtradas = filtradas.filter(f => f.categoria === categoriaActiva);
    }
    // 2. Filtro predictivo por texto
    const q = busqueda.trim().toLowerCase();
    if (q) {
      filtradas = filtradas.filter(
        f => f.pregunta.toLowerCase().includes(q) || f.respuesta.toLowerCase().includes(q)
      );
    }
    return filtradas;
  }, [busqueda, categoriaActiva]);

  // ─── Animación GSAP: Ocultar/Mostrar Categorías al Buscar ─────────────
  useEffect(() => {
    if (!categoriasRef.current) return;
    const ctx = gsap.context(() => {
      if (busqueda.trim() !== '') {
        // Ocultar categorías
        gsap.to(categoriasRef.current, {
          height: 0,
          opacity: 0,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: 'hidden',
          duration: 0.4,
          ease: 'power2.inOut',
        });
        if (categoriaActiva) setCategoriaActiva(null);
      } else {
        // Mostrar categorías
        gsap.to(categoriasRef.current, {
          height: 'auto',
          opacity: 1,
          marginTop: '',
          marginBottom: '',
          paddingTop: '',
          paddingBottom: '',
          duration: 0.4,
          ease: 'power2.inOut',
          clearProps: 'overflow',
        });
      }
    });
    return () => ctx.revert();
  }, [busqueda, categoriaActiva]);

  // ─── Animación GSAP: Contacto (Core Motion Mechanics & Scroll Dynamics) ──
  useEffect(() => {
    if (!contactoRef.current) return;
    
    // Tipado estricto para el contexto y el matchMedia
    let ctx: gsap.Context = gsap.context(() => {
      // Implementación de accesibilidad (prefers-reduced-motion)
      let mm: gsap.MatchMedia = gsap.matchMedia();
      
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Animaciones complejas de layout y staggers
        const tl: gsap.core.Timeline = gsap.timeline({
          scrollTrigger: {
            trigger: contactoRef.current,
            start: 'top 75%',
          }
        });
        
        // Animación continua optimizada (Kinetic)
        gsap.to('.contact-blob-1', {
          y: 50, x: 30, rotation: 10, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1
        });
        gsap.to('.contact-blob-2', {
          y: -60, x: -40, rotation: -15, duration: 10, ease: 'sine.inOut', yoyo: true, repeat: -1
        });
        
        // Revelado de texto cinético
        tl.fromTo('.contact-line > span', 
          { y: '100%', rotate: 2 },
          { y: '0%', rotate: 0, duration: 0.9, stagger: 0.15, ease: 'power4.out' }
        )
        .fromTo('.contact-desc', 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          "-=0.5"
        )
        // Stagger y snapping visual de tarjetas
        .to('.contact-item', {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'back.out(1.2)'
        }, "-=0.6");
      });
      
      // Fallback estático para accesibilidad
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(['.contact-line > span', '.contact-desc', '.contact-item'], {
          opacity: 1, y: 0, x: 0, rotate: 0
        });
      });
      
    }, contactoRef);
    
    // Clean-up impecable del ciclo de vida
    return () => {
      ctx.revert();
    };
  }, []);

  // ─── Animación GSAP: Empty State (State Transitions) ──────────────────
  useEffect(() => {
    if (faqsFiltradas.length === 0 && noResultsRef.current) {
      let ctx: gsap.Context = gsap.context(() => {
        gsap.fromTo(noResultsRef.current, 
          { opacity: 0, y: -10, scale: 0.98 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
        );
        
        gsap.fromTo('.no-results-alert-icon',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, delay: 0.2, ease: 'back.out(2)' }
        );
      });
      return () => ctx.revert();
    }
  }, [faqsFiltradas.length]);

  // ─── Animación GSAP: Acordeón ────────────────────────────────────────
  const toggle = (idx: number) => {
    // Si ya estaba abierto, ciérralo
    if (abierto === idx) {
      gsap.to(contentRefs.current[idx], { height: 0, duration: 0.35, ease: 'power2.inOut' });
      setAbierto(null);
    } else {
      // Cierra el anterior si existe
      if (abierto !== null && contentRefs.current[abierto]) {
        gsap.to(contentRefs.current[abierto], { height: 0, duration: 0.35, ease: 'power2.inOut' });
      }
      // Abre el nuevo
      setAbierto(idx);
      gsap.fromTo(contentRefs.current[idx], 
        { height: 0 }, 
        { height: 'auto', duration: 0.5, ease: 'back.out(1.2)' }
      );
    }
  };

  const handleCardClick = (titulo: string) => {
    if (categoriaActiva === titulo) {
      setCategoriaActiva(null); // Toggle off
    } else {
      setCategoriaActiva(titulo);
      setAbierto(null); // Cierra acordeones al cambiar categoría
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main>
        {/* Hero con buscador */}
        <section className={styles.hero}>
          <span className={styles.heroGlow} aria-hidden />
          <span className={styles.heroSkew} aria-hidden />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Centro de Ayuda</h1>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}><ISearch /></span>
              <input
                className={styles.search}
                type="text"
                placeholder="¿En qué podemos ayudarte hoy?"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar en el centro de ayuda"
              />
            </div>
          </div>
        </section>

        {/* Categorías de soporte (Desaparecen al buscar) */}
        <section className={styles.categorias} ref={categoriasRef}>
          {CATEGORIAS.map((c) => {
            const isActive = categoriaActiva === c.titulo;
            return (
              <article 
                key={c.titulo} 
                className={styles.card}
                onClick={() => handleCardClick(c.titulo)}
                style={{
                  borderColor: isActive ? 'var(--brand-esmeralda)' : 'rgba(0, 76, 99, 0.1)',
                  boxShadow: isActive ? '0 12px 30px -10px rgba(0, 102, 135, 0.3)' : '',
                  transform: isActive ? 'translateY(-0.5rem)' : '',
                }}
              >
                <span 
                  className={styles.cardIcon}
                  style={{
                    backgroundColor: isActive ? 'var(--brand-esmeralda)' : '',
                    color: isActive ? 'var(--brand-blanco)' : '',
                  }}
                >
                  {c.icon}
                </span>
                <h3 className={styles.cardTitle}>{c.titulo}</h3>
                <p className={styles.cardText}>{c.texto}</p>
              </article>
            );
          })}
        </section>

        {/* Preguntas frecuentes */}
        <section id="faq-section" className={styles.faqSection}>
          <div className={styles.faqInner}>
            <div className={styles.faqHead}>
              <h2 className={styles.faqTitle}>
                {categoriaActiva ? `Preguntas sobre ${categoriaActiva}` : 'Preguntas Frecuentes'}
              </h2>
              <span className={styles.faqRule} aria-hidden />
            </div>

            <div className={styles.faqList}>
              {faqsFiltradas.length === 0 ? (
                <div ref={noResultsRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'var(--ucr-surface)', border: '1px solid var(--ucr-outline-variant)', borderRadius: '0.5rem', padding: '1rem 1.5rem', marginTop: '1rem', boxShadow: '0 4px 15px -5px rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="no-results-alert-icon" style={{ background: 'rgba(243, 75, 38, 0.1)', color: 'var(--brand-naranja)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                      <ISearch />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--ucr-primary)', fontFamily: 'var(--font-ucr-display)' }}>No hay resultados para "{busqueda}"</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ucr-on-surface-variant)' }}>¿Quieres que nuestro asistente virtual lo resuelva por ti?</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-global-chatbot', { detail: { query: busqueda } }))}
                    style={{ background: 'var(--brand-esmeralda)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--brand-esmeralda-dark, #00A664)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--brand-esmeralda)'}
                  >
                    <IChat /> Consultar Asistente
                  </button>
                </div>
              ) : (
                faqsFiltradas.map((f, i) => {
                  const activo = abierto === i;
                  return (
                    <div 
                      key={f.pregunta} 
                      className={`${styles.accordion} ${activo ? styles.accordionActive : ''}`}
                      style={{ borderColor: activo ? 'var(--brand-esmeralda)' : '' }}
                    >
                      <button
                        type="button"
                        className={styles.accordionBtn}
                        onClick={() => toggle(i)}
                        aria-expanded={activo}
                      >
                        <span className={styles.accordionQ}>{f.pregunta}</span>
                        <IChevron 
                          className={styles.chevron} 
                          style={{ 
                            transform: activo ? 'rotate(180deg)' : 'none', 
                            color: activo ? 'var(--brand-esmeralda)' : '' 
                          }} 
                        />
                      </button>
                      <div 
                        className={styles.accordionContent}
                        ref={(el) => { contentRefs.current[i] = el; }}
                      >
                        <p className={styles.accordionA}>{f.respuesta}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Call to Action Final - Informativo (Sin Contenedor) */}
        <section className={styles.contacto} ref={contactoRef} style={{ padding: '6rem 2rem', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          {/* Decorative floating blobs */}
          <div className="contact-blob-1" style={{ position: 'absolute', top: '10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0, 192, 243, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
          <div className="contact-blob-2" style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(243, 75, 38, 0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 0 }} />
          
          <div style={{ maxWidth: '70rem', margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem' }}>
            
            {/* Left side: Striking Text */}
            <div className="contact-text-wrap" style={{ flex: '1 1 400px' }}>
              <h2 style={{ fontFamily: 'var(--font-ucr-display)', fontSize: '3rem', color: 'var(--brand-azul)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                <span className="contact-line" style={{ display: 'block', overflow: 'hidden' }}><span style={{ display: 'block' }}>Canales de</span></span>
                <span className="contact-line" style={{ display: 'block', overflow: 'hidden' }}><span style={{ display: 'block', color: 'var(--brand-esmeralda)' }}>Atención Oficiales</span></span>
              </h2>
              <p className="contact-desc" style={{ color: 'var(--ucr-on-surface-variant)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '30rem' }}>
                Si no encontraste la respuesta que buscabas, nuestro equipo de soporte está disponible para brindarte asistencia técnica y administrativa.
              </p>
            </div>
            
            {/* Right side: Floating Contact Cards */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Email Card */}
              <div className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.8)', padding: '1.5rem 2rem', borderRadius: '1rem', boxShadow: '0 20px 40px -20px rgba(0, 76, 99, 0.1)', transform: 'translateX(50px)', opacity: 0 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-celeste) 0%, var(--brand-azul) 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', flexShrink: 0, boxShadow: '0 10px 20px -5px rgba(0, 76, 99, 0.3)' }}>
                  <IMessageSquare style={{ width: 28, height: 28 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--brand-azul)', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-ucr-display)' }}>Correo Institucional</h3>
                  <p style={{ color: 'var(--ucr-on-surface-variant)', margin: 0, fontSize: '1rem' }}>soporte@ucrconnect.cr</p>
                </div>
              </div>
              
              {/* Ticket Card */}
              <div className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.8)', padding: '1.5rem 2rem', borderRadius: '1rem', boxShadow: '0 20px 40px -20px rgba(0, 76, 99, 0.1)', transform: 'translateX(50px)', opacity: 0, marginLeft: '2rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF8A65 0%, var(--brand-naranja) 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', flexShrink: 0, boxShadow: '0 10px 20px -5px rgba(243, 75, 38, 0.3)' }}>
                  <ITicket style={{ width: 28, height: 28 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--brand-azul)', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-ucr-display)' }}>Sistema de Tickets</h3>
                  <p style={{ color: 'var(--ucr-on-surface-variant)', margin: 0, fontSize: '1rem' }}>Atención en 24-48 horas</p>
                </div>
              </div>
            </div>
            
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <AlumniLogo height={34} />
            <p className={styles.footerCopy}>© 2025 Alumni UCR. Todos los derechos reservados.</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <Link href="/login">Iniciar sesión</Link>
            <a href="#" className={styles.footerActive}>Preguntas Frecuentes</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
