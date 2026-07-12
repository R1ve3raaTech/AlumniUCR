'use client';

// Pantalla de carga de marca: el girasol gira mientras se resuelve la data.
// Se usa solo en pantallas "principales" o con carga pesada (dashboards,
// árbol de legado, etc.) — no en cada página, para no saturar la experiencia.

import React from 'react';

export default function CargandoGirasol({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background font-body-base text-on-background">
      <img
        src="/images/girasol.svg"
        alt=""
        aria-hidden
        className="h-20 w-20 animate-spin"
        style={{ animationDuration: '1.6s' }}
      />
      <p className="text-sm font-bold text-primary">{texto}</p>
    </div>
  );
}
