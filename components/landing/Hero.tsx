'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import styles from './landing.module.css';

const MotionLink = motion(Link);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

// Íconos minimalistas (línea) para el control de sonido.
const VolOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);
const VolOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </svg>
);

const VOL_OBJETIVO = 0.55; // volumen final (no invasivo)
const CRESCENDO_MS = 5000; // "inicio en aumento progresivo"

export default function Hero() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const [sonido, setSonido] = useState(false);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // Rampa de volumen (easeOutCubic) para un crescendo emocional y suave.
  const rampa = (a: HTMLAudioElement, desde: number, hasta: number, ms: number, alFinal?: () => void) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const t0 = performance.now();
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      a.volume = Math.max(0, Math.min(1, desde + (hasta - desde) * e));
      if (k < 1) rafRef.current = requestAnimationFrame(paso);
      else alFinal?.();
    };
    rafRef.current = requestAnimationFrame(paso);
  };

  const toggleSonido = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (!sonido) {
      a.muted = false;
      a.volume = 0;
      try { await a.play(); } catch { /* sin archivo / bloqueado */ }
      rampa(a, 0, VOL_OBJETIVO, CRESCENDO_MS); // arranca bajo y sube progresivamente
      setSonido(true);
    } else {
      rampa(a, a.volume, 0, 600, () => { a.muted = true; });
      setSonido(false);
    }
  };

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

      {/* Pista de sonido del hero (silenciada hasta que el visitante la active). */}
      <audio ref={audioRef} src="/audio/hero-ambiente.mp3" loop preload="auto" />

      <div className={styles.heroBlob1} aria-hidden />
      <div className={styles.heroBlob2} aria-hidden />
      <div className={styles.heroBlob3} aria-hidden />
      <div className={styles.heroOverlay} aria-hidden />

      {/* Control de sonido: discreto, minimalista; pulsa suave cuando está en silencio. */}
      <button
        type="button"
        onClick={toggleSonido}
        className={`${styles.heroSoundBtn} ${!sonido ? styles.heroSoundPulse : ''}`}
        aria-pressed={sonido}
        aria-label={sonido ? 'Silenciar sonido' : 'Activar sonido'}
        title={sonido ? 'Silenciar' : 'Activar sonido'}
      >
        {sonido ? <VolOn /> : <VolOff />}
      </button>

      <div className={styles.container}>
        <div className={styles.heroContent}>
          <motion.div
            data-anim="hero-text"
            className={styles.heroTextContent}
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
          >
            <motion.h1
              className={`${styles.heroTitle} ${styles.headlineLg}`}
              variants={fadeUp}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            >
              Conectando <span className={styles.heroTitleHighlight}>Talento</span> con Experiencia
            </motion.h1>

            <motion.p
              className={styles.heroText}
              variants={fadeUp}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            >
              La plataforma definitiva para la comunidad Alumni UCR. Potenciamos tu
              crecimiento profesional mediante conexiones estratégicas: empleo,
              mentorías y proyectos con impacto.
            </motion.p>

            <motion.div
              className={styles.heroActions}
              variants={fadeUp}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            >
              <MotionLink
                href="/registro"
                className={`${styles.btn} ${styles.btnPrimary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Empezar ahora
              </MotionLink>
              <motion.a
                href="#proyectos"
                className={`${styles.btn} ${styles.btnOutline}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Ver proyectos
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
