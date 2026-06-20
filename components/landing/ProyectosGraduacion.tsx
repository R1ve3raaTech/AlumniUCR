'use client';

// Sección "Proyectos de Graduación" con el MISMO diseño que Matching: carrusel
// coverflow (efecto volante) y la misma tarjeta (cf*). Cada tarjeta muestra el
// proyecto, su autor/a graduado/a y qué busca (mentoría o inversión).

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from './icons';
import styles from './landing.module.css';

interface Proyecto {
  proyecto: string; img: string; tag: string;
  autor: string; autorCarrera: string;
  busca: string; buscaDetalle: string;
  inter: boolean;
}

const PROYECTOS: Proyecto[] = [
  { proyecto: 'Sistema Eco-Data', img: '/images/ecodata.jpg', tag: 'Sostenibilidad',
    autor: 'María Jiménez', autorCarrera: 'Computación', busca: 'Mentoría', buscaDetalle: 'Escalar a pymes', inter: false },
  { proyecto: 'Med-Link UCR', img: '/images/MEDLINK.png', tag: 'Salud Digital',
    autor: 'Carlos Torres', autorCarrera: 'Psicología', busca: 'Inversión', buscaDetalle: 'Telemedicina rural', inter: true },
  { proyecto: 'Fin-Connect', img: '/images/finconnect.jpg', tag: 'Finanzas',
    autor: 'Ana Rojas', autorCarrera: 'Economía', busca: 'Mentoría', buscaDetalle: 'Educación financiera', inter: false },
  { proyecto: 'AquaSensor UCR', img: '/images/ecosistema-ucr.png', tag: 'Medio Ambiente',
    autor: 'Laura Vega', autorCarrera: 'Ing. Ambiental', busca: 'Inversión', buscaDetalle: 'Monitoreo de agua', inter: true },
  { proyecto: 'EduRobótica', img: '/images/estudiantes.jpg', tag: 'Educación',
    autor: 'Diego Mora', autorCarrera: 'Enseñanza', busca: 'Mentoría', buscaDetalle: 'Robótica educativa', inter: false },
  { proyecto: 'Cultura Viva', img: '/images/charla.jpg', tag: 'Arte y Cultura',
    autor: 'Sofía Blanco', autorCarrera: 'Artes Plásticas', busca: 'Inversión', buscaDetalle: 'Plataforma cultural', inter: true },
];

const ini = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function ProyectosGraduacion() {
  const n = PROYECTOS.length;
  const [activo, setActivo] = useState(1);

  const ir = (dir: number) => setActivo((a) => (a + dir + n) % n);

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
    <section id="graduacion" className={`${styles.section} ${styles.sectionGray}`}>
      <div className={styles.container}>
        <motion.div
          className={styles.matchHeader}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className={`${styles.sectionTitle} ${styles.headlineLg}`}>
            Proyectos de <em>Graduación</em>
          </h2>
          <div className={styles.accentBar} />
          <p className={styles.matchSubtitle}>
            Las iniciativas más brillantes de nuestros recién graduados que buscan
            mentoría o inversión. Conectá con el proyecto que te inspire.
          </p>
        </motion.div>

        {/* Carrusel coverflow (mismo diseño que Matching) */}
        <div className={styles.coverflow}>
          <button type="button" className={`${styles.cfArrow} ${styles.cfArrowLeft}`} onClick={() => ir(-1)} aria-label="Anterior">
            <ArrowLeft />
          </button>

          <div className={styles.cfStage}>
            {PROYECTOS.map((p, i) => {
              const esActivo = i === activo;
              return (
                <article
                  key={p.proyecto}
                  className={`${styles.cfCard} ${esActivo ? styles.cfCardActive : ''}`}
                  style={estiloCard(i)}
                  onClick={() => !esActivo && setActivo(i)}
                  aria-hidden={!esActivo}
                >
                  <div className={styles.cfImgWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.cfImg} src={p.img} alt={p.proyecto} loading="lazy" />
                    <span className={styles.cfTag}>{p.tag}</span>
                    {p.inter && <span className={styles.cfInter}>★ Interdisciplinario</span>}
                  </div>

                  <div className={styles.cfBody}>
                    <h3 className={styles.cfTitle}>{p.proyecto}</h3>
                    <div className={styles.cfMatch}>
                      <div className={styles.cfPerson}>
                        <span className={`${styles.cfAvatar} ${styles.cfAvatarEst}`}>{ini(p.autor)}</span>
                        <span className={styles.cfPersonInfo}>{p.autor}<small>{p.autorCarrera}</small></span>
                      </div>
                      <span className={styles.cfLink} aria-hidden>↔</span>
                      <div className={styles.cfPerson}>
                        <span className={`${styles.cfAvatar} ${styles.cfAvatarMentor}`}>{p.busca[0]}</span>
                        <span className={styles.cfPersonInfo}>Busca {p.busca}<small>{p.buscaDetalle}</small></span>
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
          {PROYECTOS.map((p, i) => (
            <button
              key={p.proyecto}
              type="button"
              className={`${styles.dot} ${i === activo ? styles.dotActive : ''}`}
              onClick={() => setActivo(i)}
              aria-label={`Ver proyecto ${i + 1}`}
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
            Conectar con proyectos <ArrowRight />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
