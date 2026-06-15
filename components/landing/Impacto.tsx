import React from 'react';
import styles from './landing.module.css';

const METRICAS = [
  { valor: '+1200', etiqueta: 'Conexiones' },
  { valor: '85%', etiqueta: 'Éxito de Match' },
  { valor: '450', etiqueta: 'Mentores' },
  { valor: '+50', etiqueta: 'Proyectos Activos' },
];

export default function Impacto() {
  return (
    <section id="impacto" className={`${styles.section} ${styles.sectionLight}`}>
      <div className={styles.container}>
        <div className={styles.metrics} data-anim="reveal">
          {METRICAS.map((m) => (
            <div key={m.etiqueta} className={`${styles.metric} ${styles.animItem}`}>
              <h3 className={styles.metricValue} data-count={m.valor}>
                0
              </h3>
              <p className={styles.metricLabel}>{m.etiqueta}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
