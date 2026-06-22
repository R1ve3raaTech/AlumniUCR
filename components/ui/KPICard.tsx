'use client';

// Tarjeta de estadística / KPI reutilizable, con identidad de marca UCR.
// Unifica los contadores de los paneles (admin, exalumno, reportes).

import React from 'react';
import { motion } from 'framer-motion';
import styles from './ui.module.css';

export default function KPICard({
  icon,
  valor,
  label,
}: {
  icon?: React.ReactNode;
  valor: React.ReactNode;
  label: string;
}) {
  return (
    <motion.article
      className={styles.kpi}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {icon && <span className={styles.kpiIcon}>{icon}</span>}
      <span className={styles.kpiBody}>
        <span className={styles.kpiValor}>{valor}</span>
        <span className={styles.kpiLabel}>{label}</span>
      </span>
    </motion.article>
  );
}
