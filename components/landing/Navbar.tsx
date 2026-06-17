'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from './BrandLogo';
import styles from './landing.module.css';

// Navegación pública: anclas a las secciones del landing. "Proyectos" lleva a
// la página dedicada /proyectos (ruta interna, no ancla).
const LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Mentorías', href: '/mentorias' },
  { label: 'Directorio', href: '/directorio' },
  { label: 'Impacto', href: '#impacto' },
  { label: 'Historias', href: '#historias' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [abierto, setAbierto] = useState(false);

  const cerrar = () => setAbierto(false);

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={`${styles.container} ${styles.navInner}`}>
        <Link href="/" aria-label="UCR Connect — inicio" onClick={cerrar}>
          <BrandLogo />
        </Link>

        <div className={`${styles.navLinks} ${abierto ? styles.navLinksOpen : ''}`}>
          {LINKS.map((l, i) =>
            l.href.startsWith('/') ? (
              <Link
                key={l.href}
                href={l.href}
                className={styles.navLink}
                onClick={cerrar}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className={`${styles.navLink} ${i === 0 ? styles.navLinkActive : ''}`}
                onClick={cerrar}
              >
                {l.label}
              </a>
            ),
          )}

          <Link href="/ayuda" className={styles.navLink} onClick={cerrar}>
            Ayuda
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className={styles.navLink} onClick={cerrar}>
                Dashboard
              </Link>
              <button
                type="button"
                className={styles.navCta}
                onClick={() => {
                  signOut();
                  cerrar();
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/registro" className={styles.navCta} onClick={cerrar}>
              Unirse
            </Link>
          )}
        </div>

        <motion.button
          type="button"
          className={styles.navToggle}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
          whileTap={{ scale: 0.85 }}
        >
          <span />
          <span />
          <span />
        </motion.button>
      </div>
    </motion.nav>
  );
}
