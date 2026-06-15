'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import AlumniLogo from '@/components/AlumniLogo';
import styles from './ayuda.module.css';

// ─── Íconos SVG inline (patrón del proyecto: heredan currentColor) ────────
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const ISearch = () => (
  <svg {...base}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const IProfile = () => (
  <svg {...base}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const ISchool = () => (
  <svg {...base}><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" /></svg>
);
const IHub = () => (
  <svg {...base}><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" /><path d="M12 7.5v4m0 0-5 5m5-5 5 5" /></svg>
);
const ICalendar = () => (
  <svg {...base}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
const IShield = () => (
  <svg {...base}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M9 12l2 2 4-4" /></svg>
);
const IChevron = ({ className }: { className?: string }) => (
  <svg className={className} {...base}><path d="m6 9 6 6 6-6" /></svg>
);
const IChat = () => (
  <svg {...base}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>
);
const ITicket = () => (
  <svg {...base}><path d="M3 9a3 3 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z" /><path d="M13 5v14" /></svg>
);
const IArrowLeft = () => (
  <svg {...base}><path d="M19 12H5m7 7-7-7 7-7" /></svg>
);
const IHelp = () => (
  <svg {...base}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
);

// ─── Datos ────────────────────────────────────────────────────────────────
const CATEGORIAS = [
  { icon: <IProfile />, titulo: 'Gestión de Perfil', texto: 'Actualiza tu información académica y profesional.' },
  { icon: <ISchool />, titulo: 'Mentorías', texto: 'Guía para mentores y mentees sobre el proceso de matching.' },
  { icon: <IHub />, titulo: 'Proyectos', texto: 'Colaboración y publicación de iniciativas Alumni.' },
  { icon: <ICalendar />, titulo: 'Eventos y Red', texto: 'Gestión de inscripciones y networking regional.' },
  { icon: <IShield />, titulo: 'Seguridad', texto: 'Recuperación de cuenta y privacidad de datos.' },
];

const FAQS = [
  {
    pregunta: '¿Cómo me convierto en mentor?',
    respuesta:
      'Para convertirte en mentor, debes ir a tu perfil, seleccionar la pestaña "Mentorías" y completar el formulario de postulación. Revisaremos tu trayectoria profesional y académica en la UCR para validar tu perfil y habilitar tus opciones de asesoría.',
  },
  {
    pregunta: '¿Quién puede ver mis proyectos?',
    respuesta:
      'Tú controlas la visibilidad. Por defecto, los proyectos son visibles para la red verificada de Alumni UCR. Puedes ajustar la privacidad para que solo usuarios con intereses específicos o mentores destacados puedan ver tus colaboraciones activas.',
  },
  {
    pregunta: '¿Cómo recupero mi cuenta institucional?',
    respuesta:
      'Si has perdido acceso a tu cuenta, usa la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión para recibir un enlace de restablecimiento. Si el problema persiste con tu correo institucional @ucr.ac.cr, contacta al Centro de Informática de la UCR.',
  },
];

const SOPORTE_CORREO = 'soporte@ucrconnect.cr';

export default function AyudaPage() {
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState<number | null>(0);

  // Filtra las preguntas frecuentes según la búsqueda (cliente).
  const faqsFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) => f.pregunta.toLowerCase().includes(q) || f.respuesta.toLowerCase().includes(q),
    );
  }, [busqueda]);

  const toggle = (i: number) => setAbierto((actual) => (actual === i ? null : i));

  return (
    <div className={styles.page}>
      {/* Cabecera */}
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={36} /></Link>
        <nav className={styles.headerNav}>
          <Link href="/login" className={styles.back}><IArrowLeft /> Volver</Link>
          <span className={styles.headerHelp} aria-hidden><IHelp /></span>
        </nav>
      </header>

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
                placeholder="¿En qué podemos ayudarte?"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar en el centro de ayuda"
              />
            </div>
          </div>
        </section>

        {/* Categorías de soporte */}
        <section className={styles.categorias}>
          {CATEGORIAS.map((c) => (
            <article key={c.titulo} className={styles.card}>
              <span className={styles.cardIcon}>{c.icon}</span>
              <h3 className={styles.cardTitle}>{c.titulo}</h3>
              <p className={styles.cardText}>{c.texto}</p>
            </article>
          ))}
        </section>

        {/* Preguntas frecuentes */}
        <section className={styles.faqSection}>
          <div className={styles.faqInner}>
            <div className={styles.faqHead}>
              <h2 className={styles.faqTitle}>Preguntas Frecuentes</h2>
              <span className={styles.faqRule} aria-hidden />
            </div>

            <div className={styles.faqList}>
              {faqsFiltradas.length === 0 && (
                <p className={styles.faqEmpty}>No encontramos resultados para “{busqueda}”.</p>
              )}
              {faqsFiltradas.map((f) => {
                const idx = FAQS.indexOf(f);
                const activo = abierto === idx;
                return (
                  <div key={f.pregunta} className={`${styles.accordion} ${activo ? styles.accordionActive : ''}`}>
                    <button
                      type="button"
                      className={styles.accordionBtn}
                      onClick={() => toggle(idx)}
                      aria-expanded={activo}
                    >
                      <span className={styles.accordionQ}>{f.pregunta}</span>
                      <IChevron className={styles.chevron} />
                    </button>
                    <div className={styles.accordionContent}>
                      <p className={styles.accordionA}>{f.respuesta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Canales de contacto */}
        <section className={styles.contacto}>
          <div className={styles.contactoGrid}>
            <div className={styles.chatCard}>
              <span className={styles.chatGlow} aria-hidden />
              <div>
                <h2 className={styles.chatTitle}>¿Necesitas respuestas rápidas?</h2>
                <p className={styles.chatText}>
                  Nuestro equipo de soporte está en línea de lunes a viernes de 8:00 AM a 5:00 PM.
                </p>
              </div>
              <a className={styles.chatBtn} href={`mailto:${SOPORTE_CORREO}?subject=Chat%20de%20soporte%20—%20UCR%20Connect`}>
                <IChat /> Iniciar chat en vivo
              </a>
            </div>

            <div className={styles.ticketCard}>
              <div>
                <h2 className={styles.ticketTitle}>Envía un ticket de soporte</h2>
                <p className={styles.ticketText}>
                  Si tienes un problema técnico detallado o una solicitud administrativa, abre un caso con nosotros.
                </p>
              </div>
              <a className={styles.ticketBtn} href={`mailto:${SOPORTE_CORREO}?subject=Ticket%20de%20soporte%20—%20UCR%20Connect`}>
                <ITicket /> Enviar un ticket
              </a>
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
