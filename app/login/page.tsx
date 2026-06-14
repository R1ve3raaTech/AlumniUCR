'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import AlumniLogo from '@/components/AlumniLogo';
import styles from './login.module.css';

// ─── Íconos SVG inline ────────────────────────────────────────────────
const IMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
);
const ILock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const IGroups = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const IWork = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
const ISpinner = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
const IArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { error, loading, run } = useAuthForm();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [recordar, setRecordar] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await signIn(correo.trim(), contrasena);
      router.push('/dashboard');
    });
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={40} /></Link>
        <div className={styles.headerRight}>
          <Link href="/" className={styles.back}>
            <IArrowLeft /> Volver al inicio
          </Link>
          <Link href="/ayuda" className={styles.help}>Ayuda</Link>
        </div>
      </header>

      <main className={styles.main}>
        <span className={styles.bgSkew} aria-hidden />
        <span className={styles.bgArc} aria-hidden />

        <div className={styles.card}>
          {/* Panel de bienvenida */}
          <aside className={styles.side}>
            <div className={styles.sideContent}>
              <h1 className={styles.sideTitle}>
                Conectando el <em>Legado</em> de la UCR
              </h1>
              <p className={styles.sideText}>
                Accede a la red profesional de exalumnos más grande de Costa Rica y
                potencia tu trayectoria académica y laboral.
              </p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}><IGroups /></span>
                  <span className={styles.featureText}>Comunidad de +100k Alumni</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}><IWork /></span>
                  <span className={styles.featureText}>Oportunidades de networking únicas</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Formulario */}
          <div className={styles.formSide}>
            <div className={styles.formHead}>
              <h2 className={styles.formTitle}>Bienvenido de nuevo</h2>
              <p className={styles.formSubtitle}>Ingresa tus credenciales institucionales</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {error && <div className={styles.formError}>{error}</div>}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="correo">Correo Institucional</label>
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

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label} htmlFor="contrasena">Contraseña</label>
                  <Link href="/recuperar" className={styles.forgot}>¿Olvidaste tu contraseña?</Link>
                </div>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><ILock /></span>
                  <input
                    id="contrasena"
                    className={styles.input}
                    type={verPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
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

              <div className={styles.remember}>
                <input
                  id="recordar"
                  type="checkbox"
                  checked={recordar}
                  onChange={(e) => setRecordar(e.target.checked)}
                />
                <label htmlFor="recordar">Mantener sesión iniciada</label>
              </div>

              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? (
                  <>
                    <ISpinner className={styles.spinner} /> Ingresando…
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>

              <div className={styles.createLink}>
                <p>
                  ¿Aún no tienes acceso?
                  <Link href="/registro">Crear una cuenta</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerCopy}>© 2025 Alumni UCR. Todos los derechos reservados.</div>
        <div className={styles.footerLinks}>
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <Link href="/ayuda">Soporte</Link>
        </div>
      </footer>
    </div>
  );
}
