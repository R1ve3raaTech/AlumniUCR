'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import TextField from '@/components/auth/TextField';
import { useAuth } from '@/context/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import styles from '@/components/auth/auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { error, loading, run } = useAuthForm();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await signIn(correo, contrasena);
      router.push('/dashboard');
    });
  }

  return (
    <AuthCard title="Iniciar Sesión" subtitle="Bienvenido de vuelta a Conectando Talento UCR">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && <div className={styles.formError}>{error}</div>}

        <TextField
          id="correo"
          label="Correo electrónico"
          type="email"
          value={correo}
          onChange={setCorreo}
          placeholder="tu.correo@ucr.ac.cr"
          autoComplete="email"
          required
        />
        <TextField
          id="contrasena"
          label="Contraseña"
          type="password"
          value={contrasena}
          onChange={setContrasena}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <button type="submit" className={`btn-primary ${styles.submit}`} disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className={styles.footer}>
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className={styles.link}>
          Regístrate
        </Link>
      </p>
    </AuthCard>
  );
}
