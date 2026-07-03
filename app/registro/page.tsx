'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { solicitarMagicLink, registrarExalumno, correoYaRegistrado } from '@/lib/auth';
import { validarCorreoPorRol, validarCorreo, validarContrasena } from '@/lib/validaciones';
import { useAuthForm } from '@/hooks/useAuthForm';
import AlumniLogo from '@/components/AlumniLogo';
import AlumniMascot from '@/components/landing/AlumniMascot';
import { FACULTADES_UCR, CARRERAS_UCR } from '@/lib/catalogoUCR';
import styles from './registro.module.css';

type Rol = 'estudiante' | 'exalumno';

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
const ILock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const ICalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);

const ROLES: { value: Rol; titulo: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'estudiante', titulo: 'Soy Estudiante', desc: 'Activo en carrera académica.', icon: <ISchool /> },
  { value: 'exalumno', titulo: 'Soy Exalumno', desc: 'Graduado y profesional.', icon: <IPremium /> },
];

// Curvas de easing estándar (design system: ease-out entrar, ease-in salir)
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const EASE_IN: [number, number, number, number] = [0.55, 0.055, 0.675, 0.19];

export default function RegistroPage() {
  const { error, loading, run, reset } = useAuthForm();
  const reduced = useReducedMotion();

  const ANIO_ACTUAL = new Date().getFullYear();
  const dur = reduced ? 0.01 : 0.22;

  const [rol, setRol] = useState<Rol>('estudiante');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [carne, setCarne] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [modoExito, setModoExito] = useState<'magiclink' | 'exalumno'>('magiclink');

  const [contrasena, setContrasena] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [carreras, setCarreras] = useState<string[]>([]);
  const [facultad, setFacultad] = useState('');
  const [anioGraduacion, setAnioGraduacion] = useState('');
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null);
  // Correo que ya está registrado (muestra el aviso "ya registrada" + ir a login).
  const [existente, setExistente] = useState<string | null>(null);

  const esUCR = correo.trim().toLowerCase().endsWith('@ucr.ac.cr');

  // Al cambiar de rol, "refrescamos" los errores: la nueva sección no arrastra
  // los del rol anterior.
  function cambiarRol(value: Rol) {
    if (value === rol) return;
    setRol(value);
    setErrorForm(null);
    setErrorCorreo(null);
    setExistente(null);
    reset();
  }

  const toggleCarrera = (c: string) =>
    setCarreras((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  function enviarEnlace() {
    run(async () => {
      // El correo es el determinante: si ya existe, avisamos y ofrecemos login.
      if (await correoYaRegistrado(correo.trim())) {
        setExistente(correo.trim());
        return;
      }
      const res = await solicitarMagicLink('estudiante', correo.trim());
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'ct_registro_datos',
          JSON.stringify({
            nombre: `${nombre.trim()} ${apellidos.trim()}`.trim(),
            apellidos: apellidos.trim(),
            carne: carne.trim(),
            cedula: cedula.trim(),
            rol: 'estudiante',
          }),
        );
      }
      // En desarrollo el backend devuelve token_hash → enlace directo (ruta
      // relativa, funciona en cualquier puerto y sin depender del correo).
      const th = res?.token_hash;
      setConfirmUrl(th ? `/auth/confirmar?token_hash=${encodeURIComponent(th)}` : null);
      setModoExito('magiclink');
      setEnviado(true);
    });
  }

  function registrarComoExalumno() {
    setErrorForm(null);
    const errCorreo = validarCorreo(correo);
    if (errCorreo) return setErrorForm(errCorreo);
    if (nombre.trim().length < 1) return setErrorForm('Ingresá tu nombre.');
    if (apellidos.trim().length < 1) return setErrorForm('Ingresá tus apellidos.');
    const errPass = validarContrasena(contrasena);
    if (errPass) return setErrorForm(errPass);
    if (carreras.length < 1) return setErrorForm('Selecciona al menos una carrera cursada en la UCR.');
    if (!facultad) return setErrorForm('Selecciona tu escuela o facultad.');
    const anio = Number(anioGraduacion);
    if (!Number.isInteger(anio) || anio < 1940 || anio > ANIO_ACTUAL) {
      return setErrorForm(`El año de graduación debe estar entre 1940 y ${ANIO_ACTUAL}.`);
    }
    run(async () => {
      // El correo es el determinante: si ya existe, avisamos y ofrecemos login.
      if (await correoYaRegistrado(correo.trim())) {
        setExistente(correo.trim());
        return;
      }
      const res = await registrarExalumno({
        correo: correo.trim(), contrasena, nombre: `${nombre.trim()} ${apellidos.trim()}`.trim(),
        carreras, facultad, anioGraduacion: anio,
      });
      setConfirmUrl(res?.data?.confirmUrl ?? null);
      setModoExito('exalumno');
      setEnviado(true);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rol === 'exalumno') { registrarComoExalumno(); return; }
    // Campos obligatorios del estudiante (error se muestra debajo del botón)
    setErrorForm(null);
    if (nombre.trim().length < 1) return setErrorForm('Ingresá tu nombre.');
    if (apellidos.trim().length < 1) return setErrorForm('Ingresá tus apellidos.');
    if (cedula.trim().length < 1) return setErrorForm('Ingresá tu número de cédula.');
    const err = validarCorreoPorRol(correo, 'estudiante');
    setErrorCorreo(err);
    if (err) return;
    enviarEnlace();
  }

  function abrirCorreo() {
    if (typeof window !== 'undefined') window.open('https://mail.google.com', '_blank', 'noopener');
  }

  // Variante reutilizable para campo de formulario
  const fieldFade = {
    hidden: { opacity: 0, y: reduced ? 0 : 10 },
    visible: { opacity: 1, y: 0, transition: { duration: dur, ease: EASE_OUT } },
  };

  // Transición entre formulario y pantalla de éxito (elemento clave)
  const pageVariants = {
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: { opacity: 1, y: 0, transition: { duration: reduced ? 0.01 : 0.25, ease: EASE_OUT } },
    exit: { opacity: 0, y: reduced ? 0 : -12, transition: { duration: reduced ? 0.01 : 0.18, ease: EASE_IN } },
  };

  return (
    <div className={styles.page}>
      <AlumniMascot />
      <div className={styles.bg} aria-hidden>
        <span className={styles.bgCircle} />
        <span className={styles.bgBlock} />
      </div>

      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: reduced ? 0 : -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, ease: EASE_OUT }}
      >
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio">
          <AlumniLogo height={38} />
        </Link>
        <div className={styles.headerActions}>
          <Link href="/ayuda" className={styles.backLink}>Ayuda</Link>
          <Link href="/login" className={styles.backLink}>
            <IArrowBack /> Volver al Login
          </Link>
        </div>
      </motion.header>

      <main className={styles.main}>
        {/* Panel principal — el elemento clave de la página */}
        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.28, ease: EASE_OUT, delay: 0.06 }}
        >
          {/* AnimatePresence mode="wait": transición limpia formulario ↔ éxito */}
          <AnimatePresence mode="wait">
            {enviado ? (
              /* ── Pantalla de éxito ── */
              <motion.div
                key="success"
                className={styles.success}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div>
                  {/* Ícono con spring — único elemento que usa física (justificado por el contexto celebratorio) */}
                  <motion.div
                    className={styles.successIcon}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={reduced
                      ? { duration: 0.01 }
                      : { type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }
                    }
                  >
                    <IMailRead />
                  </motion.div>

                  <motion.h1
                    className={styles.title}
                    initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: dur, ease: EASE_OUT, delay: 0.25 }}
                  >
                    {modoExito === 'exalumno' ? '¡Cuenta creada!' : '¡Casi listo!'}
                  </motion.h1>

                  <motion.p
                    className={styles.successText}
                    initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: dur, ease: EASE_OUT, delay: 0.32 }}
                  >
                    {modoExito === 'exalumno' ? (
                      <>
                        Enviamos un correo de confirmación a{' '}
                        <strong style={{ color: 'var(--ucr-primary)' }}>{correo}</strong>. Tu cuenta
                        quedará <strong>pendiente</strong> hasta que confirmes tu correo.
                      </>
                    ) : (
                      <>
                        Hemos enviado un enlace de acceso seguro (Magic Link) a{' '}
                        <strong style={{ color: 'var(--ucr-primary)' }}>{correo}</strong>.
                      </>
                    )}
                  </motion.p>
                </div>

                <motion.div
                  className={styles.successActions}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: dur, ease: EASE_OUT, delay: 0.4 }}
                >
                  {modoExito === 'exalumno' ? (
                    <>
                      {confirmUrl ? (
                        <motion.a
                          href={confirmUrl}
                          className={styles.submit}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={!reduced ? { scale: 1.015 } : {}}
                          whileTap={!reduced ? { scale: 0.98 } : {}}
                          transition={{ duration: 0.15, ease: EASE_OUT }}
                        >
                          Confirmar mi cuenta ahora
                        </motion.a>
                      ) : (
                        <motion.button
                          type="button"
                          className={styles.submit}
                          onClick={abrirCorreo}
                          whileHover={!reduced ? { scale: 1.015 } : {}}
                          whileTap={!reduced ? { scale: 0.98 } : {}}
                          transition={{ duration: 0.15, ease: EASE_OUT }}
                        >
                          Abrir mi correo
                        </motion.button>
                      )}
                      <div className={styles.resendHint}>
                        {confirmUrl && (
                          <p className={styles.expiry}>
                            Modo desarrollo: confirma con el botón de arriba.
                          </p>
                        )}
                        <Link href="/login" className={styles.resendBtn}>Ir a iniciar sesión</Link>
                      </div>
                    </>
                  ) : (
                    <>
                      {confirmUrl ? (
                        <motion.a
                          href={confirmUrl}
                          className={styles.submit}
                          whileHover={!reduced ? { scale: 1.015 } : {}}
                          whileTap={!reduced ? { scale: 0.98 } : {}}
                          transition={{ duration: 0.15, ease: EASE_OUT }}
                        >
                          Confirmar mi cuenta ahora
                        </motion.a>
                      ) : (
                        <motion.button
                          type="button"
                          className={styles.submit}
                          onClick={abrirCorreo}
                          whileHover={!reduced ? { scale: 1.015 } : {}}
                          whileTap={!reduced ? { scale: 0.98 } : {}}
                          transition={{ duration: 0.15, ease: EASE_OUT }}
                        >
                          Abrir mi correo
                        </motion.button>
                      )}
                      <div className={styles.resendHint}>
                        {confirmUrl && (
                          <p className={styles.expiry}>Modo desarrollo: confirmá con el botón de arriba (no depende del correo).</p>
                        )}
                        <button type="button" className={styles.resendBtn} onClick={enviarEnlace} disabled={loading}>
                          {loading ? 'Reenviando…' : '¿No recibiste el correo? Volver a enviar'}
                        </button>
                        <p className={styles.expiry}>
                          <ISchedule /> El enlace expirará en 15 minutos.
                        </p>
                        <button type="button" className={styles.resendBtn} onClick={() => setEnviado(false)}>
                          Usar otro correo
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              /* ── Formulario ── */
              <motion.div
                key="form"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.div
                  className={styles.intro}
                  initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: dur, ease: EASE_OUT, delay: 0.12 }}
                >
                  <h1 className={styles.title}>Únete a la <em>Red</em></h1>
                  <div className={styles.accentBar} />
                  <p className={styles.subtitle}>Conectá con la comunidad Alumni UCR. Completá tus datos para empezar.</p>
                </motion.div>

                <motion.form
                  className={styles.form}
                  onSubmit={handleSubmit}
                  noValidate
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
                  }}
                >
                  {/* Paso 1: Rol */}
                  <motion.div variants={fieldFade}>
                    <h2 className={styles.stepTitle}>Paso 1: ¿Cuál es tu rol?</h2>
                    <div className={styles.roles}>
                      {ROLES.map((r) => (
                        <label key={r.value} style={{ cursor: 'pointer' }}>
                          <input
                            className={styles.roleInput}
                            type="radio"
                            name="rol"
                            value={r.value}
                            checked={rol === r.value}
                            onChange={() => cambiarRol(r.value)}
                          />
                          {/* Role card: solo escala al hacer hover/tap, no con la selección */}
                          <motion.div
                            className={`${styles.roleCard} ${rol === r.value ? styles.roleCardActive : ''}`}
                            whileHover={!reduced ? { scale: 1.02 } : {}}
                            whileTap={!reduced ? { scale: 0.98 } : {}}
                            transition={{ duration: 0.15, ease: EASE_OUT }}
                          >
                            <span className={styles.roleIcon}>{r.icon}</span>
                            <h3 className={styles.roleTitle}>{r.titulo}</h3>
                            <p className={styles.roleDesc}>{r.desc}</p>
                          </motion.div>
                        </label>
                      ))}
                    </div>

                    <Link href="/registro/otros" className={styles.roleOtros}>
                      <span className={styles.roleOtrosIcon}><IHandshake /></span>
                      <span className={styles.roleOtrosText}>
                        <strong>Otros</strong>
                        <small>¿Quieres colaborar como voluntario? Postúlate aquí.</small>
                      </span>
                      <span className={styles.roleOtrosArrow}><IChevronRight /></span>
                    </Link>
                  </motion.div>

                  {/* Aviso correo UCR — aparece/desaparece con height */}
                  <AnimatePresence>
                    {rol === 'exalumno' && esUCR && (
                      <motion.div
                        className={styles.ucrPrompt}
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                      >
                        <p>Detectamos un correo <strong>@ucr.ac.cr</strong>. ¿Ya te graduaste?</p>
                        <div className={styles.ucrPromptActions}>
                          <span className={styles.ucrPromptOk}>Sí, continúa como exalumno</span>
                          <button type="button" onClick={() => cambiarRol('estudiante')}>No, soy estudiante</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Paso 2: Información */}
                  <motion.div className={styles.step2} variants={fieldFade}>
                    <h2 className={styles.stepTitle}>
                      Paso 2: {rol === 'exalumno' ? 'Datos de autodeclaración' : 'Información Personal'}
                    </h2>

                    <div className={styles.fields}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="nombre">Nombre <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrap}>
                          <span className={styles.inputIcon}><IPerson /></span>
                          <input id="nombre" className={styles.input} type="text" placeholder="Ej: Juan"
                            autoComplete="given-name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="apellidos">Apellidos <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrap}>
                          <span className={styles.inputIcon}><IPerson /></span>
                          <input id="apellidos" className={styles.input} type="text" placeholder="Ej: Pérez Mora"
                            autoComplete="family-name" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
                        </div>
                      </div>

                      <AnimatePresence>
                        {rol === 'estudiante' && (
                          <motion.div
                            style={{ display: 'contents' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: EASE_OUT }}
                          >
                            {/* Cédula debajo del Nombre (columna izquierda) */}
                            <div className={styles.field}>
                              <label className={styles.label} htmlFor="cedula">Cédula <span className={styles.req}>*</span></label>
                              <div className={styles.inputWrap}>
                                <span className={styles.inputIcon}><IBadge /></span>
                                <input id="cedula" className={styles.input} type="text" placeholder="Ej: 1-1234-5678"
                                  inputMode="numeric" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
                              </div>
                            </div>

                            {/* Carné debajo de Apellidos (columna derecha) */}
                            <div className={styles.field}>
                              <label className={styles.label} htmlFor="carne">Carné universitario</label>
                              <div className={styles.inputWrap}>
                                <span className={styles.inputIcon}><IBadge /></span>
                                <input id="carne" className={styles.input} type="text" placeholder="Ej: B12345"
                                  value={carne} onChange={(e) => setCarne(e.target.value)} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className={`${styles.field} ${rol === 'estudiante' ? styles.fieldFull : ''}`}>
                        <label className={styles.label} htmlFor="correo">Correo electrónico <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrap}>
                          <span className={styles.inputIcon}><IMail /></span>
                          <input id="correo" className={styles.input} type="email"
                            placeholder={rol === 'exalumno' ? 'tucorreo@dominio.com' : 'usuario@ucr.ac.cr'}
                            value={correo}
                            onChange={(e) => { setCorreo(e.target.value); if (errorCorreo) setErrorCorreo(null); if (existente) setExistente(null); }}
                            required />
                        </div>
                      </div>

                      {/* Campos exclusivos exalumno — fade in/out según rol */}
                      <AnimatePresence>
                        {rol === 'exalumno' && (
                          <motion.div
                            style={{ display: 'contents' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: EASE_OUT }}
                          >
                            <div className={styles.field}>
                              <label className={styles.label} htmlFor="contrasena">Contraseña</label>
                              <div className={styles.inputWrap}>
                                <span className={styles.inputIcon}><ILock /></span>
                                <input id="contrasena" className={styles.input}
                                  type={verPass ? 'text' : 'password'} placeholder="••••••••"
                                  autoComplete="new-password" value={contrasena}
                                  onChange={(e) => setContrasena(e.target.value)} required />
                                <button type="button" className={styles.toggle}
                                  onClick={() => setVerPass((v) => !v)}
                                  aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                                  {verPass ? 'Ocultar' : 'Mostrar'}
                                </button>
                              </div>
                              <span className={styles.hint}>Mín. 8 caracteres, 1 mayúscula y 1 número.</span>
                            </div>

                            <div className={styles.field}>
                              <label className={styles.label} htmlFor="anio">Año de graduación</label>
                              <div className={styles.inputWrap}>
                                <span className={styles.inputIcon}><ICalendar /></span>
                                <input id="anio" className={styles.input} type="number"
                                  min={1940} max={ANIO_ACTUAL} placeholder={`1940 – ${ANIO_ACTUAL}`}
                                  value={anioGraduacion} onChange={(e) => setAnioGraduacion(e.target.value)} required />
                              </div>
                            </div>

                            <div className={`${styles.field} ${styles.fieldFull}`}>
                              <label className={styles.label} htmlFor="facultad">Escuela o Facultad</label>
                              <div className={styles.inputWrap}>
                                <span className={styles.inputIcon}><ISchool /></span>
                                <select id="facultad" className={styles.input} value={facultad}
                                  onChange={(e) => setFacultad(e.target.value)} required>
                                  <option value="" disabled>Selecciona tu facultad…</option>
                                  {FACULTADES_UCR.map((f) => <option key={f} value={f}>{f}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className={`${styles.field} ${styles.fieldFull}`}>
                              <label className={styles.label}>Carrera(s) cursada(s) en la UCR</label>
                              <div className={styles.carrerasBox}>
                                {CARRERAS_UCR.map((c) => (
                                  <label key={c} className={styles.carreraItem}>
                                    <input type="checkbox" checked={carreras.includes(c)} onChange={() => toggleCarrera(c)} />
                                    <span>{c}</span>
                                  </label>
                                ))}
                              </div>
                              <span className={styles.hint}>
                                {carreras.length} seleccionada(s) · selecciona al menos una.
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Acciones */}
                  <motion.div className={styles.actions} variants={fieldFade}>
                    <motion.button
                      type="submit"
                      className={styles.submit}
                      disabled={loading}
                      whileHover={!loading && !reduced ? { scale: 1.015 } : {}}
                      whileTap={!loading && !reduced ? { scale: 0.98 } : {}}
                      transition={{ duration: 0.15, ease: EASE_OUT }}
                    >
                      {loading
                        ? <><ISpinner className={styles.spinner} /> Procesando…</>
                        : rol === 'exalumno' ? 'Crear cuenta' : 'Registrarse'}
                    </motion.button>

                    {/* Aviso: ya existe una cuenta con ese correo → ofrecer login */}
                    <AnimatePresence>
                      {existente && (
                        <motion.div
                          role="alert"
                          aria-live="assertive"
                          initial={{ opacity: 0, y: -6, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -6, height: 0 }}
                          transition={{ duration: 0.2, ease: EASE_OUT }}
                          style={{
                            display: 'flex', flexDirection: 'column', gap: '0.7rem',
                            marginTop: '0.9rem', padding: '1rem 1.1rem', borderRadius: '0.8rem',
                            border: '1px solid rgba(84,188,235,0.45)', background: 'rgba(84,188,235,0.12)',
                            color: 'var(--ucr-primary, #004C63)',
                          }}
                        >
                          <span style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                            <strong>Esta persona ya se encuentra registrada.</strong>{' '}
                            Ya existe una cuenta{cedula.trim() ? ` con la cédula ${cedula.trim()}` : ''} asociada
                            al correo <strong>{existente}</strong>. Iniciá sesión para continuar.
                          </span>
                          <Link
                            href="/login"
                            style={{
                              alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                              background: 'var(--brand-esmeralda, #007D67)', color: '#fff', fontWeight: 700,
                              padding: '0.6rem 1.4rem', borderRadius: '999px', textDecoration: 'none',
                            }}
                          >
                            Iniciar sesión →
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error justo debajo del botón: visible sin scrollear */}
                    <AnimatePresence>
                      {!existente && (errorCorreo || errorForm || error) && (
                        <motion.div
                          className={styles.submitError}
                          role="alert"
                          aria-live="assertive"
                          initial={{ opacity: 0, y: -6, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -6, height: 0 }}
                          transition={{ duration: 0.2, ease: EASE_OUT }}
                        >
                          <span className={styles.submitErrorIcon}>!</span>
                          <span>{errorCorreo || errorForm || error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className={styles.terms}>
                      Al registrarte, aceptas nuestros <Link href="/terminos">Términos y Condiciones</Link>.
                    </p>
                  </motion.div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className={styles.footer}>
        <AlumniLogo height={34} />
        <div className={styles.footerCopy}>© 2025 Alumni UCR. Todos los derechos reservados.</div>
        <div className={styles.footerLinks}>
          <Link href="/terminos#privacidad">Privacidad</Link>
          <Link href="/terminos">Términos</Link>
          <Link href="/ayuda">Soporte</Link>
        </div>
      </footer>
    </div>
  );
}
