'use client';

// Sección "Proyectos de Graduación" con el MISMO diseño que Matching (coverflow
// + tarjeta cf*). 10 proyectos de distintas escuelas, áreas de interés y tipos
// de apoyo (TFG / Pasantía / Apoyo económico).
//
// NOTA: los proyectos son ejemplos realistas e ilustrativos (no provienen aún de
// una base real). Para conectarlos a datos reales hace falta un endpoint público
// de proyectos en el BE; con esa lista se reemplaza el array PROYECTOS.

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from './icons';
import styles from './landing.module.css';

type TipoApoyo = 'TFG' | 'Pasantía' | 'Apoyo económico';

interface Proyecto {
  proyecto: string; img: string; area: string;
  autor: string; escuela: string;
  apoyo: TipoApoyo; busca: string; buscaDetalle: string;
  inter: boolean;
}

// Color del badge según el tipo de apoyo
const APOYO_COLOR: Record<TipoApoyo, string> = {
  TFG: '#004C63',                 // teal
  'Pasantía': '#007D67',          // esmeralda
  'Apoyo económico': '#F34B26',   // naranja
};

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;

const PROYECTOS: Proyecto[] = [
  { proyecto: 'Med-Link CR', img: IMG('1576091160550-2173dba999ef'), area: 'Salud Digital',
    autor: 'Carlos Torres', escuela: 'Medicina + Computación', apoyo: 'TFG',
    busca: 'Tutor clínico', buscaDetalle: 'Pilotos de telemedicina en EBAIS', inter: true },
  { proyecto: 'AgroSensor Café', img: IMG('1500382017468-9049fed747ef'), area: 'Agrotecnología',
    autor: 'Mariana Vargas', escuela: 'Agronomía + Ing. Eléctrica', apoyo: 'Pasantía',
    busca: 'Host de pasantía', buscaDetalle: 'Sensores IoT en cooperativas de café', inter: true },
  { proyecto: 'SolarComunidad', img: IMG('1509391366360-2e959784a276'), area: 'Energía Renovable',
    autor: 'Diego Mora', escuela: 'Ing. Eléctrica', apoyo: 'TFG',
    busca: 'Mentor técnico', buscaDetalle: 'Micro-redes solares rurales', inter: false },
  { proyecto: 'AquaMonitor', img: IMG('1500375592092-40eb2168fd21'), area: 'Medio Ambiente',
    autor: 'Laura Vega', escuela: 'Ing. Ambiental + Biología', apoyo: 'Apoyo económico',
    busca: 'Comunidad aliada', buscaDetalle: 'Monitoreo de calidad del agua', inter: true },
  { proyecto: 'Casa Trópico', img: IMG('1487958449943-2429e8be8625'), area: 'Arquitectura Sostenible',
    autor: 'Sofía Blanco', escuela: 'Arquitectura', apoyo: 'TFG',
    busca: 'Tutor de diseño', buscaDetalle: 'Vivienda bioclimática costera', inter: false },
  { proyecto: 'BioReef', img: IMG('1532094349884-543bc11b234d'), area: 'Biología Marina',
    autor: 'Andrés Soto', escuela: 'Biología', apoyo: 'Pasantía',
    busca: 'Host de pasantía', buscaDetalle: 'Restauración de arrecifes', inter: false },
  { proyecto: 'Voces UCR', img: IMG('1504384308090-c894fdcc538d'), area: 'Comunicación',
    autor: 'Valeria Núñez', escuela: 'Comunicación Colectiva', apoyo: 'Apoyo económico',
    busca: 'Aliado mediático', buscaDetalle: 'Periodismo comunitario', inter: false },
  { proyecto: 'Fin-Connect', img: IMG('1554224155-6726b3ff858f'), area: 'Educación Financiera',
    autor: 'Ana Rojas', escuela: 'Economía', apoyo: 'TFG',
    busca: 'Mentor fintech', buscaDetalle: 'App de finanzas gamificada', inter: false },
  { proyecto: 'EduRobótica', img: IMG('1485827404703-89b55fcc595e'), area: 'Robótica Educativa',
    autor: 'José Ramírez', escuela: 'Ing. Mecánica + Enseñanza', apoyo: 'Pasantía',
    busca: 'Empresa aliada', buscaDetalle: 'Kits de robótica para escuelas rurales', inter: true },
  { proyecto: 'Bienestar UCR', img: IMG('1573497019940-1c28c88b4f3e'), area: 'Salud Mental',
    autor: 'Daniela Campos', escuela: 'Psicología', apoyo: 'Apoyo económico',
    busca: 'Red de apoyo', buscaDetalle: 'Acompañamiento estudiantil', inter: false },
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
            Iniciativas de nuestros graduados de distintas escuelas y áreas, que buscan
            apoyo en formato TFG, pasantía o apoyo económico. Conectá con el proyecto que te inspire.
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
                    <span className={styles.cfTag}>{p.area}</span>
                    <span className={styles.cfApoyo} style={{ ['--apoyo']: APOYO_COLOR[p.apoyo] } as React.CSSProperties}>{p.apoyo}</span>
                    {p.inter && <span className={styles.cfInter}>★ Interdisciplinario</span>}
                  </div>

                  <div className={styles.cfBody}>
                    <h3 className={styles.cfTitle}>{p.proyecto}</h3>
                    <div className={styles.cfMatch}>
                      <div className={styles.cfPerson}>
                        <span className={`${styles.cfAvatar} ${styles.cfAvatarEst}`}>{ini(p.autor)}</span>
                        <span className={styles.cfPersonInfo}>{p.autor}<small>{p.escuela}</small></span>
                      </div>
                      <span className={styles.cfLink} aria-hidden>↔</span>
                      <div className={styles.cfPerson}>
                        <span className={styles.cfAvatar} style={{ background: APOYO_COLOR[p.apoyo] }}>{p.apoyo[0]}</span>
                        <span className={styles.cfPersonInfo}>{p.busca}<small>{p.buscaDetalle}</small></span>
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
