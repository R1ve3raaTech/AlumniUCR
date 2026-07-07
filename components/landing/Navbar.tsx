'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import BrandLogo from './BrandLogo';
import styles from './landing.module.css';

// Navegación pública
const LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Mentorías', href: '/mentorias' },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  const cerrar = () => setAbierto(false);

  return (
    <nav
      className={styles.navbar}
    >
      <div className={`${styles.container} ${styles.navInner}`}>
        <div className={styles.navLeft}>
          <Link href="/" aria-label="Alumni UCR — inicio" onClick={cerrar}>
            <BrandLogo />
          </Link>
        </div>

        <div className={`${styles.navLinks} ${abierto ? styles.navLinksOpen : ''}`}>
          {LINKS.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                onClick={cerrar}
              >
                {l.label}
              </Link>
            );
          })}

          <Link
            href="/ayuda"
            className={`${styles.navLink} ${pathname === '/ayuda' ? styles.navLinkActive : ''}`}
            onClick={cerrar}
          >
            Ayuda
          </Link>
        </div>

        <div className={styles.navRight}>
          <Link href="/login" className={styles.navCta} onClick={cerrar}>
            ACCEDER
          </Link>
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
