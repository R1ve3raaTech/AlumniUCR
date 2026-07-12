'use client';

// Botón "Sugerir mejora" (IA) para los 4 campos permitidos: planteamiento del
// problema, justificación, objetivo general y objetivos específicos.
// La sugerencia NUNCA reemplaza el texto automáticamente — se muestra aparte
// y el estudiante decide si la usa o la descarta (mantiene control sobre su
// propia idea, la IA solo mejora redacción).

import React, { useState } from 'react';
import { sugerirMejoraTexto, type CampoSugerible } from '@/lib/curriculum/proyectoGraduacionAsistente';

export default function SugerirMejora({
  campo,
  texto,
  onAplicar,
}: {
  campo: CampoSugerible;
  texto: string;
  onAplicar: (sugerencia: string) => void;
}) {
  const [cargando, setCargando] = useState(false);
  const [sugerencia, setSugerencia] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pedirSugerencia() {
    setCargando(true);
    setError(null);
    setSugerencia(null);
    try {
      const resultado = await sugerirMejoraTexto(campo, texto);
      setSugerencia(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la sugerencia.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={pedirSugerencia}
        disabled={cargando || !texto.trim()}
        className="flex items-center gap-1 rounded-full border border-secondary/40 bg-secondary-container/20 px-3 py-1 text-xs font-body-semibold text-secondary transition hover:bg-secondary-container/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-sm">auto_awesome</span>
        {cargando ? 'Pensando…' : 'Sugerir mejora'}
      </button>

      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}

      {sugerencia && (
        <div className="mt-2 rounded-lg border border-secondary/30 bg-secondary-container/10 p-3 text-sm">
          <p className="mb-1 text-xs font-body-semibold uppercase tracking-wide text-secondary">Sugerencia de la IA</p>
          <p className="mb-2 whitespace-pre-wrap text-on-surface">{sugerencia}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { onAplicar(sugerencia); setSugerencia(null); }}
              className="rounded-md bg-secondary px-3 py-1 text-xs font-body-semibold text-on-secondary transition hover:opacity-90"
            >
              Usar esta redacción
            </button>
            <button
              type="button"
              onClick={() => setSugerencia(null)}
              className="rounded-md border border-outline-variant/40 px-3 py-1 text-xs font-body-semibold text-on-surface-variant transition hover:bg-surface-container-high"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
