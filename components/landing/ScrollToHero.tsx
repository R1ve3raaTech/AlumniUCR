'use client';

// Botón flotante "Volver al inicio" del landing (esquina inferior izquierda).
// Visible siempre que el usuario no esté en el tope de la página; al pulsarlo
// hace scroll suave hasta arriba.

import React, { useEffect, useState } from 'react';
import { ArrowUp } from './icons';
import styles from './landing.module.css';

// Píxeles de scroll a partir de los cuales aparece el botón.
const UMBRAL = 200;

export default function ScrollToHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > UMBRAL);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const subirAlHero = () => {
    // Va a la parte superior REAL de la página (no a #inicio), para que el navbar
    // sticky quede visible arriba del hero en vez de superponerse a su contenido.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={subirAlHero}
      className={`${styles.scrollTop} ${visible ? styles.scrollTopVisible : ''}`}
      aria-label="Volver al inicio"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp className={styles.scrollTopIcon} />
    </button>
  );
}
