'use client';

// Página de bienvenida del voluntario aprobado: define su contraseña por
// primera vez con el enlace firmado (uid + token) que recibió por correo.
// Reutiliza el endpoint y los estilos del flujo de /restablecer.

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { restablecerContrasena } from '@/lib/auth';
import { useAuthForm } from '@/hooks/useAuthForm';
import styles from '../restablecer/restablecer.module.css';

// ─── Íconos SVG inline ────────────────────────────────────────────────
const ILock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const ICheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);
const IArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);
const IWave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0-10-10" /><path d="M2 22 12 12" /><path d="M7 22a5 5 0 0 1 5-5" /></svg>
);
const ISpinner = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

function DefinirContrasenaForm() {
  const params = useSearchParams();
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';
  const enlaceValido = Boolean(uid && token);

  const { error, loading, run } = useAuthForm();
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [listo, setListo] = useState(false);
  const [validacion, setValidacion] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidacion(null);

    if (contrasena !== confirmar) {
      setValidacion('Las contraseñas no coinciden.');
      return;
    }

    run(async () => {
      await restablecerContrasena(uid, token, contrasena);
      setListo(true);
    });
  }

  return (
    <div className={styles.page}>
      <span className={styles.glow1} aria-hidden />
      <span className={styles.glow2} aria-hidden />

      <div className={styles.card}>
        {!enlaceValido ? (
          <>
            <span className={styles.icon}><ILock /></span>
            <h1 className={styles.title}>Enlace no válido</h1>
            <p className={styles.text}>
              El enlace está incompleto o alterado. Abrí el botón del correo de
              bienvenida de Alumni UCR, o contactá a la administración para que te
              lo reenvíe.
            </p>
            <Link href="/login" className={styles.back}>
              <IArrowLeft /> Ir al Inicio de Sesión
            </Link>
          </>
        ) : listo ? (
          <div className={styles.success}>
            <span className={styles.icon}><ICheck /></span>
            <h1 className={styles.title}>¡Tu cuenta está lista!</h1>
            <p className={styles.text}>
              Guardamos tu contraseña. Ya podés iniciar sesión y empezar a
              colaborar con los proyectos de la comunidad UCR.
            </p>
            <Link href="/login" className={styles.submit}>Ir a Iniciar Sesión</Link>
          </div>
        ) : (
          <>
            <span className={styles.icon}><IWave /></span>
            <h1 className={styles.title}>¡Bienvenido a Alumni UCR!</h1>
            <p className={styles.text}>
              Tu solicitud de colaboración fue aprobada. Definí tu contraseña para
              activar tu cuenta de voluntario.
            </p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {(error || validacion) && (
                <div className={styles.formError}>{validacion || error}</div>
              )}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="contrasena">Contraseña</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><ILock /></span>
                  <input
                    id="contrasena"
                    className={styles.input}
                    type={verPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.toggle}
                    onClick={() => setVerPass((v) => !v)}
                    aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {verPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmar">Confirmar contraseña</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><ILock /></span>
                  <input
                    id="confirmar"
                    className={styles.input}
                    type={verPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? (
                  <><ISpinner className={styles.spinner} /> Guardando…</>
                ) : (
                  'Crear contraseña'
                )}
              </button>
            </form>

            <Link href="/login" className={styles.back}>
              <IArrowLeft /> Volver al Inicio de Sesión
            </Link>
          </>
        )}
      </div>

      <p className={styles.helpLink}>
        ¿Necesitas ayuda? <Link href="/ayuda">Centro de Ayuda</Link>
      </p>
    </div>
  );
}

export default function DefinirContrasenaPage() {
  return (
    <Suspense fallback={<div className={styles.page} />}>
      <DefinirContrasenaForm />
    </Suspense>
  );
}
