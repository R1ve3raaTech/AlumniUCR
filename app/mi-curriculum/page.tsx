'use client';

// CV + IA (estudiante) — rediseño Stitch (estático). CV estilo Harvard + columna
// de IA Asistente de Carrera. Contenido de ejemplo; datos reales en otra etapa.

import React from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import CvDocumento from '@/components/student/CvDocumento';
import { notificar } from '@/components/student/Toast';

const AI_GLOW = 'shadow-[0_0_15px_rgba(84,188,235,0.3)]';

// Aviso temporal: los botones aún no tienen acción real (handler delegado).
function avisoProximamente(e: React.MouseEvent) {
  const el = (e.target as HTMLElement).closest('button, a[href="#"]');
  if (el && !el.hasAttribute('data-real')) {
    e.preventDefault();
    notificar('🚧 Función en desarrollo');
  }
}

export default function MiCurriculumPage() {
  return (
    <StudentShell active="cv">
      <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-8 p-6" onClick={avisoProximamente}>
        {/* ── CV (izquierda/centro) ── */}
        <section className="col-span-12 lg:col-span-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-headline-md text-3xl text-primary">CV Académico</h2>
              <p className="text-on-surface-variant">Refinado estilo Harvard · Última actualización: Hoy</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                data-real
                onClick={() => window.print()}
                title="Exportar o imprimir el CV (Ctrl+P)"
                className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2 font-bold text-primary transition-colors hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined">download</span> Exportar PDF
              </button>
              <Link
                href="/mi-curriculum/crear"
                data-real
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white transition-all hover:shadow-lg"
              >
                <span className="material-symbols-outlined">edit</span> Editar Manualmente
              </Link>
            </div>
          </div>

          {/* CV editado (refleja la fuente única); id para imprimir/exportar */}
          <div id="cv-print">
            <CvDocumento />
          </div>
        </section>

        {/* ── IA Asistente de Carrera (derecha) ── */}
        <section className="col-span-12 space-y-6 lg:col-span-4">
          {/* Estado IA */}
          <div className={`relative overflow-hidden rounded-xl bg-primary p-6 text-white ${AI_GLOW}`}>
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined animate-pulse text-secondary-fixed">auto_awesome</span>
                <h3 className="text-lg font-bold">IA Asistente de Carrera</h3>
              </div>
              <div className="mb-4 rounded-lg border border-secondary-fixed/30 bg-primary-container/40 p-3">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-secondary-fixed">Estado Actual</p>
                <p className="text-sm italic">
                  &quot;Analizando tendencias del mercado y proyectando tu perfil para vacantes Senior en Cloud Computing...&quot;
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-fixed py-3 text-sm font-bold text-primary transition-all hover:scale-[1.02] active:scale-95">
                  <span className="material-symbols-outlined text-sm">rocket_launch</span> Optimizar para Vacante
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-sm font-bold text-white transition-all hover:bg-white/20">
                  <span className="material-symbols-outlined text-sm">update</span> Actualizar Logros
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-sm font-bold text-white transition-all hover:bg-white/20">
                  <span className="material-symbols-outlined text-sm">workspace_premium</span> Sugerir Certificaciones
                </button>
              </div>
            </div>
          </div>

          {/* Inteligencia de Mercado */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 font-bold text-primary">
              <span className="material-symbols-outlined">query_stats</span> Inteligencia de Mercado
            </h4>
            <div className="space-y-4">
              <div className="rounded-lg border-l-4 border-secondary bg-surface-container-low p-3">
                <p className="mb-1 text-xs font-bold uppercase text-secondary">Benchmarking Salarial</p>
                <p className="text-sm font-semibold">Ingeniería de Software Senior</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-outline-variant/30">
                  <div className="h-full w-3/4 bg-secondary" />
                </div>
                <p className="mt-1 text-xs text-on-surface-variant">Tu perfil está en el top 15% de competitividad.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-1 text-sm text-secondary">trending_up</span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Demanda en IA crece +45%</p>
                    <p className="text-xs leading-tight text-on-surface-variant">Las empresas en Zona Franca buscan especialistas en RAG.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-1 text-sm text-secondary">newsmode</span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Expansión de Hub Tecnológico</p>
                    <p className="text-xs leading-tight text-on-surface-variant">Nueva sede de Amazon anuncia 500 puestos técnicos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proyección de Perfil */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 font-bold text-primary">
              <span className="material-symbols-outlined">psychology</span> Proyección de Perfil
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 font-bold text-secondary">92%</div>
                <div>
                  <p className="text-xs font-bold">Match: Cloud Architect @ Microsoft</p>
                  <p className="text-xs text-on-surface-variant">IA optimizó palabras clave de &apos;Back-end&apos; a &apos;Infrastructure&apos;.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-emerald-600">88%</div>
                <div>
                  <p className="text-xs font-bold">Match: Lead Dev @ Gorilla Logic</p>
                  <p className="text-xs text-on-surface-variant">IA enfatizó liderazgo en proyectos de Hacienda Labs.</p>
                </div>
              </div>
              <div className="border-t border-outline-variant/20 pt-2">
                <p className="text-xs italic text-on-surface-variant">
                  &quot;Sugerencia IA: Obtén la certificación AWS Solutions Architect para llegar al 98% de match.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
