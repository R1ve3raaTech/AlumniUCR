'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import AlumniLogo from '@/components/AlumniLogo';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('ct_auth') : null;
    if (!raw) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);



  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('ct_auth');
    }
    router.replace('/login');
  };

  if (!mounted) return null;

  let pageTitle = 'Administración';
  if (pathname.includes('/matches')) pageTitle = 'Gestión de Matches';
  else if (pathname.includes('/usuarios')) pageTitle = 'Gestión de Usuarios';
  else if (pathname.includes('/donaciones')) pageTitle = 'Gestión de Donaciones';
  else if (pathname.includes('/reportes')) pageTitle = 'Reportes de Impacto';

  return (
    <div className={styles.page}>
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className={styles.nav}>
          <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio">
            <AlumniLogo height={38} />
          </Link>
          <nav className={`${styles.navLinks} ${menuAbierto ? styles.navLinksOpen : ''}`}>
            <Link href="/" className={styles.navLink}>Inicio</Link>
            <Link href="/admin/matches" className={`${styles.navLink} ${pathname.includes('/matches') ? styles.navLinkActive : ''}`}>Matches</Link>
            <Link href="/admin/usuarios" className={`${styles.navLink} ${pathname.includes('/usuarios') ? styles.navLinkActive : ''}`}>Usuarios</Link>
            <Link href="/admin/donaciones" className={`${styles.navLink} ${pathname.includes('/donaciones') ? styles.navLinkActive : ''}`}>Donaciones</Link>
            <Link href="/admin/reportes" className={`${styles.navLink} ${pathname.includes('/reportes') ? styles.navLinkActive : ''}`}>Impacto</Link>
            <Link href="/dashboard" className={styles.navLink} style={{ color: 'var(--brand-naranja)', paddingLeft: '2rem' }}>Panel Principal ✨</Link>
          </nav>
          <button
            type="button"
            className={styles.navToggle}
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <button type="button" className={styles.logout} onClick={handleSignOut}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </motion.header>

      <main className={styles.main}>
        <motion.section
          className={styles.welcome}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className={styles.welcomeTexture} aria-hidden />
          <motion.div
            className={styles.welcomeContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <span className={styles.badge}>Administración</span>
            <h1 className={styles.welcomeTitle}>{pageTitle}</h1>
            <p className={styles.welcomeText}>
              Gestiona los recursos de la plataforma. Configura y supervisa todos los aspectos del sistema administrativo de Conectando Talento UCR.
            </p>
          </motion.div>
        </motion.section>

        <div className={styles.container}>
          {children}
        </div>
      </main>
    </div>
  );
}
