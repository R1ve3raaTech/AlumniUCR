'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from './BrandLogo';
import styles from './landing.module.css';

// Navegación pública simple (cuando no hay sesión): anclas a las secciones
// del landing + acceso a registro.
const LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Historia', href: '/historia' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Información', href: '/#informacion' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [abierto, setAbierto] = useState(false);

  const cerrarMenu = () => setAbierto(false);

  return (
    <header className={styles.navbar}>
      <div className={`${styles.container} ${styles.navInner}`}>
        <Link href="/" aria-label="UCR Connect — inicio" onClick={cerrarMenu}>
          <BrandLogo />
        </Link>

        <nav
          className={`${styles.navLinks} ${abierto ? styles.navLinksOpen : ''}`}
          aria-label="Navegación principal"
        >
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={styles.navLink} onClick={cerrarMenu}>
              {l.label}
            </a>
          ))}

          {user ? (
            <>
              <Link href="/dashboard" className={styles.navLink} onClick={cerrarMenu}>
                Dashboard
              </Link>
              <button
                type="button"
                className={`${styles.btnPrimary} ${styles.navCta}`}
                data-anim="magnetic"
                onClick={() => {
                  signOut();
                  cerrarMenu();
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/registro"
              className={`${styles.btnPrimary} ${styles.navCta}`}
              data-anim="magnetic"
              onClick={cerrarMenu}
            >
              Registro
            </Link>
          )}
        </nav>

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
    </header>
  );
}
