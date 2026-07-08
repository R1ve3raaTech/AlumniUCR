'use client';

import { useRouter } from 'next/navigation';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import PasosProyectoGraduacion from '@/components/proyecto-graduacion/PasosProyectoGraduacion';
import ChecklistReglamento from '@/components/proyecto-graduacion/ChecklistReglamento';
import {
  useProyectoGraduacion,
  calcularPorcentajeCompletitud,
  calcularApartadosFaltantes,
} from '@/context/ProyectoGraduacionContext';

// Recomendaciones simples basadas en el estado real del proyecto — no vienen
// de IA, son reglas fijas (evitar redacciones muy cortas, objetivos sin
// verbo medible, etc.).
const VERBOS_MEDIBLES = ['analizar', 'diseñar', 'evaluar', 'implementar', 'comparar', 'determinar', 'identificar'];

function generarRecomendaciones(p: ReturnType<typeof useProyectoGraduacion>['proyecto']): string[] {
  const recs: string[] = [];
  if (p.planteamientoProblema && p.planteamientoProblema.trim().length < 120) {
    recs.push('El planteamiento del problema es muy breve — considerá ampliarlo con más contexto.');
  }
  if (p.objetivosEspecificos.length > 0) {
    const invalidos = p.objetivosEspecificos.filter((o) => {
      const primera = o.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
      return o.trim() && !VERBOS_MEDIBLES.includes(primera);
    });
    if (invalidos.length > 0) {
      recs.push(`Hay ${invalidos.length} objetivo(s) específico(s) que no inician con un verbo medible.`);
    }
  }
  if (p.referencias.filter((r) => r.trim()).length > 0 && p.referencias.filter((r) => r.trim()).length < 3) {
    recs.push('Se recomiendan al menos 3 referencias bibliográficas para sustentar el marco teórico.');
  }
  if (p.cronograma.length > 0 && p.cronograma.some((c) => !c.inicio || !c.fin)) {
    recs.push('Hay actividades del cronograma sin fecha de inicio o fin definida.');
  }
  if (recs.length === 0) {
    recs.push('No se detectaron observaciones adicionales. ¡Buen trabajo!');
  }
  return recs;
}

function generarHtmlAcademico(p: ReturnType<typeof useProyectoGraduacion>['proyecto']): string {
  const lista = (arr: string[]) => arr.filter((x) => x.trim()).map((x) => `<li>${x}</li>`).join('');
  return `
    <h1>${p.titulo || '(Sin título)'}</h1>
    <p><em>${p.descripcion || ''}</em></p>
    <p><strong>Área temática:</strong> ${p.areaTematica || '—'} &nbsp; <strong>Modalidad:</strong> ${p.modalidad || '—'} &nbsp; <strong>Avance:</strong> ${p.porcentajeAvance}%</p>
    <h2>1. Introducción</h2>
    <p><strong>Planteamiento del problema:</strong> ${p.planteamientoProblema || '—'}</p>
    <p><strong>Delimitación:</strong> ${p.delimitacion || '—'}</p>
    <p><strong>Justificación:</strong> ${p.justificacion || '—'}</p>
    <h2>2. Objetivos</h2>
    <p><strong>Objetivo general:</strong> ${p.objetivoGeneral || '—'}</p>
    <p><strong>Objetivos específicos:</strong></p>
    <ul>${lista(p.objetivosEspecificos) || '<li>—</li>'}</ul>
    <h2>3. Marco Teórico</h2>
    <p>${p.marcoTeorico || '—'}</p>
    <h2>4. Metodología</h2>
    <p>${p.metodologia || '—'}</p>
    <h2>5. Referencias</h2>
    <ul>${lista(p.referencias) || '<li>—</li>'}</ul>
    <h2>6. Cronograma</h2>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
      <tr><th>Actividad</th><th>Inicio</th><th>Fin</th></tr>
      ${p.cronograma.map((c) => `<tr><td>${c.actividad || '—'}</td><td>${c.inicio || '—'}</td><td>${c.fin || '—'}</td></tr>`).join('') || '<tr><td colspan="3">—</td></tr>'}
    </table>
  `;
}

