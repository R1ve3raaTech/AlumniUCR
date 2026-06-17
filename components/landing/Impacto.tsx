'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import styles from './landing.module.css';

const METRICAS = [
  { valor: '+1200', etiqueta: 'Conexiones' },
  { valor: '85%', etiqueta: 'Éxito de Match' },
  { valor: '450', etiqueta: 'Mentores' },
  { valor: '+50', etiqueta: 'Proyectos Activos' },
];

function Counter({ valor, inView }: { valor: string; inView: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const numMatch = valor.match(/\d+/);
    if (!numMatch) {
      if (ref.current) ref.current.textContent = valor;
      return;
    }
    const target = parseInt(numMatch[0]);
    const prefix = valor.startsWith('+') ? '+' : '';
    const suffix = valor.endsWith('%') ? '%' : '';

    const controls = animate(0, target, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate(v) {
        if (ref.current) ref.current.textContent = `${prefix}${Math.floor(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, valor]);

  return (
    <h3 ref={ref} className={styles.metricValue} data-count={valor}>
      0
    </h3>
  );
}

export default function Impacto() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="impacto" className={`${styles.section} ${styles.sectionLight}`}>
      <div className={styles.container}>
        <motion.div
          ref={ref}
          className={styles.metrics}
          data-anim="reveal"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {METRICAS.map((m) => (
            <motion.div
              key={m.etiqueta}
              className={`${styles.metric} ${styles.animItem}`}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
              }}
            >
              <Counter valor={m.valor} inView={inView} />
              <p className={styles.metricLabel}>{m.etiqueta}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
