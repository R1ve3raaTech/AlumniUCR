'use client';

import React, { useState } from 'react';

export default function EjemploToggle({ titulo, texto }: { titulo: string; texto: string }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-body-semibold text-secondary hover:underline"
      >
        <span className="material-symbols-outlined text-sm">{abierto ? 'visibility_off' : 'lightbulb'}</span>
        {abierto ? 'Ocultar ejemplo' : `Ver ejemplo de ${titulo}`}
      </button>
      {abierto && (
        <div className="mt-2 whitespace-pre-wrap rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 text-xs italic text-on-surface-variant">
          {texto}
        </div>
      )}
    </div>
  );
}
