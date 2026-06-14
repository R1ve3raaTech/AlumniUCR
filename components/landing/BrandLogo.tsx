import React from 'react';
import styles from './landing.module.css';

interface BrandLogoProps {
  /** Versión clara para fondos oscuros (esmeralda). */
  light?: boolean;
}

/**
 * Logo de UCR Connect inspirado en el isotipo Alumni UCR:
 * tres arcos ascendentes (caminos que se unen) coronados por tres círculos
 * (comunidad de egresados). El color hereda según la variante.
 */
export default function BrandLogo({ light = false }: BrandLogoProps) {
  const color = light ? 'var(--brand-blanco)' : 'var(--ucr-primary)';
  return (
    <span className={`${styles.brandLogo} ${light ? styles.brandLogoLight : ''}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        role="img"
        aria-label="UCR Connect"
        style={{ color }}
      >
        <path d="M32 56 C32 40 20 34 10 32" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M32 56 C32 40 44 34 54 32" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M32 56 L32 38" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <circle cx="20" cy="22" r="4.5" fill="currentColor" />
        <circle cx="44" cy="22" r="4.5" fill="currentColor" />
        <circle cx="32" cy="16" r="5.5" fill="currentColor" />
      </svg>
      <span className={styles.brandLogoText}>
        <strong>UCR</strong>
        <span>Connect</span>
      </span>
    </span>
  );
}
