'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from './BrandLogo';
import styles from './landing.module.css';

// Navegación pública
const LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Mentorías', href: '/mentorias' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const cerrar = () => setAbierto(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/proyectos?q=${encodeURIComponent(query)}`);
    cerrar();
  };

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.container} ${styles.navInner}`}>
        <div className={styles.navLeft}>
          <Link href="/" aria-label="UCR Connect — inicio" onClick={cerrar}>
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
          {/* Buscador de Proyectos (solo visible en /proyectos) */}
          {pathname === '/proyectos' && (
            <form onSubmit={handleSearch} className={styles.navSearchForm}>
              <input 
                type="text" 
                placeholder="Buscar proyectos..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.navSearchInput}
              />
              <button type="submit" className={styles.navSearchBtn} aria-label="Buscar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </form>
          )}

          {user ? (
            <>
              <Link href="/dashboard" className={styles.navCta} onClick={cerrar}>
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
              Unete
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
