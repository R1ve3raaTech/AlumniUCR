'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import AlumniLogo from '@/components/common/AlumniLogo';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth/auth';
import CargandoGirasol from '@/components/common/CargandoGirasol';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, loading, signOut } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  // 'verificando' hasta confirmar el rol contra el backend: evita mostrar el
  // panel admin a un usuario autenticado que no es admin (antes solo se
  // comprobaba que existiera un token en localStorage).
  const [accesoAdmin, setAccesoAdmin] = useState<'verificando' | 'ok' | 'denegado'>('verificando');

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.replace('/login');
      return;
    }

    let activo = true;
    (async () => {
      try {
        const res = await obtenerPerfil(token);
        const rol = res?.data?.roles?.nombre?.toLowerCase().trim();
        if (!activo) return;
        if (rol === 'admin') {
          setAccesoAdmin('ok');
        } else {
          setAccesoAdmin('denegado');
          router.replace('/dashboard');
        }
      } catch {
        if (!activo) return;
        setAccesoAdmin('denegado');
        router.replace('/login');
      }
    })();

    return () => {
      activo = false;
    };
  }, [loading, token, router]);

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);



  const handleSignOut = () => {
    // Usa el signOut del contexto para que el estado global de sesión se limpie
    // además del localStorage (antes el contexto quedaba con el usuario cargado).
    signOut();
    router.replace('/login');
  };

  // No renderizar el panel hasta confirmar que el rol es admin.
  if (loading || accesoAdmin !== 'ok') return <CargandoGirasol />;

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
