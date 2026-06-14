'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading, signOut } = useAuth();

  // Protección client-side: si no hay sesión una vez hidratado, redirige al login.
  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  // Evita parpadeo de contenido protegido mientras se hidrata o se redirige.
  if (loading || !token) {
    return <div className={styles.loading}>Cargando…</div>;
  }

  const correo = user?.email ?? '—';
  const id = user?.id ?? '—';

  return (
    <div className={styles.page}>
      <header className={`glass-card ${styles.topbar}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>CT</span>
          Conectando Talento UCR
        </div>
        <div className={styles.topbarActions}>
          <Link href="/ayuda" className={styles.helpLink}>Ayuda</Link>
          <button type="button" className="btn-secondary" onClick={handleSignOut}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <section className={`glass-card ${styles.welcome}`}>
          <h1 className={styles.welcomeTitle}>¡Hola de nuevo!</h1>
          <p className={styles.welcomeText}>
            Has iniciado sesión como <span className={styles.email}>{correo}</span>.
          </p>
        </section>

        <section className={`glass-card ${styles.panel}`}>
          <h2 className={styles.panelTitle}>Datos de tu sesión</h2>
          <div className={styles.dataRow}>
            <span className={styles.dataKey}>Correo</span>
            <span>{correo}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataKey}>ID de usuario</span>
            <span>{id}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
