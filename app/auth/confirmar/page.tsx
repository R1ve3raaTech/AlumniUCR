'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { useAuth } from '@/context/AuthContext';
import authStyles from '@/components/auth/auth.module.css';

function Confirmacion() {
  const router = useRouter();
  const params = useSearchParams();
  const { verificarCorreo } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // Evita ejecutar la verificación dos veces (StrictMode monta el efecto 2 veces).
  const yaCorrio = useRef(false);

  useEffect(() => {
    if (yaCorrio.current) return;
    yaCorrio.current = true;

    const tokenHash = params.get('token_hash');
    if (!tokenHash) {
      setError('El enlace no es válido o está incompleto.');
      return;
    }

    verificarCorreo(tokenHash)
      .then(() => router.replace('/completar-perfil'))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'No se pudo verificar tu correo.'),
      );
  }, [params, router, verificarCorreo]);

  if (error) {
    return (
      <AuthCard title="No pudimos verificarte" subtitle="El enlace expiró o ya fue usado">
        <div className={authStyles.formError}>{error}</div>
        <p className={authStyles.footer}>
          <Link href="/registro" className={authStyles.link}>
            Solicitar un nuevo enlace
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Verificando tu correo" subtitle="Esto tomará solo un momento…">
      <p className={authStyles.footer}>Estamos confirmando tu cuenta.</p>
    </AuthCard>
  );
}

export default function ConfirmarPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Verificando tu correo" subtitle="Esto tomará solo un momento…" />
      }
    >
      <Confirmacion />
    </Suspense>
  );
}
