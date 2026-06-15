'use client';

// Campo de texto controlado y reutilizable para los formularios de autenticación.
// Todo el estilo vive en auth.module.css (sin estilos inline).
// Para campos de contraseña (type="password") muestra un botón para ver/ocultar
// lo escrito, aplicable automáticamente a todos los formularios de login/registro.

import React, { useState } from 'react';
import styles from './auth.module.css';

interface TextFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
}

export default function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  error,
}: TextFieldProps) {
  // Estado solo relevante para contraseñas: alterna entre ocultar y mostrar.
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const esContrasena = type === 'password';
  const tipoInput = esContrasena && mostrarContrasena ? 'text' : type;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={esContrasena ? styles.inputWrapper : undefined}>
        <input
          id={id}
          type={tipoInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`${styles.input} ${esContrasena ? styles.inputWithToggle : ''} ${
            error ? styles.inputError : ''
          }`}
          aria-invalid={Boolean(error)}
        />
        {esContrasena && (
          <button
            type="button"
            className={styles.toggleVisibility}
            onClick={() => setMostrarContrasena((v) => !v)}
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={mostrarContrasena}
          >
            {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}
