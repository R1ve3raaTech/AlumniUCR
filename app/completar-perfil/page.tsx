'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import TextField from '@/components/auth/TextField';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuth } from '@/context/AuthContext';
import { completarPerfil } from '@/lib/auth';
import { validarNombre, validarContrasena } from '@/lib/validaciones';
import authStyles from '@/components/auth/auth.module.css';
import styles from './completar-perfil.module.css';

export default function CompletarPerfilPage() {
  const router = useRouter();
  const { token, loading: cargandoSesion } = useAuth();
  const { error, loading, run } = useAuthForm();

  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState<{ nombre?: string; contrasena?: string }>({});

  // Protección: sin sesión verificada (paso 2), volver a /registro.
  useEffect(() => {
    if (!cargandoSesion && !token) {
      router.replace('/registro');
    }
  }, [cargandoSesion, token, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errNombre = validarNombre(nombre);
    const errPass = validarContrasena(contrasena);
    setErrores({ nombre: errNombre ?? undefined, contrasena: errPass ?? undefined });
    if (errNombre || errPass) return;

    run(async () => {
      await completarPerfil(nombre.trim(), contrasena);
      router.replace('/dashboard');
    });
  }

  if (cargandoSesion || !token) {
    return <AuthCard title="Cargando…" />;
  }

  return (
    <AuthCard title="Completa tu perfil" subtitle="Tu correo ya fue verificado. Define tus datos de acceso.">
      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        {error && <div className={authStyles.formError}>{error}</div>}

        <TextField
          id="nombre"
          label="Nombre completo"
          value={nombre}
          onChange={(v) => {
            setNombre(v);
            if (errores.nombre) setErrores((e) => ({ ...e, nombre: undefined }));
          }}
          placeholder="Tu nombre y apellidos"
          autoComplete="name"
          required
          error={errores.nombre}
        />

        <div>
          <TextField
            id="contrasena"
            label="Contraseña"
            type="password"
            value={contrasena}
            onChange={(v) => {
              setContrasena(v);
              if (errores.contrasena) setErrores((e) => ({ ...e, contrasena: undefined }));
            }}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            error={errores.contrasena}
          />
          <p className={styles.requisitos}>
            Debe tener al menos 8 caracteres, una mayúscula y un número.
          </p>
        </div>

        <button type="submit" className={`btn-primary ${authStyles.submit}`} disabled={loading}>
          {loading ? 'Guardando…' : 'Crear mi cuenta'}
        </button>
      </form>
    </AuthCard>
  );
}
