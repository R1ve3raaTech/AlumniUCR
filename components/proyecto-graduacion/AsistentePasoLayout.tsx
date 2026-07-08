'use client';

// Shell compartido por las 8 pantallas del asistente de Proyecto de
// Graduación: stepper + barra de progreso + tarjeta informativa + botones
// de navegación (Anterior/Siguiente) + "Guardar borrador". El guardado
// automático ya ocurre en cada cambio de campo (ProyectoGraduacionContext.actualizar
// persiste a localStorage al instante); el botón "Guardar borrador" solo da
// una confirmación explícita al usuario.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import PasosProyectoGraduacion, { PASOS_PROYECTO_GRADUACION } from './PasosProyectoGraduacion';
import ChecklistReglamento from './ChecklistReglamento';
import { useProyectoGraduacion, calcularPorcentajeCompletitud } from '@/context/ProyectoGraduacionContext';

export default function AsistentePasoLayout({
  paso,
  titulo,
  children,
}: {
  paso: number;
  titulo: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { proyecto } = useProyectoGraduacion();
  const [guardando, setGuardando] = useState(false);
  const porcentaje = calcularPorcentajeCompletitud(proyecto);

  const anterior = PASOS_PROYECTO_GRADUACION.find((p) => p.n === paso - 1);
  const siguiente = PASOS_PROYECTO_GRADUACION.find((p) => p.n === paso + 1);

  function guardarBorrador() {
    // El guardado real ya sucede en cada onChange (actualizar() persiste a
    // localStorage); esto solo confirma explícitamente al usuario que su
    // avance no se pierde.
    setGuardando(true);
    notificar('Borrador guardado.');
    setTimeout(() => setGuardando(false), 600);
  }

  return (
    <StudentShell active="proyecto-graduacion">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <PasosProyectoGraduacion activo={paso} />

        {/* Barra de progreso general del documento */}
        <div className="mt-6 mb-2 flex items-center justify-between text-xs font-body-semibold text-on-surface-variant">
          <span>Progreso del proyecto</span>
          <span>{porcentaje}% completado</span>
        </div>
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-300"
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        {/* Tarjeta informativa de elegibilidad — visible en todos los pasos */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <span className="material-symbols-outlined text-amber-600">info</span>
          <p>
            Para presentar la propuesta debe haberse aprobado al menos el <strong>75% de los créditos</strong> del
            plan de estudios.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-[0_2px_12px_-4px_rgba(0,40,55,0.08)] sm:p-6">
              <h1 className="mb-5 font-brand-heading text-xl font-bold text-on-surface">{titulo}</h1>
              {children}
            </div>

            {/* Navegación siguiente / anterior */}
            <div className="mt-6 flex items-center justify-between gap-3">
              {anterior ? (
                <button
                  type="button"
                  onClick={() => router.push(anterior.href)}
                  className="flex items-center gap-1 rounded-lg border border-outline-variant/40 px-4 py-2.5 text-sm font-body-semibold text-on-surface-variant transition hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Anterior
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={guardarBorrador}
                disabled={guardando}
                className="flex items-center gap-1 rounded-lg border border-outline-variant/40 px-4 py-2.5 text-sm font-body-semibold text-on-surface-variant transition hover:bg-surface-container-high disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-base">save</span>
                {guardando ? 'Guardando…' : 'Guardar borrador'}
              </button>

              {siguiente ? (
                <button
                  type="button"
                  onClick={() => router.push(siguiente.href)}
                  className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-body-semibold text-on-primary transition hover:opacity-90"
                >
                  Siguiente
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ) : (
                <span />
              )}
            </div>
          </div>

          {/* Panel lateral: checklist del Reglamento (se oculta en móvil arriba, aparece abajo del todo) */}
          <div className="order-first lg:order-none">
            <ChecklistReglamento />
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
