import React from 'react';
import styles from './landing.module.css';

export default function UCRImpacto() {
  return (
    <section className={styles.section} style={{ background: 'var(--brand-gris)', overflow: 'hidden' }}>
      <div className={styles.container}>
        <div className={styles.sectionHead} data-anim="reveal">
          <span className={styles.eyebrow}>Pilares de Excelencia</span>
          <h2 className={styles.sectionTitle}>Lo que hacemos en la UCR</h2>
          <p className={styles.sectionLead}>
            Nuestra institución se sostiene sobre tres pilares fundamentales que impactan directamente
            en el desarrollo de Costa Rica y la región centroamericana.
          </p>
        </div>

        <div className={styles.cards} data-anim="impact-cards" style={{ marginTop: '3rem' }}>
          {/* Card 1: Docencia */}
          <div className={styles.card} data-anim="impact-card">
            <div className={`${styles.cardIcon} ${styles.iconEmpleo}`}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h3 className={styles.cardTitle}>Docencia</h3>
            <p className={styles.cardText}>
              Formamos a los mejores profesionales del país con un enfoque crítico, humanista y de altísima excelencia académica internacional.
            </p>
          </div>

          {/* Card 2: Investigación */}
          <div className={styles.card} data-anim="impact-card">
            <div className={`${styles.cardIcon} ${styles.iconMentoria}`}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <h3 className={styles.cardTitle}>Investigación</h3>
            <p className={styles.cardText}>
              Generamos conocimiento científico e innovación tecnológica de punta para resolver los desafíos más urgentes de nuestra sociedad global.
            </p>
          </div>

          {/* Card 3: Acción Social */}
          <div className={styles.card} data-anim="impact-card">
            <div className={`${styles.cardIcon} ${styles.iconDonacion}`}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className={styles.cardTitle}>Acción Social</h3>
            <p className={styles.cardText}>
              Vinculamos el quehacer universitario con las comunidades, democratizando el saber y promoviendo el bienestar y progreso social sostenido.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
