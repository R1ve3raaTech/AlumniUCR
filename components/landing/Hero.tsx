'use client';

import Link from 'next/link';
import styles from './landing.module.css';

/**
 * Hero del landing. Combina:
 *  - la malla 3D animada en canvas (efecto del diseño),
 *  - el contenido (badge, título, texto, acciones) y una imagen lateral.
 * El canvas se monta solo en cliente y se limpia al desmontar.
 */
export default function Hero() {
  return (
    <section id="inicio" className={styles.hero}>
      <video
        className={styles.heroBgVideo}
        src="/images/video-ucr.mp4"
        autoPlay
        loop
        muted
        playsInline
        data-anim="hero-bg-video"
      />
      <div className={styles.heroBlob1} aria-hidden />
      <div className={styles.heroBlob2} aria-hidden />
      <div className={styles.heroBlob3} aria-hidden />
      <div className={styles.heroOverlay} aria-hidden />

      <div className={styles.container}>
        <div className={styles.heroContent}>
          <div data-anim="hero-text" className={styles.heroTextContent}>
            <h1 className={`${styles.heroTitle} ${styles.headlineLg}`}>
              Conectando <span className={styles.heroTitleHighlight}>Talento</span> con Experiencia
            </h1>
            <p className={styles.heroText}>
              La plataforma definitiva para la comunidad Alumni UCR. Potenciamos tu
              crecimiento profesional mediante conexiones estratégicas: empleo,
              mentorías y proyectos con impacto.
            </p>
            <div className={styles.heroActions}>
              <Link href="/registro" className={`${styles.btn} ${styles.btnPrimary}`}>
                Empezar ahora
              </Link>
              <a href="#proyectos" className={`${styles.btn} ${styles.btnOutline}`}>
                Ver proyectos
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
