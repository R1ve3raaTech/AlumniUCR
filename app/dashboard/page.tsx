'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
import AlumniLogo from '@/components/AlumniLogo';
import AdminSolicitudes from '@/components/AdminSolicitudes';
import ExalumnoDashboard from '@/components/ExalumnoDashboard';
import styles from './dashboard.module.css';

interface Perfil {
  nombre?: string;
  correo_electronico?: string;
  estado?: string;
  roles?: { nombre?: string } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading, signOut } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [perfilCargando, setPerfilCargando] = useState(true);

  // Protección client-side: si no hay sesión una vez hidratado, redirige al login.
  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  // Carga el perfil (con rol) para mostrar el panel correspondiente.
  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const res = await obtenerPerfil(token);
        if (activo) setPerfil(res?.data ?? null);
      } catch {
        if (activo) setPerfil(null);
      } finally {
        if (activo) setPerfilCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [token]);

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  // Evita parpadeo de contenido protegido mientras se hidrata o se redirige.
  if (loading || !token || perfilCargando) {
    return <div className={styles.loading}>Cargando…</div>;
  }

  const correo = user?.email ?? perfil?.correo_electronico ?? '—';
  const id = user?.id ?? '—';
  const rol = perfil?.roles?.nombre?.toLowerCase().trim();

  // Panel dedicado del exalumno (identidad de marca).
  if (rol === 'exalumno') {
    return <ExalumnoDashboard perfil={perfil} correo={correo} onSignOut={handleSignOut} />;
  }

  return (
    <div className={styles.page}>
      <header className={`glass-card ${styles.topbar}`}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio">
          <AlumniLogo height={36} />
        </Link>
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

        <section className={`glass-card ${styles.panel}`}>
          <h2 className={styles.panelTitle}>Mi perfil</h2>
          <p className={styles.welcomeText}>
            Completa y actualiza tu información académica, proyecto de graduación y habilidades.
          </p>
          <Link href="/perfil-estudiante" className="btn-primary">
            Ir a mi perfil
          </Link>
        </section>

        {/* Panel solo visible para administradores (se autodetecta por el rol). */}
        {token && <AdminSolicitudes token={token} />}
      </main>
    </div>
  );
}
