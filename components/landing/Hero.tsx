import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

/** Flor/girasol de la marca (decoración). */
function Flower() {
  const petals = Array.from({ length: 12 });
  return (
    <svg className={`${styles.shape} ${styles.shapeFlower}`} viewBox="0 0 100 100" data-anim="shape" aria-hidden>
      {petals.map((_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="20"
          rx="6"
          ry="16"
          fill="currentColor"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="12" fill="currentColor" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="inicio" className={styles.hero} data-anim="hero">
      {/* Video de fondo UCR */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.45, // Mayor opacidad para que el video resalte más sobre el fondo azul
          pointerEvents: 'none',
        }}
      >
        <source src="/images/ucr-trabajo.mp4" type="video/mp4" />
      </video>

      <Flower />
      <span className={`${styles.shape} ${styles.shapeBlock}`} data-anim="shape" aria-hidden />

      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div data-anim="hero-text">
            <span className={`${styles.eyebrow} ${styles.heroEyebrow}`}>
              Red de talento UCR
            </span>
            <h1 className={styles.heroTitle}>
              Conectando el pasado y el <em>futuro</em> de la UCR
            </h1>
            <p className={styles.heroText}>
              UCR Connect impulsa a los estudiantes y egresados de la Universidad de
              Costa Rica a través de ofertas de empleo de exalumnos y colaboradores,
              donaciones y mentorías que abren nuevas oportunidades.
            </p>
            <div className={styles.heroActions}>
              <Link href="/registro" className={styles.btnPrimary} data-anim="magnetic">
                Únete ahora
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </Link>
              <a href="#servicios" className={styles.btnGhost} data-anim="magnetic">
                Ver servicios
              </a>
            </div>
          </div>

          {/* Composición visual de tarjetas (estilo del diseño de referencia) */}
          <div className={styles.heroVisual} data-anim="tilt-container" style={{ perspective: '1200px' }}>
            <div className={`${styles.heroCard} ${styles.heroCard1}`} data-anim="hero-card">
              Empleo
            </div>
            <div className={`${styles.heroCard} ${styles.heroCard2}`} data-anim="hero-card">
              Mentoría
            </div>
            <div className={`${styles.heroCard} ${styles.heroCard3}`} data-anim="hero-card">
              Donaciones
            </div>
            <div className={`${styles.heroCard} ${styles.heroCard4}`} data-anim="hero-card">
              Eventos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
