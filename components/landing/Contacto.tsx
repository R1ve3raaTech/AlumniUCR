import React from 'react';
import styles from './landing.module.css';

/**
 * Sección de contacto / llamada a la acción. El formulario apunta a /registro
 * pasando el correo, para continuar el alta allí (no envía datos por sí mismo).
 */
export default function Contacto() {
  return (
    <section id="contacto" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>¿Listo para llevar tu carrera al siguiente nivel?</h2>
          <p className={styles.ctaText}>
            Regístrate hoy en la red oficial de UCR Connect y empieza a recibir
            oportunidades.
          </p>
          <form className={styles.ctaForm} action="/registro" method="get">
            <input
              type="email"
              name="correo"
              required
              placeholder="tu.correo@ucr.ac.cr"
              aria-label="Correo electrónico"
              className={styles.ctaInput}
            />
            <button type="submit" className={styles.btnPrimary}>
              Inscríbete
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
