'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { startHeroCanvas } from '@/lib/animations/heroCanvas';
import styles from './landing.module.css';

/**
 * Hero del landing. Combina:
 *  - la malla 3D animada en canvas (efecto del diseño),
 *  - el contenido (badge, título, texto, acciones) y una imagen lateral.
 * El canvas se monta solo en cliente y se limpia al desmontar.
 */
export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const stop = startHeroCanvas(canvasRef.current);
    return stop;
  }, []);

  return (
    <section id="inicio" className={styles.hero}>
      <canvas ref={canvasRef} className={styles.heroCanvas} aria-hidden />
      <div className={styles.heroOverlay} aria-hidden />

      <div className={styles.container}>
        <div className={styles.heroContent}>
          <div data-anim="hero-text">
            <span className={styles.heroBadge}>RED PROFESIONAL EXCLUSIVA</span>
            <h1 className={`${styles.heroTitle} ${styles.headlineLg}`}>
              Conectando <em>Talento</em> con Experiencia
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

          <div className={styles.heroImageWrap} data-anim="hero-image">
            <span className={styles.halftoneDense} style={{ position: 'absolute', inset: 0 }} aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.heroImage}
              src="/images/campus.png"
              alt="Comunidad de egresados de la UCR"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
