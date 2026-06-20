'use client';

// Guard de rol para páginas exclusivas de un rol (estudiante o exalumno).
// No toca el backend: reutiliza /auth/perfil (obtenerPerfil) ya existente.
// Si el rol no coincide, redirige a /dashboard (ahí cada rol ve su propio panel).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';

export function useRequireRole(rolesPermitidos: Array<'estudiante' | 'exalumno'>) {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const perfil = await obtenerPerfil(token);
        const rol = perfil?.data?.roles?.nombre?.toLowerCase().trim();
        if (!activo) return;
        if (rol && rolesPermitidos.includes(rol as 'estudiante' | 'exalumno')) {
          setAutorizado(true);
        } else {
          router.replace('/dashboard');
        }
      } catch {
        if (activo) router.replace('/dashboard');
      } finally {
        if (activo) setVerificando(false);
      }
    })();
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { verificando: verificando || authLoading || !token, autorizado };
}
