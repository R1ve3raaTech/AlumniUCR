'use client';

// Sección del landing: Matching estudiantes ↔ exalumnos, en formato CARRUSEL
// "coverflow" (efecto volante): la tarjeta central protagoniza y crece, las de
// los lados asoman giradas e invitan a explorar. Tarjetas verticales con imagen
// del proyecto. Al hacer clic en una lateral, gira al centro con animación.
//
// NOTA: las imágenes son placeholders (proyectos demo). Para cambiarlas por las
// reales, editá el campo `img` de cada match en MATCHES (apunta a /public/images).

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from './icons';
import styles from './landing.module.css';

interface Match {
  proyecto: string; img: string; tag: string;
  est: string; estCarrera: string;
  mentor: string; mentorEmpresa: string;
  score: number; inter: boolean;
}

const MATCHES: Match[] = [
  { proyecto: 'Sistema Eco-Data', img: '/images/ecodata.jpg', tag: 'Sostenibilidad',
    est: 'María Jiménez', estCarrera: 'Computación', mentor: 'Roberto Soto', mentorEmpresa: 'TechCR', score: 85, inter: false },
  { proyecto: 'Med-Link UCR', img: '/images/MEDLINK.png', tag: 'Salud Digital',
    est: 'Carlos Torres', estCarrera: 'Psicología', mentor: 'Esteban Murillo', mentorEmpresa: 'Bienestar Digital', score: 92, inter: true },
  { proyecto: 'Fin-Connect', img: '/images/finconnect.jpg', tag: 'Finanzas',
    est: 'Ana Rojas', estCarrera: 'Economía', mentor: 'Mariana Castro', mentorEmpresa: 'AgroTech', score: 78, inter: false },
];

const ini = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function MatchingSeccion() {
  const n = MATCHES.length;
  const [activo, setActivo] = useState(1); // arranca en la central

  const ir = (dir: number) => setActivo((a) => (a + dir + n) % n);

  // Posición/transform de cada tarjeta según su distancia (circular) al centro.
  const estiloCard = (i: number): React.CSSProperties => {
    let off = i - activo;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    const abs = Math.abs(off);
    const dir = off >= 0 ? 1 : -1;
    if (abs === 0) {
      return { transform: 'translateX(-50%) scale(1) rotateY(0deg)', opacity: 1, zIndex: 30 };
    }
    if (abs === 1) {
      return {
        transform: `translateX(calc(-50% + ${dir * 66}%)) scale(0.8) rotateY(${-dir * 24}deg)`,
        opacity: 0.9, zIndex: 20,
      };
    }
    return {
      transform: `translateX(calc(-50% + ${dir * 115}%)) scale(0.62) rotateY(${-dir * 30}deg)`,
      opacity: 0, zIndex: 10, pointerEvents: 'none',
    };
  };

  return (
    <section id="matching" className={`${styles.section} ${styles.sectionGray}`}>
      <div className={styles.container}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div>
            <h2 className={`${styles.sectionTitle} ${styles.headlineLg}`}>
              Matching <em>Inteligente</em>
            </h2>
            <div className={styles.accentBar} />
            <p className={styles.matchSubtitle}>
              Conectamos a cada estudiante con el mentor ideal según su carrera, áreas de
              interés, sector y tipo de apoyo. Explorá las coincidencias.
            </p>
          </div>
        </motion.div>

        {/* Carrusel coverflow */}
        <div className={styles.coverflow}>
          <button type="button" className={`${styles.cfArrow} ${styles.cfArrowLeft}`} onClick={() => ir(-1)} aria-label="Anterior">
            <ArrowLeft />
          </button>

          <div className={styles.cfStage}>
            {MATCHES.map((m, i) => {
              const esActivo = i === activo;
              return (
                <article
                  key={m.proyecto}
                  className={`${styles.cfCard} ${esActivo ? styles.cfCardActive : ''}`}
                  style={estiloCard(i)}
                  onClick={() => !esActivo && setActivo(i)}
                  aria-hidden={!esActivo}
                >
                  <div className={styles.cfImgWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.cfImg} src={m.img} alt={m.proyecto} loading="lazy" />
                    <span className={styles.cfTag}>{m.tag}</span>
                    <span className={styles.cfScore}>{m.score}<small>%</small></span>
                    {m.inter && <span className={styles.cfInter}>★ Interdisciplinario</span>}
                  </div>

                  <div className={styles.cfBody}>
                    <h3 className={styles.cfTitle}>{m.proyecto}</h3>
                    <div className={styles.cfMatch}>
                      <div className={styles.cfPerson}>
                        <span className={`${styles.cfAvatar} ${styles.cfAvatarEst}`}>{ini(m.est)}</span>
                        <span className={styles.cfPersonInfo}>{m.est}<small>{m.estCarrera}</small></span>
                      </div>
                      <span className={styles.cfLink} aria-hidden>↔</span>
                      <div className={styles.cfPerson}>
                        <span className={`${styles.cfAvatar} ${styles.cfAvatarMentor}`}>{ini(m.mentor)}</span>
                        <span className={styles.cfPersonInfo}>{m.mentor}<small>{m.mentorEmpresa}</small></span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <button type="button" className={`${styles.cfArrow} ${styles.cfArrowRight}`} onClick={() => ir(1)} aria-label="Siguiente">
            <ArrowRight />
          </button>
        </div>

        {/* Dots */}
        <div className={styles.dots}>
          {MATCHES.map((m, i) => (
            <button
              key={m.proyecto}
              type="button"
              className={`${styles.dot} ${i === activo ? styles.dotActive : ''}`}
              onClick={() => setActivo(i)}
              aria-label={`Ver match ${i + 1}`}
            />
          ))}
        </div>

        {/* Criterios del score */}
        <motion.div
          className={styles.matchCriterios}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className={styles.matchCriteriosTitle}>¿Cómo se calcula?</span>
          <span className={styles.matchCriterio}>Misma carrera <strong>30</strong></span>
          <span className={styles.matchCriterio}>Áreas en común <strong>30</strong></span>
          <span className={styles.matchCriterio}>Sector ↔ área <strong>20</strong></span>
          <span className={styles.matchCriterio}>Tipo de apoyo <strong>20</strong></span>
        </motion.div>

        <div className={styles.matchCtaWrap}>
          <Link href="/registro" className={styles.matchCta}>
            Encontrá tu match <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
