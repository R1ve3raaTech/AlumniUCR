'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Entrada del módulo: siempre redirige al paso 1 (Información del proyecto).
export default function ProyectoGraduacionIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/proyecto-graduacion/informacion');
  }, [router]);

  return null;
}
