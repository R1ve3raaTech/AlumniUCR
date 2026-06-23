'use client';

// Indicador de pasos del flujo de CV, compartido en las 3 pantallas:
// 1 Elegir plantilla → 2 Ingresá tus datos → 3 Descargar currículum.
// Clickeable: permite saltar entre pasos.

import React from 'react';
import Link from 'next/link';

const PASOS = [
  { n: 1, label: 'Elegir plantilla', href: '/mi-curriculum/plantillas' },
  { n: 2, label: 'Ingresá tus datos', href: '/mi-curriculum/editor' },
  { n: 3, label: 'Descargar currículum', href: '/mi-curriculum' },
];

export default function PasosCV({ activo }: { activo: number }) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm">
        {PASOS.map((p, i) => (
          <React.Fragment key={p.n}>
            {i > 0 && <span className="h-px w-10 bg-outline-variant sm:w-16" />}
            <Link href={p.href} className="group flex items-center gap-2">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-colors ${
                  p.n === activo
                    ? 'bg-primary text-on-primary'
                    : p.n < activo
                      ? 'bg-secondary text-on-secondary'
                      : 'border border-outline-variant bg-surface-container-high text-outline'
                }`}
              >
                {p.n < activo ? <span className="material-symbols-outlined text-base">check</span> : p.n}
              </span>
              <span className={p.n === activo ? 'font-body-semibold text-primary' : 'text-outline group-hover:text-primary'}>
                {p.label}
              </span>
            </Link>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
