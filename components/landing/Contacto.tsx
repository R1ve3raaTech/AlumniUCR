import React from 'react';
import Image from 'next/image';
import styles from './landing.module.css';

/**
 * Sección institucional sobre la UCR. 
 * Reemplaza al antiguo CTA de contacto, con un enfoque 100% informativo.
 */
export default function InfoUCR() {
  return (
    <section id="informacion" className={styles.section} style={{ overflow: 'hidden' }}>
      <div className={styles.container}>
        <div className={styles.split} data-anim="info-split">
          
          <div className={styles.splitContent} data-anim="info-text">
            <span className={styles.eyebrow}>Excelencia Académica</span>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem', fontSize: 'clamp(2rem, 1.2rem + 2.2vw, 3.2rem)' }}>
              El corazón de la innovación en Costa Rica
            </h2>
            <p className={styles.sectionLead} style={{ marginBottom: '1.5rem' }}>
              La <strong>Universidad de Costa Rica</strong> es la institución de educación superior 
              más prestigiosa de Centroamérica, con más de 80 años de trayectoria impecable. 
            </p>
            <p className={styles.sectionLead}>
              Nuestro campus es un espacio vibrante donde la investigación, la cultura y la 
              innovación convergen. Conectamos el mejor talento con oportunidades reales 
              para transformar la sociedad y liderar el futuro.
            </p>
            <div className={styles.stats} style={{ marginTop: '3rem' }}>
              <div>
                <div className={styles.statValue} data-count="50k+">0</div>
                <div className={styles.statLabel}>Profesionales</div>
              </div>
              <div>
                <div className={styles.statValue} data-count="80+">0</div>
                <div className={styles.statLabel}>Años de historia</div>
              </div>
            </div>
          </div>

          <div className={styles.splitVisual} data-anim="info-visual" style={{ borderRadius: '24px', boxShadow: '0 24px 48px -12px rgba(0, 76, 99, 0.2)' }}>
            <Image
              src="/images/campus.png"
              alt="Campus de la Universidad de Costa Rica"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center', transform: 'scale(1.15)' }}
              data-anim="info-image"
            />
            {/* Elemento decorativo sobre la imagen */}
            <div 
              className={`${styles.shape} ${styles.shapeCircle}`} 
              style={{ bottom: '-30px', left: '-30px', zIndex: 2 }} 
              data-anim="info-shape"
              aria-hidden
            />
          </div>

        </div>
      </div>
    </section>
  );
}
