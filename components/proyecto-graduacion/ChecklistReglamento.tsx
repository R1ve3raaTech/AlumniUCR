'use client';

// Panel lateral con el checklist de los 6 apartados obligatorios del
// Reglamento de Trabajos Finales de Graduación. Se marca automáticamente
// según el contenido real del proyecto (calcularChecklistReglamento).

import { useProyectoGraduacion, calcularChecklistReglamento, calcularPorcentajeCompletitud } from '@/context/ProyectoGraduacionContext';

export default function ChecklistReglamento() {
  const { proyecto } = useProyectoGraduacion();
  const checklist = calcularChecklistReglamento(proyecto);
  const porcentaje = calcularPorcentajeCompletitud(proyecto);

  return (
    <aside className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-[0_2px_12px_-4px_rgba(0,40,55,0.08)]">
      <h2 className="mb-1 font-brand-heading text-sm font-bold uppercase tracking-wide text-on-surface">
        Checklist del Reglamento
      </h2>
      <p className="mb-4 text-xs text-on-surface-variant">{porcentaje}% completado</p>
      <ul className="space-y-2.5">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm">
            <span
              className={`material-symbols-outlined text-lg ${item.completo ? 'text-secondary' : 'text-outline-variant'}`}
            >
              {item.completo ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span className={item.completo ? 'text-on-surface' : 'text-on-surface-variant'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
