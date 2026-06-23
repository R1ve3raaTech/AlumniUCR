'use client';

// Cabecera inmersiva estilo app: foto de fondo + degradado + estado en línea +
// nombre/subtítulo, con una tarjeta "glass" de estadísticas superpuesta.
// Compartida por Mi Perfil y CV del estudiante.

import React from 'react';

export default function PerfilHeader({
  nombre, nombreCompacto, subtitulo, foto, stats,
}: {
  nombre: string;
  nombreCompacto: string;
  subtitulo: string;
  foto?: string;
  stats: { label: string; valor: string }[];
}) {
  return (
    <>
      <div className="relative h-60 overflow-hidden rounded-3xl sm:h-72">
        {foto ? (
          <img src={foto} alt={nombre} className="absolute inset-0 h-full w-full object-cover object-top" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(rgba(0,76,99,0) 0%, rgba(0,76,99,0.4) 50%, rgba(0,76,99,0.92) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span className="text-xs font-medium uppercase tracking-widest opacity-90">En línea</span>
          </div>
          <h1 className="font-headline-md text-3xl font-extrabold tracking-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{nombreCompacto}</h1>
          <p className="text-lg font-light opacity-90">{subtitulo}</p>
        </div>
      </div>
      <div className="relative z-10 mx-4 -mt-9 flex items-center justify-around rounded-3xl border border-white/40 bg-white/70 p-4 text-center shadow-[0_10px_30px_-10px_rgba(0,76,99,0.18)] backdrop-blur-md">
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div className="h-8 w-px bg-outline-variant/60" />}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/60">{s.label}</p>
              <p className="text-xl font-bold text-primary">{s.valor}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
