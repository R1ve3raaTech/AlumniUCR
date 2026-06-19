'use client';

// Sección del landing: Matching entre estudiantes y exalumnos (reemplaza a
// "Proyectos Destacados"). Explica el corazón de UCR Connect: el algoritmo que
// conecta a cada estudiante con el mentor ideal según carrera, áreas, sector y
// tipo de apoyo. Muestra ejemplos de match con su % de compatibilidad.

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from './icons';
import styles from './landing.module.css';

const MATCHES = [
  {
    est: { nombre: 'María Jiménez', carrera: 'Computación e Informática' },
    mentor: { nombre: 'Roberto Soto', empresa: 'TechCR' },
    score: 85, area: 'Tecnología e Innovación', inter: false,
  },
  {
    est: { nombre: 'Carlos Torres', carrera: 'Psicología' },
    mentor: { nombre: 'Esteban Murillo', empresa: 'Bienestar Digital' },
    score: 78, area: 'Salud y Bienestar', inter: false,
  },
  {
    est: { nombre: 'Ana Rojas', carrera: 'Agronomía' },
    mentor: { nombre: 'Mariana Castro', empresa: 'AgroTech CR' },
    score: 92, area: 'Agro + Datos', inter: true,
  },
];

const CRITERIOS = [
  { label: 'Misma carrera', pts: 30 },
  { label: 'Áreas en común', pts: 30 },
  { label: 'Sector ↔ área', pts: 20 },
  { label: 'Tipo de apoyo', pts: 20 },
];

const ini = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function MatchingSeccion() {
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
              interés, sector y tipo de apoyo. Así nacen las mejores mentorías.
            </p>
          </div>
        </motion.div>

        {/* Ejemplos de match */}
        <div className={styles.matchGrid}>
          {MATCHES.map((m, i) => (
            <motion.article
              key={m.est.nombre}
              className={styles.matchCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className={styles.matchRow}>
                <div className={styles.matchPerson}>
                  <span className={`${styles.matchAvatar} ${styles.matchAvatarEst}`}>{ini(m.est.nombre)}</span>
                  <span className={styles.matchName}>{m.est.nombre}</span>
                  <span className={styles.matchRole}>{m.est.carrera}</span>
                </div>

                <div className={styles.matchConnector}>
                  <span className={styles.matchLine} aria-hidden />
                  <motion.span
                    className={styles.matchScore}
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.12 + 0.2, ease: 'backOut' }}
                  >
                    {m.score}<small>%</small>
                  </motion.span>
                  <span className={styles.matchScoreLbl}>compatible</span>
                </div>

                <div className={styles.matchPerson}>
                  <span className={`${styles.matchAvatar} ${styles.matchAvatarMentor}`}>{ini(m.mentor.nombre)}</span>
                  <span className={styles.matchName}>{m.mentor.nombre}</span>
                  <span className={styles.matchRole}>{m.mentor.empresa}</span>
                </div>
              </div>

              <div className={styles.matchFoot}>
                <span className={styles.matchArea}>{m.area}</span>
                {m.inter && <span className={styles.matchInter}>★ Interdisciplinario</span>}
              </div>
            </motion.article>
          ))}
        </div>

        {/* Cómo se calcula la compatibilidad */}
        <motion.div
          className={styles.matchCriterios}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className={styles.matchCriteriosTitle}>¿Cómo se calcula?</span>
          {CRITERIOS.map((c) => (
            <span key={c.label} className={styles.matchCriterio}>
              {c.label} <strong>{c.pts}</strong>
            </span>
          ))}
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
