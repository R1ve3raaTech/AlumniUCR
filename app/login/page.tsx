'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import AlumniLogo from '@/components/AlumniLogo';
import styles from './login.module.css';

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

const FEATURES = [
  { icon: <IGroups />, text: 'Comunidad de +100k Alumni' },
  { icon: <IWork />, text: 'Oportunidades de networking únicas' },
];

// ease-out cubic — entering elements feel snappy, not sluggish
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
// ease-in cubic — exiting elements feel natural
const EASE_IN: [number, number, number, number] = [0.55, 0.055, 0.675, 0.19];

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { error, loading, run } = useAuthForm();
  const reduced = useReducedMotion();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [recordar, setRecordar] = useState(true);

  // Si el usuario prefiere menos movimiento, usamos solo fade sin desplazamientos
  const slideY = reduced ? 0 : 20;
  const slideX = reduced ? 0 : 28;
  const dur = reduced ? 0.01 : 0.22;

  const fieldFade = {
    hidden: { opacity: 0, y: reduced ? 0 : 10 },
    visible: { opacity: 1, y: 0, transition: { duration: dur, ease: EASE_OUT } },
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await signIn(correo.trim(), contrasena);
      router.push('/dashboard');
    });
  }

  return (
    <div className={styles.page}>
      {/* Header — fade down, 200ms */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: reduced ? 0 : -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, ease: EASE_OUT }}
      >
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio">
          <AlumniLogo height={40} />
        </Link>
        <div className={styles.headerRight}>
          <Link href="/" className={styles.back}><IArrowLeft /> Volver al inicio</Link>
          <Link href="/ayuda" className={styles.help}>Ayuda</Link>
        </div>
      </motion.header>

      <main className={styles.main}>
        <span className={styles.bgSkew} aria-hidden />
        <span className={styles.bgArc} aria-hidden />

        {/* Card principal — el elemento más importante: entra con fade+scale ligero */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: slideY, scale: reduced ? 1 : 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduced ? 0.01 : 0.28, ease: EASE_OUT, delay: 0.05 }}
        >
          {/* Panel izquierdo — desliza desde la izquierda */}
          <motion.aside
            className={styles.side}
            initial={{ opacity: 0, x: -slideX }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.25, ease: EASE_OUT, delay: 0.12 }}
          >
            <div className={styles.sideContent}>
              <h1 className={styles.sideTitle}>
                Conectando el <em>Legado</em> de la UCR
              </h1>
              <p className={styles.sideText}>
                Accede a la red profesional de exalumnos más grande de Costa Rica y
                potencia tu trayectoria académica y laboral.
              </p>
              <div className={styles.features}>
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={f.text}
                    className={styles.feature}
                    initial={{ opacity: 0, x: reduced ? 0 : -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: reduced ? 0.01 : 0.2, ease: EASE_OUT, delay: 0.25 + i * 0.08 }}
                  >
                    <span className={styles.featureIcon}>{f.icon}</span>
                    <span className={styles.featureText}>{f.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Panel derecho — desliza desde la derecha */}
          <motion.div
            className={styles.formSide}
            initial={{ opacity: 0, x: slideX }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.25, ease: EASE_OUT, delay: 0.12 }}
          >
            <motion.div
              className={styles.formHead}
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.01 : 0.2, ease: EASE_OUT, delay: 0.2 }}
            >
              <h2 className={styles.formTitle}>Bienvenido de nuevo</h2>
              <p className={styles.formSubtitle}>Ingresa tus credenciales institucionales</p>
            </motion.div>

            <motion.form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07, delayChildren: 0.28 } },
              }}
            >
              {/* Error con AnimatePresence — ease-in al salir */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className={styles.formError}
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.18, ease: EASE_IN }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div className={styles.field} variants={fieldFade}>
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
              </motion.div>

              <motion.div className={styles.field} variants={fieldFade}>
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
              </motion.div>

              <motion.div className={styles.remember} variants={fieldFade}>
                <input
                  id="recordar"
                  type="checkbox"
                  checked={recordar}
                  onChange={(e) => setRecordar(e.target.checked)}
                />
                <label htmlFor="recordar">Mantener sesión iniciada</label>
              </motion.div>

              <motion.button
                type="submit"
                className={styles.submit}
                disabled={loading}
                variants={fieldFade}
                whileHover={!loading && !reduced ? { scale: 1.015 } : {}}
                whileTap={!loading && !reduced ? { scale: 0.98 } : {}}
                transition={{ duration: 0.15, ease: EASE_OUT }}
              >
                {loading
                  ? <><ISpinner className={styles.spinner} /> Ingresando…</>
                  : 'Ingresar'}
              </motion.button>

              <motion.div className={styles.createLink} variants={fieldFade}>
                <p>
                  ¿Aún no tienes acceso?{' '}
                  <Link href="/registro">Crear una cuenta</Link>
                </p>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
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
