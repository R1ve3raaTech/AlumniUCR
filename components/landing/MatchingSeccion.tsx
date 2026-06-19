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
  { proyecto: 'AquaSensor UCR', img: '/images/ecosistema-ucr.png', tag: 'Medio Ambiente',
    est: 'Laura Vega', estCarrera: 'Ing. Ambiental', mentor: 'Roberto Soto', mentorEmpresa: 'TechCR', score: 88, inter: true },
  { proyecto: 'EduRobótica', img: '/images/estudiantes.jpg', tag: 'Educación',
    est: 'Diego Mora', estCarrera: 'Enseñanza', mentor: 'Mariana Castro', mentorEmpresa: 'AgroTech', score: 74, inter: false },
  { proyecto: 'Cultura Viva', img: '/images/charla.jpg', tag: 'Arte y Cultura',
    est: 'Sofía Blanco', estCarrera: 'Artes Plásticas', mentor: 'Esteban Murillo', mentorEmpresa: 'Bienestar Digital', score: 81, inter: true },
];

const ini = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function MatchingSeccion() {
  const n = MATCHES.length;
  const [activo, setActivo] = useState(1); // arranca en la central

  const ir = (dir: number) => setActivo((a) => (a + dir + n) % n);

  // Posición/transform 3D de cada tarjeta según su distancia (circular) al centro.
  // Se muestran el centro + 2 a cada lado, con profundidad (translateZ) para dar
  // volumen tipo "coverflow". Más allá quedan ocultas.
  const estiloCard = (i: number): React.CSSProperties => {
    let off = i - activo;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    const abs = Math.abs(off);
    const dir = off >= 0 ? 1 : -1;
    if (abs === 0) {
      return { transform: 'translateX(-50%) translateZ(90px) scale(1) rotateY(0deg)', opacity: 1, zIndex: 30 };
    }
    if (abs === 1) {
      return {
        transform: `translateX(calc(-50% + ${dir * 56}%)) translateZ(-170px) rotateY(${-dir * 46}deg) scale(0.84)`,
        opacity: 0.95, zIndex: 20,
      };
    }
    if (abs === 2) {
      return {
        transform: `translateX(calc(-50% + ${dir * 98}%)) translateZ(-440px) rotateY(${-dir * 54}deg) scale(0.64)`,
        opacity: 0.5, zIndex: 10,
      };
    }
    return {
      transform: `translateX(calc(-50% + ${dir * 125}%)) translateZ(-600px) rotateY(${-dir * 58}deg) scale(0.48)`,
      opacity: 0, zIndex: 5, pointerEvents: 'none',
    };
  };

  return (
    <section id="matching" className={`${styles.section} ${styles.sectionGray}`}>
      <div className={styles.container}>
        <motion.div
          className={styles.matchHeader}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className={`${styles.sectionTitle} ${styles.headlineLg}`}>
            Matching <em>Inteligente</em>
          </h2>
          <div className={styles.accentBar} />
          <p className={styles.matchSubtitle}>
            Conectamos a cada estudiante con el mentor ideal según su carrera, áreas de
            interés, sector y tipo de apoyo. Explorá las coincidencias.
          </p>
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

        <motion.div
          className={styles.matchCtaWrap}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Link href="/registro" className={styles.matchCta}>
            Encontrá tu match <ArrowRight />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
