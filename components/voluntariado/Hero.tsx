'use client';

// Hero de /voluntariado: título, subtítulo y dos llamados a la acción que
// desplazan a las secciones del formulario y de "Cómo puedes ayudar"
// (sin recargar la página, scroll suave a las anclas #formulario / #ayudar).

import React from 'react';

function scrollA(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Hero() {
  return (
    <section className="overflow-hidden bg-gradient-to-br from-ucr-primary to-[#003345] px-4 py-20 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-screen-lg text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ucr-celeste">
          Red Alumni UCR
        </span>
        <h1 className="mt-5 font-brand-heading text-4xl font-extrabold leading-tight sm:text-5xl">
          Apoya a estudiantes <span className="text-ucr-celeste">UCR</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
          Tu tiempo, tu conocimiento o tu aporte pueden cambiar la trayectoria de un
          estudiante becado. Sumate como voluntario y elegí la forma de ayudar que
          mejor se acomode a vos.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => scrollA('formulario')}
            className="w-full rounded-full bg-ucr-naranja px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            Quiero ayudar
          </button>
          <button
            type="button"
            onClick={() => scrollA('ayudar')}
            className="w-full rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20 sm:w-auto"
          >
            Formas de ayudar
          </button>
        </div>
      </div>
    </section>
  );
}
