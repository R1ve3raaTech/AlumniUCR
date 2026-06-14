'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from './BrandLogo';
import styles from './landing.module.css';

// Navegación pública: anclas a las secciones del landing.
const LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Impacto', href: '#impacto' },
  { label: 'Historias', href: '#historias' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [abierto, setAbierto] = useState(false);

  const cerrar = () => setAbierto(false);

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.container} ${styles.navInner}`}>
        <Link href="/" aria-label="UCR Connect — inicio" onClick={cerrar}>
          <BrandLogo />
        </Link>

        <div className={`${styles.navLinks} ${abierto ? styles.navLinksOpen : ''}`}>
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${i === 0 ? styles.navLinkActive : ''}`}
              onClick={cerrar}
            >
              {l.label}
            </a>
          ))}

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

        <button
          type="button"
          className={styles.navToggle}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
