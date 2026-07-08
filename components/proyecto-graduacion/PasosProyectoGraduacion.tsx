'use client';

// Indicador de pasos del asistente de Proyecto de Graduación (9 pantallas).
// Mismo patrón que components/student/PasosCV.tsx: círculos numerados
// conectados por una línea, clickeables para saltar entre pasos.

import React from 'react';
import Link from 'next/link';

export const PASOS_PROYECTO_GRADUACION = [
  { n: 1, label: 'Información del proyecto', href: '/proyecto-graduacion/informacion' },
  { n: 2, label: 'Modalidad', href: '/proyecto-graduacion/modalidad' },
  { n: 3, label: 'Introducción', href: '/proyecto-graduacion/introduccion' },
  { n: 4, label: 'Objetivos', href: '/proyecto-graduacion/objetivos' },
  { n: 5, label: 'Marco Teórico', href: '/proyecto-graduacion/marco-teorico' },
  { n: 6, label: 'Metodología', href: '/proyecto-graduacion/metodologia' },
  { n: 7, label: 'Referencias', href: '/proyecto-graduacion/referencias' },
  { n: 8, label: 'Cronograma', href: '/proyecto-graduacion/cronograma' },
  { n: 9, label: 'Vista previa', href: '/proyecto-graduacion/vista-previa' },
];

export default function PasosProyectoGraduacion({ activo }: { activo: number }) {
  return (
    <div className="flex justify-center overflow-x-auto pb-2">
      <div className="flex items-center gap-2 text-sm">
        {PASOS_PROYECTO_GRADUACION.map((p, i) => (
          <React.Fragment key={p.n}>
            {i > 0 && <span className="h-px w-6 shrink-0 bg-outline-variant sm:w-10" />}
            <Link href={p.href} className="group flex shrink-0 flex-col items-center gap-1.5" title={p.label}>
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
              <span
                className={`max-w-[5.5rem] text-center text-[0.7rem] leading-tight ${
                  p.n === activo ? 'font-body-semibold text-primary' : 'text-outline group-hover:text-primary'
                }`}
              >
                {p.label}
              </span>
            </Link>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
