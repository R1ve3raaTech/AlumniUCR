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
  const { verificarCorreo, establecerSesion } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [subtitulo, setSubtitulo] = useState('El enlace expiró o ya fue usado');
  // Evita ejecutar la verificación dos veces (StrictMode monta el efecto 2 veces).
  const yaCorrio = useRef(false);

  useEffect(() => {
    if (yaCorrio.current) return;
    yaCorrio.current = true;

    // Caso 1 — plantilla personalizada: el enlace trae ?token_hash=… y el
    // backend lo verifica con verifyOtp.
    const tokenHash = params.get('token_hash');
    if (tokenHash) {
      verificarCorreo(tokenHash)
        .then(() => router.replace('/completar-perfil'))
        .catch((err) => {
          setSubtitulo('El enlace expiró o ya fue usado');
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo verificar tu correo. Solicita un enlace nuevo y abre el correo más reciente.',
          );
        });
      return;
    }

    // Caso 2 — plantilla por defecto (flujo implícito): Supabase ya verificó y
    // redirige con la sesión en el fragmento de la URL (#access_token=…).
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    const fragmento = new URLSearchParams(hash);
    const accessToken = fragmento.get('access_token');
    const errorDescripcion = fragmento.get('error_description');

    if (accessToken) {
      try {
        establecerSesion(accessToken);
        router.replace('/completar-perfil');
      } catch {
        setSubtitulo('No se pudo iniciar la sesión');
        setError('El enlace no se pudo procesar. Solicita un enlace nuevo.');
      }
      return;
    }

    if (errorDescripcion) {
      setSubtitulo('El enlace expiró o ya fue usado');
      setError(decodeURIComponent(errorDescripcion.replace(/\+/g, ' ')));
      return;
    }

    // Sin token_hash ni fragmento: enlace incompleto.
    setSubtitulo('El enlace está incompleto');
    setError(
      'El enlace no incluye el código de verificación. Abre el correo más reciente y usa su botón una sola vez.',
    );
  }, [params, router, verificarCorreo, establecerSesion]);

  if (error) {
    return (
      <AuthCard title="No pudimos verificarte" subtitle={subtitulo}>
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
