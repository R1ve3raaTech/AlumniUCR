'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import TextField from '@/components/auth/TextField';
import { useAuth } from '@/context/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import authStyles from '@/components/auth/auth.module.css';
import styles from './registro.module.css';

type Rol = 'estudiante' | 'exalumno';

export default function RegistroPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { error, loading, run } = useAuthForm();

  const [rol, setRol] = useState<Rol>('estudiante');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await signUp(rol, correo, contrasena);
      // Tras registrarse, enviamos al login para que inicie sesión.
      router.push('/login');
    });
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
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          required
        />

        <button type="submit" className={`btn-primary ${authStyles.submit}`} disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Registrarme'}
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
