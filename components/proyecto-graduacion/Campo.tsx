'use client';

// Inputs reusables de los formularios del asistente, mismo estilo visual que
// app/perfil-estudiante/page.tsx (inputCls) para consistencia dentro del
// dashboard del estudiante.

import React from 'react';

export const inputCls =
  'w-full rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 font-body-semibold text-on-surface focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30';

export function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-body-semibold text-on-surface">{label}</label>
      <input
        type={type}
        className={inputCls}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}

export function CampoTextarea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  filas = 5,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  filas?: number;
}) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-body-semibold text-on-surface">{label}</label>
      <textarea
        className={inputCls}
        rows={filas}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}
