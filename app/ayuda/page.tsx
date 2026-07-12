'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/landing/Navbar';
import AlumniLogo from '@/components/common/AlumniLogo';
import { enviarConsultaSoporte } from '@/lib/admin/consultasSoporte';
import { obtenerFaqs } from '@/lib/common/faqs';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth/auth';
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
// Las preguntas y categorías vienen del backend (fuente única versionada,
// /api/faqs). Aquí solo mapeamos el ícono de cada gestión por su título.
interface Faq { categoria: string; pregunta: string; respuesta: string; }
interface Categoria { key: string; titulo: string; texto: string; }

const ICONOS: Record<string, React.ReactNode> = {
  'Registro y Cuenta': <IProfile />,
  'Estudiantes y Becas': <ISchool />,
  'Exalumnos y Mentorías': <IHub />,
  'Proyectos y Financiamiento': <ICalendar />,
  'Donaciones': <ITicket />,
  'Seguridad y Privacidad': <IShield />,
};
const ICONO_DEFECTO = <IHub />;

const SUGERENCIAS_POR_ROL: Record<string, string[]> = {
  visitante: [
    '¿Quiénes pueden registrarse?',
    '¿Los exalumnos también necesitan correo institucional?',
    '¿Cuánto tarda en aprobarse mi cuenta?',
    '¿El registro tiene algún costo?'
  ],
  estudiante: [
    '¿Qué es el CV con IA?',
    '¿Cómo busco mentores o apoyo?',
    '¿Para qué sirve registrar mi proyecto de graduación?',
    '¿Qué encuentro en mi dashboard?'
  ],
  exalumno: [
    '¿Cómo me postulo como mentor?',
    '¿Cómo funciona el matching interdisciplinario?',
    '¿Puedo ofrecer empleo o pasantías?',
    '¿Cómo registro una donación?'
  ],
  admin: [
    '¿Cómo funciona el matching avanzado?',
    '¿Cómo auditar o validar donaciones?',
    '¿Cómo moderar o resolver reportes?',
    '¿Cómo mantener las tablas maestras?'
  ]
};

