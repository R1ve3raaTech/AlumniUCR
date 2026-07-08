'use client';

// Placeholder visual de cada paso del asistente de Proyecto de Graduación.
// Comunica que la navegación ya está integrada, pero el formulario real de
// esta sección se construye en una tarea siguiente (no forma parte de esta
// integración inicial).

import React from 'react';

export default function SeccionPlaceholder({
  titulo,
  descripcion,
  icono = 'construction',
}: {
  titulo: string;
  descripcion: string;
  icono?: string;
}) {
  return (
    <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
      <span className="material-symbols-outlined text-4xl text-secondary">{icono}</span>
      <h2 className="font-brand-heading text-xl font-bold text-on-surface">{titulo}</h2>
      <p className="text-sm text-on-surface-variant">{descripcion}</p>
      <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-wide text-on-secondary-container">
        Próximamente
      </span>
    </div>
  );
}
