'use client';

import AsistentePasoLayout from '@/components/proyecto-graduacion/AsistentePasoLayout';
import { inputCls } from '@/components/proyecto-graduacion/Campo';
import { useProyectoGraduacion } from '@/context/ProyectoGraduacionContext';

export default function ReferenciasProyectoPage() {
  const { proyecto, actualizar } = useProyectoGraduacion();

  function actualizarReferencia(i: number, valor: string) {
    const copia = [...proyecto.referencias];
    copia[i] = valor;
    actualizar({ referencias: copia });
  }

  function agregarReferencia() {
    actualizar({ referencias: [...proyecto.referencias, ''] });
  }

  function quitarReferencia(i: number) {
    actualizar({ referencias: proyecto.referencias.filter((_, j) => j !== i) });
  }

  return (
    <AsistentePasoLayout paso={7} titulo="Referencias">
      <p className="mb-4 text-sm text-on-surface-variant">
        Agregá las referencias bibliográficas de tu proyecto (formato APA recomendado).
      </p>

      <div className="space-y-3">
        {proyecto.referencias.map((ref, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls}
              value={ref}
              onChange={(e) => actualizarReferencia(i, e.target.value)}
              placeholder={`Referencia ${i + 1} (ej. Apellido, A. (Año). Título. Editorial.)`}
            />
            <button
              type="button"
              onClick={() => quitarReferencia(i)}
              aria-label="Quitar referencia"
              className="shrink-0 rounded-lg border border-outline-variant/40 px-3 text-on-surface-variant transition hover:border-error hover:text-error"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={agregarReferencia}
        className="mt-4 flex items-center gap-1 rounded-lg border border-dashed border-outline-variant/50 px-4 py-2 text-sm font-body-semibold text-secondary transition hover:bg-secondary-container/20"
      >
        <span className="material-symbols-outlined text-base">add</span>
        Agregar referencia
      </button>
    </AsistentePasoLayout>
  );
}
