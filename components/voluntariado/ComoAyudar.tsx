'use client';

// Sección "Cómo puedes ayudar": 4 formas de colaborar. Al elegir una, se
// preselecciona ese tipo de ayuda en el formulario de abajo y se hace scroll
// hasta él — mejora directa de UX (menos clics para llegar al formulario).

import React from 'react';
import type { TipoAyuda } from './FormularioAyuda';

const TARJETAS: { tipo: TipoAyuda; icono: string; titulo: string; texto: string }[] = [
  {
    tipo: 'donacion',
    icono: 'volunteer_activism',
    titulo: 'Donar',
    texto: 'Un aporte económico, único o recurrente, para becas y proyectos estudiantiles.',
  },
  {
    tipo: 'pasantia',
    icono: 'work',
    titulo: 'Pasantías',
    texto: 'Abrí un espacio en tu empresa para que un estudiante gane experiencia real.',
  },
  {
    tipo: 'mentoria',
    icono: 'handshake',
    titulo: 'Mentoría',
    texto: 'Guiá a un estudiante con tu experiencia profesional y de vida universitaria.',
  },
  {
    tipo: 'taller',
    icono: 'school',
    titulo: 'Talleres',
    texto: 'Compartí una charla o taller sobre un tema que domines con la comunidad.',
  },
];

export default function ComoAyudar({ onElegir }: { onElegir: (tipo: TipoAyuda) => void }) {
  return (
    <section id="ayudar" className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-brand-heading text-3xl font-bold text-ucr-primary">Cómo puedes ayudar</h2>
        <p className="mt-2 text-ucr-on-surface-variant">
          Elegí la forma de colaborar que más se ajuste a vos — el formulario se adapta automáticamente.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TARJETAS.map((t) => (
          <button
            key={t.tipo}
            type="button"
            onClick={() => onElegir(t.tipo)}
            className="flex flex-col items-start gap-3 rounded-3xl border border-ucr-outline-variant bg-white p-6 text-left shadow-[0_2px_12px_-4px_rgba(0,40,55,0.08)] transition-all hover:-translate-y-1 hover:border-ucr-secondary hover:shadow-[0_8px_24px_-10px_rgba(0,40,55,0.18)]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ucr-secondary/10 text-ucr-secondary">
              <span className="material-symbols-outlined">{t.icono}</span>
            </span>
            <h3 className="font-brand-heading text-lg font-bold text-ucr-primary">{t.titulo}</h3>
            <p className="text-sm text-ucr-on-surface-variant">{t.texto}</p>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-ucr-naranja">
              Quiero ayudar así <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
