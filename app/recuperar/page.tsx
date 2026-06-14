'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { solicitarRecuperacion } from '@/lib/auth';
import { useAuthForm } from '@/hooks/useAuthForm';
import styles from './recuperar.module.css';

// ─── Íconos SVG inline ────────────────────────────────────────────────
const ILockReset = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /><path d="M12 16v-3" /></svg>
);
const IMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
);
const ISend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);
const IArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);
const IMailSent = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" /><path d="m22 7-10 6L2 7" /><path d="m16 19 2 2 4-4" /></svg>
);
const ISpinner = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default function RecuperarPage() {
  const { error, loading, run } = useAuthForm();
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await solicitarRecuperacion(correo.trim());
      setEnviado(true);
    });
  }

  return (
    <div className={styles.page}>
      <span className={styles.glow1} aria-hidden />
      <span className={styles.glow2} aria-hidden />

      <div className={styles.card}>
        {enviado ? (
          // Vista de confirmación
          <div className={styles.success}>
            <span className={styles.icon}><IMailSent /></span>
            <h1 className={styles.title}>Revisa tu correo</h1>
            <p className={styles.text}>
              Si <strong>{correo}</strong> está registrado, te enviamos un enlace para
              restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de
              spam.
            </p>
            <Link href="/login" className={styles.back}>
              <IArrowLeft /> Volver al Inicio de Sesión
            </Link>
          </div>
        ) : (
          <>
            <span className={styles.icon}><ILockReset /></span>
            <h1 className={styles.title}>¿Olvidaste tu contraseña?</h1>
            <p className={styles.text}>
              Ingresa el correo asociado a tu cuenta y te enviaremos las instrucciones
              para crear una nueva contraseña.
            </p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {error && <div className={styles.formError}>{error}</div>}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="correo">Correo</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IMail /></span>
                  <input
                    id="correo"
                    className={styles.input}
                    type="email"
                    placeholder="nombre.apellido@ucr.ac.cr"
                    autoComplete="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? (
                  <><ISpinner className={styles.spinner} /> Enviando…</>
                ) : (
                  <><ISend /> Enviar instrucciones</>
                )}
              </button>
            </form>

            <Link href="/login" className={styles.back}>
              <IArrowLeft /> Volver al Inicio de Sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
