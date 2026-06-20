'use client';

// Botón flotante "Volver al inicio" del landing. Solo es visible cuando alguna
// de las secciones proyectos / impacto / historias está en viewport; al pulsarlo
// hace scroll suave hasta la sección hero (#inicio).

import React, { useEffect, useState } from 'react';
import { ArrowUp } from './icons';
import styles from './landing.module.css';

// Secciones donde el botón debe mostrarse (ver ids en cada componente de sección).
const SECCIONES = ['matching', 'impacto', 'historias'];

export default function ScrollToHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const objetivos = SECCIONES
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (objetivos.length === 0) return;

    // Mantiene el conteo de secciones visibles para mostrar/ocultar el botón.
    const visibles = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibles.add(entry.target);
          else visibles.delete(entry.target);
        }
        setVisible(visibles.size > 0);
      },
      { threshold: 0.25 },
    );

    objetivos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