export default function VistaPreviaProyectoPage() {
  const router = useRouter();
  const { proyecto } = useProyectoGraduacion();
  const porcentaje = calcularPorcentajeCompletitud(proyecto);
  const faltantes = calcularApartadosFaltantes(proyecto);
  const recomendaciones = generarRecomendaciones(proyecto);
  const puedeFinalizar = faltantes.length === 0;

  function exportarPDF() {
    window.print();
  }

  function exportarWord() {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${generarHtmlAcademico(proyecto)}</body></html>`;
    const blob = new Blob(['﻿', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(proyecto.titulo || 'proyecto-graduacion').replace(/\s+/g, '-')}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notificar('Documento Word generado.');
  }

  function guardarBorrador() {
    notificar('Borrador guardado.');
  }

  function finalizarPropuesta() {
    if (!puedeFinalizar) return;
    notificar('¡Propuesta completa! Ya podés exportarla.');
  }

  return (
    <StudentShell active="proyecto-graduacion">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 print:max-w-none print:px-0">
        <div className="print:hidden">
          <PasosProyectoGraduacion activo={9} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px] print:block">
          <div>
            {/* ── Revisión Final ── */}
            <section className="mb-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-[0_2px_12px_-4px_rgba(0,40,55,0.08)] print:hidden sm:p-6">
              <h1 className="mb-4 font-brand-heading text-xl font-bold text-on-surface">Revisión Final</h1>

              <div className="mb-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                  <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${porcentaje}%` }} />
                </div>
                <span className="text-sm font-body-semibold text-on-surface">{porcentaje}%</span>
              </div>

              {faltantes.length > 0 ? (
                <div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
                  <p className="mb-1 font-body-semibold">No se puede finalizar la propuesta. Faltan estos apartados:</p>
                  <ul className="list-inside list-disc">
                    {faltantes.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary-container/20 p-3 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                  Todos los apartados obligatorios están completos.
                </div>
              )}

              <div className="mb-4">
                <p className="mb-1.5 text-sm font-body-semibold text-on-surface">Recomendaciones</p>
                <ul className="list-inside list-disc text-sm text-on-surface-variant">
                  {recomendaciones.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={finalizarPropuesta}
                  disabled={!puedeFinalizar}
                  className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-body-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  title={!puedeFinalizar ? 'Completá los apartados faltantes primero' : undefined}
                >
                  <span className="material-symbols-outlined text-base">task_alt</span>
                  Finalizar propuesta
                </button>
                <button
                  type="button"
                  onClick={guardarBorrador}
                  className="flex items-center gap-1 rounded-lg border border-outline-variant/40 px-4 py-2.5 text-sm font-body-semibold text-on-surface-variant transition hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  Guardar borrador
                </button>
                <button
                  type="button"
                  onClick={exportarPDF}
                  className="flex items-center gap-1 rounded-lg border border-outline-variant/40 px-4 py-2.5 text-sm font-body-semibold text-on-surface-variant transition hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                  Exportar PDF
                </button>
                <button
                  type="button"
                  onClick={exportarWord}
                  className="flex items-center gap-1 rounded-lg border border-outline-variant/40 px-4 py-2.5 text-sm font-body-semibold text-on-surface-variant transition hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  Exportar Word
                </button>
              </div>
            </section>

            {/* ── Vista previa con formato académico (esto es lo que se imprime/exporta) ── */}
            <section
              id="vista-previa-academica"
              className="rounded-2xl border border-outline-variant/40 bg-white p-6 leading-relaxed text-on-surface shadow-[0_2px_12px_-4px_rgba(0,40,55,0.08)] print:rounded-none print:border-none print:shadow-none sm:p-8 [&_h1]:mb-2 [&_h1]:font-brand-heading [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-brand-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary [&_p]:mb-2 [&_table]:mt-2 [&_ul]:mb-2 [&_ul]:list-inside [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: generarHtmlAcademico(proyecto) }}
            />

            <div className="mt-6 flex items-center justify-start print:hidden">
              <button
                type="button"
                onClick={() => router.push('/proyecto-graduacion/cronograma')}
                className="flex items-center gap-1 rounded-lg border border-outline-variant/40 px-4 py-2.5 text-sm font-body-semibold text-on-surface-variant transition hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Anterior
              </button>
            </div>
          </div>

          <div className="order-first print:hidden lg:order-none">
            <ChecklistReglamento />
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
