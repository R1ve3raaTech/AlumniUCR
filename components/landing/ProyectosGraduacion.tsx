'use client';

// Sección "Proyectos de Graduación" con el MISMO diseño que Matching (coverflow
// + tarjeta cf*). 10 proyectos de distintas escuelas, áreas de interés y tipos
// de apoyo (TFG / Pasantía / Apoyo económico).
//
// NOTA: los proyectos son ejemplos realistas e ilustrativos (no provienen aún de
// una base real). Para conectarlos a datos reales hace falta un endpoint público
// de proyectos en el BE; con esa lista se reemplaza el array PROYECTOS.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from './icons';
import styles from './landing.module.css';

type TipoApoyo = 'TFG' | 'Pasantía' | 'Apoyo económico';

interface Proyecto {
  proyecto: string; img: string; area: string; desc: string;
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

const IMG = (id: string) => `/images/unsplash/${id}.jpg`;

const PROYECTOS: Proyecto[] = [
  { proyecto: 'Med-Link CR', img: IMG('1576091160550-2173dba999ef'), area: 'Salud Digital',
    desc: 'Telemedicina para zonas rurales: conecta pacientes con especialistas por videollamada y un expediente digital compartido.',
    autor: 'Carlos Torres', escuela: 'Medicina + Computación', apoyo: 'TFG',
    busca: 'Tutor clínico', buscaDetalle: 'Pilotos en EBAIS', inter: true },
  { proyecto: 'AgroSensor Café', img: IMG('1500382017468-9049fed747ef'), area: 'Agrotecnología',
    desc: 'Sensores IoT que miden humedad y nutrientes del cafetal en tiempo real para optimizar la cosecha de pequeños productores.',
    autor: 'Mariana Vargas', escuela: 'Agronomía + Ing. Eléctrica', apoyo: 'Pasantía',
    busca: 'Host de pasantía', buscaDetalle: 'Cooperativas de café', inter: true },
  { proyecto: 'SolarComunidad', img: IMG('1509391366360-2e959784a276'), area: 'Energía Renovable',
    desc: 'Micro-redes solares con baterías compartidas para llevar energía limpia y estable a caseríos sin acceso a la red eléctrica.',
    autor: 'Diego Mora', escuela: 'Ing. Eléctrica', apoyo: 'TFG',
    busca: 'Mentor técnico', buscaDetalle: 'Micro-redes rurales', inter: false },
  { proyecto: 'AquaMonitor', img: IMG('1500375592092-40eb2168fd21'), area: 'Medio Ambiente',
    desc: 'Estaciones de bajo costo que miden la calidad del agua en cuencas y alertan a las comunidades ante contaminación.',
    autor: 'Laura Vega', escuela: 'Ing. Ambiental + Biología', apoyo: 'Apoyo económico',
    busca: 'Comunidad aliada', buscaDetalle: 'Cuencas hidrográficas', inter: true },
  { proyecto: 'Casa Trópico', img: IMG('1487958449943-2429e8be8625'), area: 'Arquitectura Sostenible',
    desc: 'Vivienda bioclimática para el trópico húmedo: ventilación pasiva y materiales locales para reducir el aire acondicionado.',
    autor: 'Sofía Blanco', escuela: 'Arquitectura', apoyo: 'TFG',
    busca: 'Tutor de diseño', buscaDetalle: 'Zona costera', inter: false },
  { proyecto: 'BioReef', img: IMG('1532094349884-543bc11b234d'), area: 'Biología Marina',
    desc: 'Vivero de corales y técnicas de trasplante para restaurar arrecifes degradados del Pacífico costarricense.',
    autor: 'Andrés Soto', escuela: 'Biología', apoyo: 'Pasantía',
    busca: 'Host de pasantía', buscaDetalle: 'Pacífico Sur', inter: false },
  { proyecto: 'Voces UCR', img: IMG('1504384308090-c894fdcc538d'), area: 'Comunicación',
    desc: 'Plataforma de periodismo comunitario donde los vecinos publican y verifican noticias locales con acompañamiento estudiantil.',
    autor: 'Valeria Núñez', escuela: 'Comunicación Colectiva', apoyo: 'Apoyo económico',
    busca: 'Aliado mediático', buscaDetalle: 'Medios locales', inter: false },
  { proyecto: 'Fin-Connect', img: IMG('1554224155-6726b3ff858f'), area: 'Educación Financiera',
    desc: 'App gamificada que enseña ahorro, crédito e inversión a jóvenes mediante retos y metas personalizadas.',
    autor: 'Ana Rojas', escuela: 'Economía', apoyo: 'TFG',
    busca: 'Mentor fintech', buscaDetalle: 'Producto digital', inter: false },
  { proyecto: 'EduRobótica', img: IMG('1485827404703-89b55fcc595e'), area: 'Robótica Educativa',
    desc: 'Kits de robótica de bajo costo y guías docentes para acercar la programación a escuelas rurales del país.',
    autor: 'José Ramírez', escuela: 'Ing. Mecánica + Enseñanza', apoyo: 'Pasantía',
    busca: 'Empresa aliada', buscaDetalle: 'Escuelas rurales', inter: true },
  { proyecto: 'Bienestar UCR', img: IMG('1573497019940-1c28c88b4f3e'), area: 'Salud Mental',
    desc: 'Red de acompañamiento psicológico estudiantil con citas, recursos y seguimiento para cuidar la salud mental en la U.',
    autor: 'Daniela Campos', escuela: 'Psicología', apoyo: 'Apoyo económico',
    busca: 'Red de apoyo', buscaDetalle: 'Vida estudiantil', inter: false },
];

const ini = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function ProyectosGraduacion() {
  const n = PROYECTOS.length;
  const [activo, setActivo] = useState(1);
  const [pausa, setPausa] = useState(false);

  const ir = (dir: number) => setActivo((a) => (a + dir + n) % n);

  // Auto-avance: cambia una tarjeta cada 4 s. Se pausa al pasar el mouse y
  // respeta prefers-reduced-motion.
  useEffect(() => {
    if (pausa) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActivo((a) => (a + 1) % n), 4000);
    return () => clearInterval(id);
  }, [pausa, n]);

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
        transform: `translateX(calc(-50% + ${dir * 68}%)) translateZ(-170px) rotateY(${-dir * 44}deg) scale(0.84)`,
        opacity: 0.95, zIndex: 20,
      };
    }
    if (abs === 2) {
      return {
        transform: `translateX(calc(-50% + ${dir * 116}%)) translateZ(-440px) rotateY(${-dir * 52}deg) scale(0.64)`,
        opacity: 0.6, zIndex: 10,
      };
    }
    if (abs === 3) {
      return {
        transform: `translateX(calc(-50% + ${dir * 140}%)) translateZ(-560px) rotateY(${-dir * 56}deg) scale(0.54)`,
        opacity: 0.42, zIndex: 8,
      };
    }
    if (abs === 4) {
      return {
        transform: `translateX(calc(-50% + ${dir * 160}%)) translateZ(-700px) rotateY(${-dir * 59}deg) scale(0.44)`,
        opacity: 0.24, zIndex: 6,
      };
    }
    return {
      transform: `translateX(calc(-50% + ${dir * 178}%)) translateZ(-820px) rotateY(${-dir * 62}deg) scale(0.36)`,
      opacity: 0, zIndex: 4, pointerEvents: 'none',
    };
  };

  return (
    <section id="graduacion" className={`${styles.section} ${styles.sectionGray} ${styles.gradSection}`}>
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
        <div
          className={styles.coverflow}
          onMouseEnter={() => setPausa(true)}
          onMouseLeave={() => setPausa(false)}
        >
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
                    <p className={styles.cfDesc}>{p.desc}</p>
                    <div className={styles.cfMatch} style={{ marginTop: 'auto' }}>
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
