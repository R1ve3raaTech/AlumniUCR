'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { solicitarMagicLink } from '@/lib/auth';
import { validarCorreoUCR } from '@/lib/validaciones';
import { useAuthForm } from '@/hooks/useAuthForm';
import AlumniLogo from '@/components/AlumniLogo';
import styles from './registro.module.css';

type Rol = 'estudiante' | 'exalumno';

// ─── Íconos SVG inline (sin dependencia de fuente de íconos) ──────────
const IArrowBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7 7-7-7 7-7" /></svg>
);
const ISchool = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" /></svg>
);
const IPremium = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6" /><path d="M9 13.5 7.5 22 12 19l4.5 3-1.5-8.5" /></svg>
);
const IPerson = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
const IBadge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M7 16a3 3 0 0 1 4 0M15 9h3M15 13h3" /></svg>
);
const IMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
);
const ISpinner = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
const IMailRead = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" /><path d="m2 7 10 6 10-6" /><path d="m16 19 2 2 4-4" /></svg>
);
const ISchedule = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const IHandshake = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" /><path d="M3 4h8" /></svg>
);
const IChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);

const ROLES: { value: Rol; titulo: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'estudiante', titulo: 'Soy Estudiante', desc: 'Activo en carrera académica.', icon: <ISchool /> },
  { value: 'exalumno', titulo: 'Soy Exalumno', desc: 'Graduado y profesional.', icon: <IPremium /> },
];

export default function RegistroPage() {
  const { error, loading, run } = useAuthForm();

  const [rol, setRol] = useState<Rol>('estudiante');
  const [nombre, setNombre] = useState('');
  const [carne, setCarne] = useState('');
  const [correo, setCorreo] = useState('');
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  function enviarEnlace() {
    run(async () => {
      await solicitarMagicLink(rol, correo.trim());
      // Guarda el nombre/carné para precargar el paso "completar perfil".
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'ct_registro_datos',
          JSON.stringify({ nombre: nombre.trim(), carne: carne.trim(), rol }),
        );
      }
      setEnviado(true);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validarCorreoUCR(correo);
    setErrorCorreo(err);
    if (err) return;
    enviarEnlace();
  }

  function abrirCorreo() {
    if (typeof window !== 'undefined') {
      window.open('https://mail.google.com', '_blank', 'noopener');
    }
  }

  return (
    <div className={styles.page}>
      {/* Fondo decorativo */}
      <div className={styles.bg} aria-hidden>
        <span className={styles.bgCircle} />
        <span className={styles.bgBlock} />
      </div>

      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerActions}>
          <Link href="/ayuda" className={styles.backLink}>Ayuda</Link>
          <Link href="/login" className={styles.backLink}>
            <IArrowBack /> Volver al Login
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.panel}>
          {enviado ? (
            <div className={styles.success}>
              <div>
                <div className={styles.successIcon}>
                  <IMailRead />
                </div>
                <h1 className={styles.title}>¡Casi listo!</h1>
                <p className={styles.successText}>
                  Hemos enviado un enlace de acceso seguro (Magic Link) a tu correo
                  institucional: <strong style={{ color: 'var(--ucr-primary)' }}>{correo}</strong>.
                </p>
              </div>

              <div className={styles.successActions}>
                <button type="button" className={styles.submit} onClick={abrirCorreo}>
                  Abrir mi correo
                </button>
                <div className={styles.resendHint}>
                  <button
                    type="button"
                    className={styles.resendBtn}
                    onClick={enviarEnlace}
                    disabled={loading}
                  >
                    {loading ? 'Reenviando…' : '¿No recibiste el correo? Volver a enviar'}
                  </button>
                  <p className={styles.expiry}>
                    <ISchedule /> Por tu seguridad, el enlace expirará en 15 minutos.
                  </p>
                  <button
                    type="button"
                    className={styles.resendBtn}
                    onClick={() => setEnviado(false)}
                  >
                    Usar otro correo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.intro}>
                <h1 className={styles.title}>Únete a la Red</h1>
                <p className={styles.subtitle}>Completa tus datos para empezar a conectar.</p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {error && <div className={styles.formError}>{error}</div>}

                {/* Paso 1: rol */}
                <div>
                  <h2 className={styles.stepTitle}>Paso 1: ¿Cuál es tu rol?</h2>
                  <div className={styles.roles}>
                    {ROLES.map((r) => (
                      <label key={r.value}>
                        <input
                          className={styles.roleInput}
                          type="radio"
                          name="rol"
                          value={r.value}
                          checked={rol === r.value}
                          onChange={() => setRol(r.value)}
                        />
                        <div
                          className={`${styles.roleCard} ${rol === r.value ? styles.roleCardActive : ''}`}
                        >
                          <span className={styles.roleIcon}>{r.icon}</span>
                          <h3 className={styles.roleTitle}>{r.titulo}</h3>
                          <p className={styles.roleDesc}>{r.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Opción secundaria (menor prioridad): voluntarios/colaboradores.
                      Lleva a un formulario aparte; no usa el flujo de magic link. */}
                  <Link href="/registro/otros" className={styles.roleOtros}>
                    <span className={styles.roleOtrosIcon}><IHandshake /></span>
                    <span className={styles.roleOtrosText}>
                      <strong>Otros</strong>
                      <small>¿Quieres colaborar como voluntario? Postúlate aquí.</small>
                    </span>
                    <span className={styles.roleOtrosArrow}><IChevronRight /></span>
                  </Link>
                </div>

                {/* Paso 2: información */}
                <div className={styles.step2}>
                  <h2 className={styles.stepTitle}>Paso 2: Información Personal</h2>
                  <div className={styles.fields}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="nombre">Nombre Completo</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}><IPerson /></span>
                        <input
                          id="nombre"
                          className={styles.input}
                          type="text"
                          placeholder="Ej: Juan Pérez"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="carne">Carné / Cédula</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}><IBadge /></span>
                        <input
                          id="carne"
                          className={styles.input}
                          type="text"
                          placeholder="Ej: B12345"
                          value={carne}
                          onChange={(e) => setCarne(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={`${styles.field} ${styles.fieldFull}`}>
                      <label className={styles.label} htmlFor="correo">Correo Electrónico</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}><IMail /></span>
                        <input
                          id="correo"
                          className={styles.input}
                          type="email"
                          placeholder="usuario@ucr.ac.cr"
                          value={correo}
                          onChange={(e) => {
                            setCorreo(e.target.value);
                            if (errorCorreo) setErrorCorreo(null);
                          }}
                          required
                        />
                      </div>
                      {errorCorreo && <span className={styles.formError}>{errorCorreo}</span>}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className={styles.actions}>
                  <button type="submit" className={styles.submit} disabled={loading}>
                    {loading ? (
                      <>
                        <ISpinner className={styles.spinner} /> Procesando…
                      </>
                    ) : (
                      'Registrarse'
                    )}
                  </button>
                  <p className={styles.terms}>
                    Al registrarte, aceptas nuestros{' '}
                    <a href="#">Términos y Condiciones</a>.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <AlumniLogo height={34} />
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
