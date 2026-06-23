'use client';

// CV + IA (estudiante) — mismo lenguaje visual que Mi Perfil: cabecera inmersiva
// + stats glass + tarjetas-acordeón premium. Conserva la vista previa real del CV
// y la exportación a PDF (#cv-print + @media print).

import React from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import CvDocumento from '@/components/student/CvDocumento';
import PasosCV from '@/components/student/PasosCV';
import Desplegable from '@/components/student/Desplegable';
import PerfilHeader from '@/components/student/PerfilHeader';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';

// Aviso temporal: los botones sin acción real (los reales llevan data-real).
function avisoProximamente(e: React.MouseEvent) {
  const el = (e.target as HTMLElement).closest('button, a[href="#"]');
  if (el && !el.hasAttribute('data-real')) {
    e.preventDefault();
    notificar('🚧 Función en desarrollo');
  }
}

const cuenta = (s: string) => (s || '').split(',').map((x) => x.trim()).filter(Boolean).length;

export default function MiCurriculumPage() {
  const { perfil } = usePerfilEstudiante();
  const o = (v: string, d = '—') => (v && v.trim() ? v : d);
  const nombre = `${perfil.nombre} ${perfil.apellidos}`.trim() || 'Estudiante';
  const nombreCompacto = perfil.apellidos?.trim()
    ? `${(perfil.nombre || '').trim().split(/\s+/)[0]} ${perfil.apellidos.trim().charAt(0).toUpperCase()}.`
    : (perfil.nombre || 'Estudiante');
  const habilidades = cuenta(perfil.habilidadesTecnicas) + cuenta(perfil.habilidadesBlandas);

  return (
    <StudentShell active="cv">
      {/* Indicador de pasos (paso 3: descargar) */}
      <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6 print:hidden">
        <PasosCV activo={3} />
      </div>

      <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-5 p-4 sm:p-6 print:hidden" onClick={avisoProximamente}>
        {/* Header inmersivo + stats */}
        <div className="col-span-12">
          <PerfilHeader
            nombre={nombre}
            nombreCompacto={nombreCompacto}
            subtitulo={`Estudiante · ${o(perfil.carrera)}`}
            foto={perfil.foto}
            stats={[
              { label: 'Experiencias', valor: String(perfil.experiencias.length).padStart(2, '0') },
              { label: 'Habilidades', valor: String(habilidades).padStart(2, '0') },
              { label: 'Idiomas', valor: String(cuenta(perfil.idiomas)).padStart(2, '0') },
            ]}
          />
        </div>

        {/* ── Izquierda: acciones + vista previa ── */}
        <section className="col-span-12 flex flex-col gap-5 lg:col-span-8">
          <Desplegable titulo="Acciones del CV" icono="tune" tono="secondary" resumen="Exportar · editar · plantilla" defaultOpen>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button type="button" data-real onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-xl border border-outline px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-variant">
                <span className="material-symbols-outlined">download</span> Exportar PDF
              </button>
              <Link href="/mi-curriculum/crear" data-real className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-on-primary transition-transform hover:-translate-y-0.5">
                <span className="material-symbols-outlined">edit</span> Editar
              </Link>
              <Link href="/mi-curriculum/plantillas" data-real className="flex items-center justify-center gap-2 rounded-xl border border-outline px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-variant">
                <span className="material-symbols-outlined">palette</span> Plantilla
              </Link>
            </div>
          </Desplegable>

          <Desplegable titulo="Vista previa del CV" icono="description" tono="primary" resumen="Estilo Harvard · refleja tus datos" defaultOpen>
            <CvDocumento />
          </Desplegable>
        </section>

        {/* ── Derecha: IA de carrera ── */}
        <section className="col-span-12 flex flex-col gap-5 lg:col-span-4">
          <Desplegable titulo="Asistente de IA" icono="auto_awesome" tono="primary" resumen="Optimizá tu CV" defaultOpen>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-3">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-secondary">Estado actual</p>
                <p className="text-sm italic text-on-surface-variant">Analizando el mercado para proyectar tu perfil hacia vacantes afines a {o(perfil.carrera, 'tu carrera')}.</p>
              </div>
              <button type="button" data-real onClick={() => window.dispatchEvent(new Event('open-global-chatbot'))} className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-bold text-on-primary transition-transform hover:-translate-y-0.5">
                <span className="material-symbols-outlined">smart_toy</span> Abrir asistente
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant py-2.5 text-sm font-bold text-primary"><span className="material-symbols-outlined text-base">rocket_launch</span> Optimizar para vacante</button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant py-2.5 text-sm font-bold text-primary"><span className="material-symbols-outlined text-base">workspace_premium</span> Sugerir certificaciones</button>
            </div>
          </Desplegable>

          <Desplegable titulo="Inteligencia de Mercado" icono="query_stats" tono="secondary" resumen="Demanda y salario">
            <div className="space-y-4">
              <div className="rounded-lg border-l-4 border-secondary bg-surface-container-low p-3">
                <p className="mb-1 text-xs font-bold uppercase text-secondary">Benchmarking salarial</p>
                <p className="text-sm font-semibold">{o(perfil.carrera, 'Tu carrera')} · Nivel competitivo</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-outline-variant/30"><div className="h-full w-3/4 bg-secondary" /></div>
                <p className="mt-1 text-xs text-on-surface-variant">Tu perfil está en el top 15% de competitividad.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 text-sm text-secondary">trending_up</span>
                <div><p className="text-xs font-bold text-on-surface">Demanda en IA crece +45%</p><p className="text-xs leading-tight text-on-surface-variant">Las empresas en Zona Franca buscan especialistas.</p></div>
              </div>
            </div>
          </Desplegable>

          <Desplegable titulo="Proyección de Perfil" icono="psychology" tono="tertiary" resumen="Tus mejores matches">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary/10 font-bold text-secondary">92%</span>
                <div><p className="text-xs font-bold">Cloud Architect @ Microsoft</p><p className="text-xs text-on-surface-variant">Palabras clave optimizadas por IA.</p></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/10 font-bold text-emerald-600">88%</span>
                <div><p className="text-xs font-bold">Lead Dev @ Gorilla Logic</p><p className="text-xs text-on-surface-variant">IA enfatizó tu liderazgo.</p></div>
              </div>
              <p className="border-t border-outline-variant/20 pt-2 text-xs italic text-on-surface-variant">Sugerencia: obtené la certificación AWS para llegar al 98% de match.</p>
            </div>
          </Desplegable>
        </section>
      </div>

      {/* Documento para impresión/exportación (solo visible al imprimir) */}
      <div id="cv-print" className="hidden bg-white print:block">
        <CvDocumento />
      </div>
    </StudentShell>
  );
}
