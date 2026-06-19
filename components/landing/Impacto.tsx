'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import AtomoImpacto from './AtomoImpacto';
import styles from './landing.module.css';

const METRICAS = [
  { valor: '+1200', etiqueta: 'Conexiones', color: '#54BCEB' },
  { valor: '85%', etiqueta: 'Éxito de Match', color: '#007D67' },
  { valor: '450', etiqueta: 'Mentores', color: '#FFC72C' },
  { valor: '+50', etiqueta: 'Proyectos Activos', color: '#F34B26' },
];

// Contador animado: cuenta de 0 al valor real y se re-anima cada 3 s para dar
// dinamismo (mostrando siempre el dato real).
function Counter({ valor, color, inView }: { valor: string; color: string; inView: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);

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

  return <h3 ref={ref} className={styles.statValue} style={{ color }}>0</h3>;
}

export default function Impacto() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="impacto" className={`${styles.section} ${styles.sectionLight}`}>
      <div className={styles.container}>
        <motion.div
          className={styles.impactoHead}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className={`${styles.sectionTitle} ${styles.headlineLg}`}>Nuestro <em>Impacto</em></h2>
          <div className={styles.accentBar} />
          <p className={styles.impactoSub}>Una red viva que conecta talento y experiencia. Cada órbita representa una métrica y cómo se entrelazan.</p>
        </motion.div>

        {/* Átomo 3D */}
        <div className={styles.atomPanel}>
          <AtomoImpacto />
        </div>

        {/* Tarjetas de métrica (minimalistas) */}
        <div ref={ref} className={styles.statCards}>
          {METRICAS.map((m) => (
            <div key={m.etiqueta} className={styles.statCard} style={{ ['--c' as string]: m.color } as React.CSSProperties}>
              <span className={styles.statDot} />
              <Counter valor={m.valor} color={m.color} inView={inView} />
              <p className={styles.statLabel}>{m.etiqueta}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
