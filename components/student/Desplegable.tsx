'use client';

// Tarjeta-sección desplegable (acordeón) compartida por las pantallas del
// estudiante: ícono en caja con degradado, chevron en círculo y hover suave.
// Recuerda si quedó abierta o cerrada (localStorage) para que la disposición
// se mantenga al navegar entre páginas.

import React, { useEffect, useState } from 'react';

const SHADOW = 'shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';

// Tonos de marca por sección (clases estáticas para no perderlas en el purge).
export const TONOS: Record<string, { grad: string; borde: string; tinte: string; sombra: string }> = {
  secondary: { grad: 'from-[#006687] to-[#54bceb]', borde: 'hover:border-secondary/50', tinte: 'bg-secondary/10', sombra: '' },
  primary: { grad: 'from-[#003445] to-[#006687]', borde: 'hover:border-primary/50', tinte: 'bg-primary/10', sombra: '' },
  tertiary: { grad: 'from-[#007d67] to-[#46c9a8]', borde: 'hover:border-tertiary/50', tinte: 'bg-tertiary/10', sombra: '' },
  amber: { grad: 'from-[#a05a00] to-[#f0a823]', borde: 'hover:border-amber-500/50', tinte: 'bg-amber-500/10', sombra: '' },
  error: { grad: 'from-[#ba1a1a] to-[#ff7a6e]', borde: 'hover:border-error/50', tinte: 'bg-error/10', sombra: '' },
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

  // Restaura la preferencia guardada tras montar (evita mismatch de hidratación).
  useEffect(() => {
    try {
      const v = localStorage.getItem(`desplegable:${titulo}`);
      if (v !== null) setAbierto(v === '1');
    } catch {}
  }, [titulo]);

  const alternar = () =>
    setAbierto((a) => {
      const n = !a;
      try { localStorage.setItem(`desplegable:${titulo}`, n ? '1' : '0'); } catch {}
      return n;
    });

  return (
    <div className={`group relative rounded-2xl border border-outline-variant/50 bg-surface-container-lowest ${SHADOW} ${t.borde} transition-all duration-300 hover:-translate-y-0.5`}>
      <button
        type="button"
        data-real
        onClick={alternar}
        aria-expanded={abierto}
        className="relative flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
      >
        <span className="flex min-w-0 items-center gap-3 sm:gap-4">
          {icono && (
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${t.grad} text-white shadow-sm transition-transform duration-300 group-hover:scale-105`}>
              <span className="material-symbols-outlined text-[22px]">{icono}</span>
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
      <div className={abierto ? 'relative border-t border-outline-variant/30 p-4 sm:p-5' : 'hidden'}>{children}</div>
    </div>
  );
}
