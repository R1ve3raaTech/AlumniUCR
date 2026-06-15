'use client';

import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowTrend } from './icons';
import styles from './landing.module.css';

const PROYECTOS = [
  {
    tag: 'Sostenibilidad',
    titulo: 'Sistema Eco-Data',
    texto:
      'Optimización de recursos energéticos mediante IA para pymes locales, reduciendo costos operativos en un 30%.',
    img: '/images/ecodata.jpg',
  },
  {
    tag: 'Salud Digital',
    titulo: 'Med-Link UCR',
    texto:
      'Plataforma de telemedicina para comunidades rurales, conectando especialistas con pacientes remotos.',
    img: '/images/MEDLINK.png',
  },
  {
    tag: 'Finanzas',
    titulo: 'Fin-Connect',
    texto: 'Herramienta de educación financiera gamificada para jóvenes adultos.',
    img: '/images/finconnect.jpg',
  },
];

export default function ProyectosDestacados() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);

  const desplazar = (dir: number) => {
    const track = trackRef.current;
    if (!track) return;
    const primera = track.querySelector<HTMLElement>(`.${styles.slide}`);
    const ancho = (primera?.offsetWidth ?? track.clientWidth) + 32; // +gap
    track.scrollBy({ left: dir * ancho, behavior: 'smooth' });
  };

  const irA = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    track.scrollTo({ left: (i / (PROYECTOS.length - 1)) * max, behavior: 'smooth' });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth || 1;
    const idx = Math.round((track.scrollLeft / max) * (PROYECTOS.length - 1));
    setActivo(idx);
  };

  return (
    <section id="proyectos" className={`${styles.section} ${styles.sectionGray}`}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={`${styles.sectionTitle} ${styles.headlineLg}`}>
              Proyectos <em>Destacados</em>
            </h2>
            <div className={styles.accentBar} />
          </div>
          <div className={styles.sliderControls}>
            <button
              type="button"
              className={styles.sliderBtn}
              onClick={() => desplazar(-1)}
              aria-label="Anterior"
            >
              <ArrowLeft />
            </button>
            <button
              type="button"
              className={styles.sliderBtn}
              onClick={() => desplazar(1)}
              aria-label="Siguiente"
            >
              <ArrowRight />
            </button>
          </div>
        </div>

        <div className={styles.sliderViewport}>
          <div ref={trackRef} className={styles.sliderTrack} onScroll={onScroll}>
            {PROYECTOS.map((p) => (
              <div key={p.titulo} className={styles.slide}>
                <article className={styles.slideCard}>
                  <div className={styles.slideImageWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.slideImage} src={p.img} alt={p.titulo} loading="lazy" />
                  </div>
                  <div className={styles.slideBody}>
                    <span className={styles.slideTag}>{p.tag}</span>
                    <h3 className={`${styles.slideTitle} ${styles.headlineMd}`}>{p.titulo}</h3>
                    <p className={styles.slideText}>{p.texto}</p>
                    <button type="button" className={styles.linkBtn}>
                      Ver detalles <ArrowTrend />
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dots}>
          {PROYECTOS.map((p, i) => (
            <button
              key={p.titulo}
              type="button"
              className={`${styles.dot} ${i === activo ? styles.dotActive : ''}`}
              onClick={() => irA(i)}
              aria-label={`Ir al proyecto ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