export default function AyudaPage() {
  const { token } = useAuth();
  const [rol, setRol] = useState('visitante');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!token) {
      setRol('visitante');
      return;
    }
    let activo = true;
    obtenerPerfil(token)
      .then((res) => {
        if (!activo) return;
        const userRol = res?.data?.roles?.nombre?.toLowerCase().trim();
        setRol(userRol || 'visitante');
      })
      .catch(() => {
        if (activo) setRol('visitante');
      });
    return () => { activo = false; };
  }, [token]);

  // ─── Categorías de soporte (desde el backend, con caché de resiliencia) ──
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    let activo = true;
    obtenerFaqs().then((d) => {
      if (!activo) return;
      setCategorias(d?.categorias ?? []);
    });
    return () => { activo = false; };
  }, []);

  // ─── Consulta directa al administrador (Centro de Soporte) ──────────────
  const [consulta, setConsulta] = useState({ nombre: '', apellidos: '', cedula: '', telefono: '', mensaje: '' });
  const [enviandoConsulta, setEnviandoConsulta] = useState(false);
  const [consultaEnviada, setConsultaEnviada] = useState(false);
  const [errorConsulta, setErrorConsulta] = useState<string | null>(null);

  const setCampoConsulta = (campo: keyof typeof consulta, valor: string) =>
    setConsulta((c) => ({ ...c, [campo]: valor }));

  async function enviarConsulta(e: React.FormEvent) {
    e.preventDefault();
    setErrorConsulta(null);
    const { nombre, apellidos, cedula, telefono, mensaje } = consulta;
    if (!nombre.trim() || !apellidos.trim() || !cedula.trim() || !telefono.trim() || !mensaje.trim()) {
      setErrorConsulta('Por favor completá todos los campos.');
      return;
    }
    setEnviandoConsulta(true);
    try {
      await enviarConsultaSoporte({
        nombre: nombre.trim(), apellidos: apellidos.trim(), cedula: cedula.trim(),
        telefono: telefono.trim(), mensaje: mensaje.trim(),
      });
      setConsultaEnviada(true);
    } catch (err) {
      setErrorConsulta(err instanceof Error ? err.message : 'No se pudo enviar la consulta. Intentá de nuevo.');
    } finally {
      setEnviandoConsulta(false);
    }
  }

  const irAConsulta = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('consulta-admin')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const categoriasRef = useRef<HTMLElement>(null);
  const contactoRef = useRef<HTMLElement>(null);

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

  const handleCardClick = (titulo: string) => {
    window.dispatchEvent(new CustomEvent('open-global-chatbot', {
      detail: { query: `Hola, tengo dudas sobre la categoría "${titulo}". ¿Me podrías guiar con las consultas más comunes?` }
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      window.dispatchEvent(new CustomEvent('open-global-chatbot', { detail: { query: busqueda } }));
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
            <form onSubmit={handleSearchSubmit} className={styles.searchWrap}>
              <span className={styles.searchIcon}><ISearch /></span>
              <input
                className={styles.search}
                type="text"
                placeholder="¿En qué podemos ayudarte hoy? Escribe tu duda..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar en el centro de ayuda con IA"
              />
              <button type="submit" className={styles.searchBtn}>
                Preguntar
              </button>
            </form>

            {/* Preguntas sugeridas por la IA */}
            <div className={styles.suggestedQuestions}>
              <span className={styles.suggestedLabel}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.sparkleIcon}>
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                Preguntas sugeridas por la IA:
              </span>
              <div className={styles.suggestedChips}>
                {(SUGERENCIAS_POR_ROL[rol] || SUGERENCIAS_POR_ROL.visitante).map((pregunta, index) => (
                  <button
                    key={index}
                    type="button"
                    className={styles.suggestedChip}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-global-chatbot', { detail: { query: pregunta } }));
                    }}
                  >
                    {pregunta}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categorías de soporte */}
        <section className={styles.categorias} ref={categoriasRef} aria-label="Categorías de ayuda">
          {categorias.map((c) => {
            return (
              <article
                key={c.titulo}
                className={styles.card}
                role="button"
                tabIndex={0}
                aria-label={`Preguntar sobre ${c.titulo}`}
                onClick={() => handleCardClick(c.titulo)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(c.titulo); }
                }}
              >
                <span className={styles.cardIcon} aria-hidden>
                  {ICONOS[c.titulo] ?? ICONO_DEFECTO}
                </span>
                <h3 className={styles.cardTitle}>{c.titulo}</h3>
                <p className={styles.cardText}>{c.texto}</p>
              </article>
            );
          })}
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

        {/* ─── Consulta directa al administrador (Centro de Soporte) ─── */}
        <section id="consulta-admin" style={{ padding: '4rem 2rem 5rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '680px', background: 'var(--brand-blanco)', border: '1px solid var(--ucr-outline-variant)', borderTop: '5px solid var(--ucr-celeste)', borderRadius: '1.25rem', boxShadow: '0 30px 70px -30px rgba(0,31,42,0.22)', padding: 'clamp(1.5rem, 1rem + 2vw, 2.75rem)' }}>
            {consultaEnviada ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '5rem', height: '5rem', margin: '0 auto 1.25rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--ucr-celeste), var(--brand-esmeralda))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40 }}><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-ucr-display)', fontWeight: 800, fontSize: '1.7rem', color: 'var(--ucr-primary)', margin: '0 0 0.5rem' }}>¡Consulta enviada!</h2>
                <p style={{ color: 'var(--ucr-on-surface-variant)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '34rem', margin: '0 auto' }}>
                  Tu consulta fue enviada al <strong style={{ color: 'var(--ucr-primary)' }}>Centro de Soporte Alumni UCR</strong>. Nuestro equipo la revisará y te contactará a la brevedad.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ width: '3rem', height: '3rem', flexShrink: 0, borderRadius: '0.85rem', background: 'rgba(84,188,235,0.15)', color: 'var(--ucr-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><IMessageSquare style={{ width: 24, height: 24 }} /></span>
                  <h2 style={{ fontFamily: 'var(--font-ucr-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 1.2rem + 1vw, 2rem)', color: 'var(--ucr-primary)', margin: 0, lineHeight: 1.1 }}>¿No encontraste tu respuesta?</h2>
                </div>
                <p style={{ color: 'var(--ucr-on-surface-variant)', fontSize: '1rem', lineHeight: 1.55, margin: '0 0 1.5rem' }}>
                  Escribinos directamente al <strong>administrador del Centro de Soporte</strong> y te ayudamos con tu consulta.
                </p>

                <form onSubmit={enviarConsulta} noValidate>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="c-nombre" style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ucr-primary)', marginBottom: '0.4rem' }}>Nombre completo *</label>
                      <input id="c-nombre" type="text" value={consulta.nombre} onChange={(e) => setCampoConsulta('nombre', e.target.value)} placeholder="Ej: Juan" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--ucr-outline-variant)', borderRadius: '0.6rem', background: 'var(--ucr-surface)', fontSize: '0.95rem', color: 'var(--ucr-on-surface)', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label htmlFor="c-apellidos" style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ucr-primary)', marginBottom: '0.4rem' }}>Apellidos *</label>
                      <input id="c-apellidos" type="text" value={consulta.apellidos} onChange={(e) => setCampoConsulta('apellidos', e.target.value)} placeholder="Ej: Pérez Mora" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--ucr-outline-variant)', borderRadius: '0.6rem', background: 'var(--ucr-surface)', fontSize: '0.95rem', color: 'var(--ucr-on-surface)', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label htmlFor="c-cedula" style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ucr-primary)', marginBottom: '0.4rem' }}>Cédula o documento *</label>
                      <input id="c-cedula" type="text" inputMode="numeric" value={consulta.cedula} onChange={(e) => setCampoConsulta('cedula', e.target.value)} placeholder="Ej: 1-1234-5678" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--ucr-outline-variant)', borderRadius: '0.6rem', background: 'var(--ucr-surface)', fontSize: '0.95rem', color: 'var(--ucr-on-surface)', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label htmlFor="c-telefono" style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ucr-primary)', marginBottom: '0.4rem' }}>Teléfono de contacto *</label>
                      <input id="c-telefono" type="tel" inputMode="tel" value={consulta.telefono} onChange={(e) => setCampoConsulta('telefono', e.target.value)} placeholder="Ej: 8888-8888" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--ucr-outline-variant)', borderRadius: '0.6rem', background: 'var(--ucr-surface)', fontSize: '0.95rem', color: 'var(--ucr-on-surface)', fontFamily: 'inherit' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="c-mensaje" style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ucr-primary)', marginBottom: '0.4rem' }}>Tu consulta *</label>
                    <textarea id="c-mensaje" rows={4} value={consulta.mensaje} onChange={(e) => setCampoConsulta('mensaje', e.target.value)} placeholder="Contanos en qué te podemos ayudar…" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--ucr-outline-variant)', borderRadius: '0.6rem', background: 'var(--ucr-surface)', fontSize: '0.95rem', color: 'var(--ucr-on-surface)', fontFamily: 'inherit', resize: 'vertical' }} />
                  </div>

                  <button type="submit" disabled={enviandoConsulta} style={{ width: '100%', padding: '0.95rem 2rem', background: 'linear-gradient(135deg, var(--brand-esmeralda), var(--ucr-primary))', color: '#fff', fontFamily: 'var(--font-ucr-display)', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.02em', border: 'none', borderRadius: '999px', boxShadow: '0 16px 38px -10px rgba(0,125,103,0.5)', cursor: enviandoConsulta ? 'not-allowed' : 'pointer', opacity: enviandoConsulta ? 0.7 : 1 }}>
                    {enviandoConsulta ? 'Enviando…' : 'Enviar consulta al administrador'}
                  </button>

                  {errorConsulta && (
                    <div role="alert" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#ffe2dd', color: '#93000a', border: '1px solid #f3b5ab', borderRadius: '0.75rem', padding: '0.85rem 1rem', fontSize: '0.92rem', fontWeight: 600 }}>
                      <span style={{ flexShrink: 0, width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'var(--brand-naranja, #F34B26)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>!</span>
                      {errorConsulta}
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <AlumniLogo height={34} />
            <p className={styles.footerCopy}>© 2026 Alumni UCR. Todos los derechos reservados.</p>
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
