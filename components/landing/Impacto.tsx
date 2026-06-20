'use client';

import React, { useEffect, useRef } from 'react';
import { useInView, animate } from 'framer-motion';
import AtomoImpacto from './AtomoImpacto';
import styles from './landing.module.css';

type IconKey = 'network' | 'target' | 'people' | 'rocket';

const METRICAS: { valor: string; etiqueta: string; color: string; desc: string; icon: IconKey }[] = [
  { valor: '+1200', etiqueta: 'Conexiones', color: '#54BCEB', icon: 'network', desc: 'Vínculos creados entre estudiantes y profesionales de la red Alumni.' },
  { valor: '85%', etiqueta: 'Éxito de Match', color: '#007D67', icon: 'target', desc: 'De los matches derivan en mentorías activas y sostenidas en el tiempo.' },
  { valor: '450', etiqueta: 'Mentores', color: '#FFC72C', icon: 'people', desc: 'Profesionales acompañando el desarrollo de nuevos talentos UCR.' },
  { valor: '+50', etiqueta: 'Proyectos Activos', color: '#F34B26', icon: 'rocket', desc: 'Iniciativas en curso impulsadas por la comunidad de exalumnos.' },
];

const ICON: Record<IconKey, React.ReactNode> = {
  network: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="2.2" /><circle cx="19" cy="6" r="2.2" /><circle cx="19" cy="18" r="2.2" />
      <path d="M7 11l9.5-3.6M7 13l9.5 3.6" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.4" />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" /><circle cx="17.5" cy="9" r="2.3" />
      <path d="M3.5 19c0-3 2.6-4.8 5.5-4.8s5.5 1.8 5.5 4.8M15.5 19c0-2 1-3.2 3-3.2s3 1.2 3 3.2" />
    </svg>
  ),
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c3.2 1.9 5 5.2 5 9l-2.4 2.4-2.6-1-2.6 1L7 12c0-3.8 1.8-7.1 5-9z" />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M8.5 16.5C7 16.5 6 18 6 19.8c1.8 0 3.3-1 3.3-2.5" />
    </svg>
  ),
};

// Contador animado (0 → valor real, se re-anima cada 3 s). Render como <span>.
function Counter({ valor, className, color, inView }: { valor: string; className: string; color: string; inView: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!inView || !ref.current) return;
    const numMatch = valor.match(/\d+/);
    if (!numMatch) { ref.current.textContent = valor; return; }
    const target = parseInt(numMatch[0]);
    const prefix = valor.startsWith('+') ? '+' : '';
    const suffix = valor.endsWith('%') ? '%' : '';
    let controls: ReturnType<typeof animate> | null = null;
    const correr = () => {
      controls?.stop();
      controls = animate(0, target, {
        duration: 1.4,
        ease: 'easeOut',
        onUpdate(v) { if (ref.current) ref.current.textContent = `${prefix}${Math.floor(v)}${suffix}`; },
      });
    };
    correr();
    const id = setInterval(correr, 3000);
    return () => { controls?.stop(); clearInterval(id); };
  }, [inView, valor]);
  return <span ref={ref} className={className} style={{ color }}>0</span>;
}

export default function Impacto() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const card = (m: typeof METRICAS[number]) => (
    <div key={m.etiqueta} className={styles.apiCard} style={{ ['--c']: m.color } as React.CSSProperties}>
      <span className={styles.apiIcon}>{ICON[m.icon]}</span>
      <h3 className={styles.apiTitle}>
        {m.etiqueta} <Counter valor={m.valor} color={m.color} className={styles.apiValue} inView={inView} />
      </h3>
      <p className={styles.apiDesc}>{m.desc}</p>
    </div>
  );

  return (
    <section id="impacto" className={`${styles.section} ${styles.sectionLight} ${styles.impactoFull}`}>
      {/* Izquierda: el átomo (nuestro objeto) sobre degradé suave */}
      <div className={styles.impactoLeft}>
        <div className={styles.atomBox}>
          <AtomoImpacto />
        </div>
      </div>

      {/* Derecha: encabezado + tarjetas escalonadas (las métricas) */}
      <div className={styles.impactoRight}>
        <div className={styles.impactoHead}>
          <h2 className={`${styles.sectionTitle} ${styles.headlineLg}`}>Nuestro <em>Impacto</em></h2>
          <p className={styles.impactoSub}>Una red viva que conecta talento y experiencia. Esto es lo que logramos juntos.</p>
        </div>

        <div ref={ref} className={styles.apiCols}>
          {METRICAS.map((m) => card(m))}
        </div>
      </div>
    </section>
  );
}
