'use client';

// Tarjeta-sección desplegable (acordeón) con mucho diseño: barra de acento
// lateral, ícono en caja con degradado, ícono decorativo de fondo, chevron en
// círculo y hover premium. Compartida por las pantallas del estudiante.

import React, { useState } from 'react';

const SHADOW = 'shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';

// Tonos de marca por sección (clases estáticas para no perderlas en el purge).
export const TONOS: Record<string, { grad: string; borde: string; tinte: string; sombra: string }> = {
  secondary: { grad: 'from-[#006687] to-[#54bceb]', borde: 'hover:border-secondary/60', tinte: 'bg-secondary/10', sombra: 'group-hover:shadow-[0_18px_40px_-16px_rgba(0,102,135,0.45)]' },
  primary: { grad: 'from-[#003445] to-[#006687]', borde: 'hover:border-primary/60', tinte: 'bg-primary/10', sombra: 'group-hover:shadow-[0_18px_40px_-16px_rgba(0,52,69,0.5)]' },
  tertiary: { grad: 'from-[#007d67] to-[#46c9a8]', borde: 'hover:border-tertiary/60', tinte: 'bg-tertiary/10', sombra: 'group-hover:shadow-[0_18px_40px_-16px_rgba(0,125,103,0.45)]' },
  amber: { grad: 'from-[#a05a00] to-[#f0a823]', borde: 'hover:border-amber-500/60', tinte: 'bg-amber-500/10', sombra: 'group-hover:shadow-[0_18px_40px_-16px_rgba(176,107,0,0.45)]' },
  error: { grad: 'from-[#ba1a1a] to-[#ff7a6e]', borde: 'hover:border-error/60', tinte: 'bg-error/10', sombra: 'group-hover:shadow-[0_18px_40px_-16px_rgba(186,26,26,0.4)]' },
};

export default function Desplegable({
  titulo, icono, resumen, defaultOpen = false, tono = 'secondary', children,
}: {
  titulo: string;
  icono?: string;
  resumen?: string;
  defaultOpen?: boolean;
  tono?: keyof typeof TONOS;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(defaultOpen);
  const t = TONOS[tono] ?? TONOS.secondary;
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest ${SHADOW} ${t.sombra} ${t.borde} transition-all duration-300 hover:-translate-y-1`}>
      <span className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${t.grad}`} aria-hidden />
      {icono && (
        <span className="material-symbols-outlined pointer-events-none absolute -right-4 -top-5 select-none text-[7.5rem] leading-none text-on-surface/[0.04]" aria-hidden>{icono}</span>
      )}
      <button
        type="button"
        data-real
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="relative flex w-full items-center justify-between gap-3 p-4 pl-5 text-left sm:p-5 sm:pl-6"
      >
        <span className="flex min-w-0 items-center gap-3 sm:gap-4">
          {icono && (
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.grad} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}>
              <span className="material-symbols-outlined">{icono}</span>
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-body-semibold text-on-surface">{titulo}</span>
            {resumen && <span className="truncate text-xs text-on-surface-variant">{resumen}</span>}
          </span>
        </span>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${t.tinte} text-on-surface-variant transition-transform duration-300 ${abierto ? 'rotate-180' : ''}`}>
          <span className="material-symbols-outlined text-[20px]">expand_more</span>
        </span>
      </button>
      <div className={abierto ? 'relative border-t border-outline-variant/40 p-4 pl-5 sm:p-5 sm:pl-6' : 'hidden'}>{children}</div>
    </div>
  );
}
