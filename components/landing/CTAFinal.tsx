import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

export default function CTAFinal() {
  return (
    <section id="contacto" className={`${styles.section} ${styles.sectionLight}`}>
      <span
        className={styles.halftoneDense}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden
      />
      <div className={styles.container}>
        <div className={styles.ctaFinal} data-anim="reveal">
          <h2 className={`${styles.ctaTitle} ${styles.headlineLg} ${styles.animItem}`}>
            ¿Listo para tu <em>próximo paso?</em>
          </h2>
          <p className={`${styles.ctaText} ${styles.animItem}`}>
            Únete hoy a la red de profesionales más influyente del país y empieza a
            construir el futuro.
            <span className={styles.ctaNote}>* Acceso exclusivo para la comunidad UCR.</span>
          </p>
          <Link
            href="/registro"
            className={`${styles.btn} ${styles.btnSolid} ${styles.animItem}`}
          >
            Crear mi perfil gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
