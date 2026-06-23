'use client';

// Barra de progreso / porcentaje reutilizable, animada y con marca UCR.
// Unifica los avances de perfil, financiamiento y matching en todo el proyecto.

import React from 'react';
import { motion } from 'framer-motion';
import styles from './ui.module.css';

export default function ProgressBar({
  value,
  label,
  showValue = false,
  ariaLabel,
}: {
  value: number;
  label?: string;
  showValue?: boolean;
  ariaLabel?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className={styles.progressWrap}>
      {(label || showValue) && (
        <div className={styles.progressHead}>
          {label && <span>{label}</span>}
          {showValue && <span className={styles.progressPct}>{pct}%</span>}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || label}
      >
        <motion.span
          className={styles.fill}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
