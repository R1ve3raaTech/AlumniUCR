'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './auth.module.css';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className={styles.page}>
      <motion.div
        className={`glass-card ${styles.card}`}
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
        >
          <motion.div
            className={styles.brand}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.45, type: 'spring', stiffness: 220, damping: 15 }}
          >
            CT
          </motion.div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </motion.div>
        {children}
      </motion.div>
    </div>
  );
}
