'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
import ExalumnoDashboard from '@/components/ExalumnoDashboard';
import AdminDashboard from '@/components/AdminDashboard';

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-ucr-surface font-brand-body text-ucr-on-surface">
        Cargando…
      </div>
    );
  }

  const correo = user?.email ?? perfil?.correo_electronico ?? '—';
  const rol = perfil?.roles?.nombre?.toLowerCase().trim();

  // Panel dedicado del exalumno (se mantiene intacto).
  if (rol === 'exalumno') {
    return (
      <ExalumnoDashboard
        perfil={perfil}
        correo={correo}
        onSignOut={handleSignOut}
        userId={user?.id}
        token={token ?? undefined}
      />
    );
  }

  // Panel del administrador (se mantiene intacto).
  if (rol === 'admin') {
    return <AdminDashboard correo={correo} onSignOut={handleSignOut} />;
  }

  // ─────────────────────────────────────────────────────────────────────
  // Dashboard del estudiante: EN RECONSTRUCCIÓN. Se rehará desde cero con
  // los diseños de Stitch. Placeholder limpio para no romper el login/links.
  // ─────────────────────────────────────────────────────────────────────
  const nombre = perfil?.nombre?.trim().split(/\s+/)[0] || correo.split('@')[0] || 'estudiante';
  return (
    <div className="grid min-h-screen place-items-center bg-ucr-surface p-8 font-brand-body text-ucr-on-surface">
      <div className="text-center">
        <p className="font-ucr-display text-3xl font-bold text-ucr-primary">Hola, {nombre}</p>
        <p className="mt-2 text-ucr-on-surface-variant">
          Tu panel de estudiante está en reconstrucción.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 inline-flex rounded-full border border-ucr-outline-variant px-5 py-2 text-sm font-semibold text-ucr-primary transition-colors hover:bg-ucr-surface-container"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
