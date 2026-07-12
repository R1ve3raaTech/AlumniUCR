'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth/auth';
import ExalumnoDashboard from '@/components/dashboard/ExalumnoDashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import DashboardEstudiante from '@/components/student/DashboardEstudiante';
import VoluntarioDashboard from '@/components/dashboard/VoluntarioDashboard';
import CargandoGirasol from '@/components/common/CargandoGirasol';

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
    return <CargandoGirasol />;
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

  // Panel del voluntario: centro de accesos según lo que el admin le habilitó.
  if (rol === 'voluntario') {
    return <VoluntarioDashboard correo={correo} onSignOut={handleSignOut} token={token ?? undefined} />;
  }

  // Dashboard del estudiante: pizarrón práctico ligado a la fuente única.
  return <DashboardEstudiante />;
}
