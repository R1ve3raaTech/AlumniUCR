'use client';

import AsistentePasoLayout from '@/components/proyecto-graduacion/AsistentePasoLayout';
import { inputCls } from '@/components/proyecto-graduacion/Campo';
import { useProyectoGraduacion, type CronogramaItem } from '@/context/ProyectoGraduacionContext';

export default function CronogramaProyectoPage() {
  const { proyecto, actualizar } = useProyectoGraduacion();

  function actualizarItem(i: number, campo: keyof CronogramaItem, valor: string) {
    const copia = proyecto.cronograma.map((item, j) => (j === i ? { ...item, [campo]: valor } : item));
    actualizar({ cronograma: copia });
  }

  function agregarItem() {
    actualizar({ cronograma: [...proyecto.cronograma, { actividad: '', inicio: '', fin: '' }] });
  }

  function quitarItem(i: number) {
    actualizar({ cronograma: proyecto.cronograma.filter((_, j) => j !== i) });
  }

  return (
    <AsistentePasoLayout paso={8} titulo="Cronograma">
      <p className="mb-4 text-sm text-on-surface-variant">
        Planificá las actividades principales de tu proyecto con sus fechas estimadas.
      </p>

      <div className="space-y-3">
        {proyecto.cronograma.map((item, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-outline-variant/30 p-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <input
              className={inputCls}
              value={item.actividad}
              onChange={(e) => actualizarItem(i, 'actividad', e.target.value)}
              placeholder="Actividad"
            />
            <input
              type="date"
              className={inputCls}
              value={item.inicio}
              onChange={(e) => actualizarItem(i, 'inicio', e.target.value)}
            />
            <input
              type="date"
              className={inputCls}
              value={item.fin}
              onChange={(e) => actualizarItem(i, 'fin', e.target.value)}
            />
            <button
              type="button"
              onClick={() => quitarItem(i)}
              aria-label="Quitar actividad"
              className="shrink-0 rounded-lg border border-outline-variant/40 px-3 text-on-surface-variant transition hover:border-error hover:text-error"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={agregarItem}
        className="mt-4 flex items-center gap-1 rounded-lg border border-dashed border-outline-variant/50 px-4 py-2 text-sm font-body-semibold text-secondary transition hover:bg-secondary-container/20"
      >
        <span className="material-symbols-outlined text-base">add</span>
        Agregar actividad
      </button>
    </AsistentePasoLayout>
  );
}
