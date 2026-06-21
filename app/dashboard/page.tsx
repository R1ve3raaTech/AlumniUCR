'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
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
  const { perfil: perfilEst } = usePerfilEstudiante();
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
  // Dashboard del estudiante (placeholder). Saluda con el nombre de la fuente
  // única e invita al onboarding si aún no lo completó.
  // ─────────────────────────────────────────────────────────────────────
  const nombre = perfilEst.nombre?.trim() || perfil?.nombre?.trim().split(/\s+/)[0] || correo.split('@')[0] || 'estudiante';
  return (
    <div className="grid min-h-screen place-items-center bg-background p-8 font-body-base text-on-background">
      <div className="max-w-md text-center">
        <p className="font-headline-md text-3xl font-bold text-primary">Hola, {nombre}</p>
        {perfilEst.completado ? (
          <>
            <p className="mt-2 text-on-surface-variant">
              Tu perfil está cargado. Tus datos ya se reflejan en todas tus pantallas.
            </p>
            <Link
              href="/perfil-estudiante"
              className="mt-6 inline-flex rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-on-secondary"
            >
              Ir a mi perfil
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-on-surface-variant">
              Completá tu perfil <strong>una sola vez</strong> y se llenará automáticamente en tu perfil, CV, matches y más.
            </p>
            <Link
              href="/onboarding"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-on-secondary"
            >
              <span className="material-symbols-outlined text-base">rocket_launch</span> Completar mi perfil
            </Link>
          </>
        )}
        <div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 inline-flex rounded-full border border-outline-variant px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
