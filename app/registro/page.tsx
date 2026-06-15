'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import TextField from '@/components/auth/TextField';
import { useAuthForm } from '@/hooks/useAuthForm';
import { solicitarMagicLink } from '@/lib/auth';
import { validarCorreoUCR } from '@/lib/validaciones';
import authStyles from '@/components/auth/auth.module.css';
import styles from './registro.module.css';

type Rol = 'estudiante' | 'exalumno';

export default function RegistroPage() {
  const { error, loading, run } = useAuthForm();

  const [rol, setRol] = useState<Rol>('estudiante');
  const [correo, setCorreo] = useState('');
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validarCorreoUCR(correo);
    setErrorCorreo(err);
    if (err) return;

    run(async () => {
      await solicitarMagicLink(rol, correo.trim());
      setEnviado(true);
    });
  }

  // Estado de confirmación: el enlace ya fue enviado al correo.
  if (enviado) {
    return (
      <AuthCard
        title="Revisa tu correo"
        subtitle="Te enviamos un enlace de verificación"
      >
        <p className={styles.aviso}>
          Enviamos un enlace a <strong>{correo}</strong>. Ábrelo para verificar tu
          cuenta y continuar con tu registro.
        </p>
        <p className={authStyles.footer}>
          ¿No lo recibiste?{' '}
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => setEnviado(false)}
          >
            Intentar de nuevo
          </button>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Crear Cuenta" subtitle="Únete a la comunidad de Conectando Talento UCR">
      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        {error && <div className={authStyles.formError}>{error}</div>}

        <div className={styles.roleGroup}>
          <span className={styles.roleLabel}>Soy</span>
          <div className={styles.roleOptions}>
            {(['estudiante', 'exalumno'] as Rol[]).map((opcion) => (
              <button
                key={opcion}
                type="button"
                onClick={() => setRol(opcion)}
                className={`${styles.roleButton} ${
                  rol === opcion ? styles.roleButtonActive : ''
                }`}
                aria-pressed={rol === opcion}
              >
                {opcion === 'estudiante' ? 'Estudiante' : 'Exalumno'}
              </button>
            ))}
          </div>
        </div>

        <TextField
          id="correo"
          label="Correo institucional"
          type="email"
          value={correo}
          onChange={(v) => {
            setCorreo(v);
            if (errorCorreo) setErrorCorreo(null);
          }}
          placeholder="tu.correo@ucr.ac.cr"
          autoComplete="email"
          required
          error={errorCorreo ?? undefined}
        />

        <button type="submit" className={`btn-primary ${authStyles.submit}`} disabled={loading}>
          {loading ? 'Enviando enlace…' : 'Enviar enlace de verificación'}
        </button>
      </form>

      <p className={authStyles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className={authStyles.link}>
          Inicia sesión
        </Link>
      </p>
    </AuthCard>
  );
}
