'use client';

// Contenedor visual compartido por login y registro: tarjeta glass centrada
// con la marca, un título y un subtítulo. El contenido (formulario) va como children.

import React from 'react';
import styles from './auth.module.css';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className={styles.page}>
      <div className={`glass-card ${styles.card}`}>
        <div className={styles.header}>
          <div className={styles.brand}>CT</div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
