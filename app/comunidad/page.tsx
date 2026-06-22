'use client';

// Comunidad del estudiante: el espacio real de blog + eventos dentro del shell
// del estudiante. La UI vive en ComunidadFeed (compartida con /blog).

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentShell from '@/components/student/StudentShell';
import ComunidadFeed from '@/components/comunidad/ComunidadFeed';
import { useAuth } from '@/context/AuthContext';

export default function ComunidadPage() {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && !token) router.replace('/login');
  }, [loading, token, router]);

  return (
    <StudentShell active="comunidad">
      <ComunidadFeed />
    </StudentShell>
  );
}
