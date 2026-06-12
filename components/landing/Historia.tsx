import React from 'react';
import styles from './landing.module.css';

const STATS = [
  { count: '4500+', label: 'Egresados conectados' },
  { count: '200+', label: 'Empresas aliadas' },
  { count: '120+', label: 'Becas financiadas' },
];

export default function Historia() {
  return (
    <section id="historia" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.split}>
          {/* Mosaico decorativo con las formas/colores de la marca */}
          <div className={styles.splitVisual} aria-hidden>
            <div className={styles.splitVisualInner}>
              <span className={`${styles.splitTile} ${styles.tileEsmeralda}`} />
              <span className={`${styles.splitTile} ${styles.tileNaranja}`} />
              <span className={`${styles.splitTile} ${styles.tileAmarillo}`} />
              <span className={`${styles.splitTile} ${styles.tileAzul}`} />
            </div>
          </div>

          <div data-anim="reveal">
            <span className={`${styles.eyebrow} ${styles.animItem}`}>Nuestra historia</span>
            <h2 className={`${styles.sectionTitle} ${styles.animItem}`}>El objeto de UCR Connect</h2>
            <p className={`${styles.sectionLead} ${styles.animItem}`}>
              UCR Connect nace para mantener vivo el vínculo entre los egresados y su
              alma máter. Apoyamos esfuerzos estratégicos de la Universidad de Costa
              Rica articulando la voluntad de los exalumnos de contribuir como un
              instrumento legítimo, autónomo e íntegro.
            </p>
            <p className={`${styles.sectionLead} ${styles.animItem}`}>
              Canalizamos recursos y creamos oportunidades para estudiantes,
              investigadores y profesionales que representan el espíritu de la UCR.
            </p>

            <div className={`${styles.stats} ${styles.animItem}`}>
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className={styles.statValue} data-count={s.count}>
                    0
                  </div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
