'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './landing.module.css';

const MotionLink = motion(Link);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // El video de fondo solo se reproduce mientras el hero está en pantalla:
  // decodificar video durante todo el scroll era una de las causas de que la
  // página se sintiera trabada.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section id="inicio" className={styles.hero}>
      <video
        ref={videoRef}
        className={styles.heroBgVideo}
        src="/images/UCR.mp4"
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
              Conectando{' '}
              <span className={styles.wordHighlightWrap} data-anim-word="talento">
                <span className={styles.wordHighlightBar} data-anim-bar="talento" aria-hidden />
                <span className={`${styles.heroTitleHighlight} ${styles.wordHighlightText}`} data-anim-wtext="talento">Talento</span>
              </span>
              {' '}con{' '}
              <span className={styles.wordHighlightWrap} data-anim-word="experiencia">
                <span className={styles.wordHighlightBar} data-anim-bar="experiencia" aria-hidden />
                <span className={styles.wordHighlightText} data-anim-wtext="experiencia">Experiencia</span>
              </span>
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
