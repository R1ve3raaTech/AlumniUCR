'use client';

// CV + IA (estudiante) — rediseño Stitch (estático). CV estilo Harvard + columna
// de IA Asistente de Carrera. Contenido de ejemplo; datos reales en otra etapa.

import React from 'react';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';

const CV_SHADOW = 'shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';
const AI_GLOW = 'shadow-[0_0_15px_rgba(84,188,235,0.3)]';

// Aviso temporal: los botones aún no tienen acción real (handler delegado).
function avisoProximamente(e: React.MouseEvent) {
  const el = (e.target as HTMLElement).closest('button, a[href="#"]');
  if (el && !el.hasAttribute('data-real')) {
    e.preventDefault();
    notificar('🚧 Función en desarrollo');
  }
}

function CVSeccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="mb-3 border-b border-outline-variant text-sm font-bold uppercase tracking-wider text-primary">
        {titulo}
      </h3>
      {children}
    </div>
  );
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
              <button className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2 font-bold text-primary transition-colors hover:bg-surface-variant">
                <span className="material-symbols-outlined">download</span> Exportar PDF
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white transition-all hover:shadow-lg">
                <span className="material-symbols-outlined">edit</span> Editar Manualmente
              </button>
            </div>
          </div>

          {/* Tarjeta CV estilo Harvard */}
          <div className={`min-h-[1000px] border border-outline-variant/30 bg-white p-12 font-body-base ${CV_SHADOW}`}>
            {/* Encabezado */}
            <div className="mb-8 border-b-2 border-primary pb-8 text-center">
              <h1 className="mb-1 text-3xl font-bold tracking-tight text-primary">ADRIANA SOLANO</h1>
              <p className="mb-3 text-sm uppercase tracking-widest text-on-surface-variant">
                Bachillerato en Ingeniería de Software · Universidad de Costa Rica
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-on-surface-variant">
                <span>San José, Costa Rica</span><span>•</span>
                <span>adriana.solano@ucr.ac.cr</span><span>•</span>
                <span>+506 8888-0000</span><span>•</span>
                <span>linkedin.com/in/adrianasolano</span>
              </div>
            </div>

            {/* Perfil Profesional */}
            <CVSeccion titulo="Perfil Profesional">
              <p className="text-justify text-sm leading-relaxed text-on-surface">
                Ingeniera de Software graduada de la Universidad de Costa Rica con honores. Especialista en
                optimización de backend y arquitecturas escalables. Con experiencia en entornos corporativos de
                alta demanda técnica como Intel, aportando soluciones innovadoras mediante el uso de inteligencia
                artificial aplicada y metodologías ágiles. Enfocada en la excelencia académica y técnica.
              </p>
            </CVSeccion>

            {/* Experiencia Laboral */}
            <CVSeccion titulo="Experiencia Laboral">
              <div className="mb-6">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold">INTEL CORPORATION</span>
                  <span className="text-xs italic">2023 - Presente</span>
                </div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-xs italic">Software Engineering Intern</span>
                  <span className="text-xs">San José, CR</span>
                </div>
                <ul className="ml-4 list-disc space-y-2 text-xs text-on-surface">
                  <li>Optimización de microservicios internos reduciendo el tiempo de latencia en un 15% mediante refactorización de código en Python y Go.</li>
                  <li>Desarrollo de scripts de automatización para pruebas unitarias, incrementando la cobertura de código del 70% al 92% en el módulo de validación.</li>
                  <li>Colaboración activa en equipos multidisciplinarios bajo el marco de trabajo SCRUM.</li>
                </ul>
              </div>
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold">HACIENDA LABS (UCR)</span>
                  <span className="text-xs italic">2022 - 2023</span>
                </div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-xs italic">Asistente de Investigación Tecnológica</span>
                  <span className="text-xs">Sede Rodrigo Facio</span>
                </div>
                <ul className="ml-4 list-disc space-y-2 text-xs text-on-surface">
                  <li>Implementación de algoritmos de procesamiento de datos para la visualización de indicadores macroeconómicos nacionales.</li>
                  <li>Diseño de interfaces de usuario minimalistas utilizando React y Tailwind CSS para portales de consulta pública.</li>
                </ul>
              </div>
            </CVSeccion>

            {/* Educación */}
            <CVSeccion titulo="Educación">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-bold">UNIVERSIDAD DE COSTA RICA</span>
                <span className="text-xs italic">2019 - 2024</span>
              </div>
              <p className="text-xs">Bachillerato en Ingeniería de Software. Graduación de Honor.</p>
              <p className="mt-1 text-xs italic">
                Cursos Relevantes: Inteligencia Artificial, Estructuras de Datos Complejas, Arquitectura de Computadores.
              </p>
            </CVSeccion>

            {/* Habilidades + Proyectos */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 border-b border-outline-variant text-sm font-bold uppercase tracking-wider text-primary">Habilidades</h3>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <p><span className="font-bold">Lenguajes:</span> Java, Python, Go, TypeScript, SQL.</p>
                  <p><span className="font-bold">Frameworks:</span> Spring Boot, Node.js, React, Docker.</p>
                  <p><span className="font-bold">IA:</span> LLMs, RAG, Análisis de Datos con Pandas.</p>
                </div>
              </div>
              <div>
                <h3 className="mb-3 border-b border-outline-variant text-sm font-bold uppercase tracking-wider text-primary">Proyectos Destacados</h3>
                <p className="text-xs font-bold">Sistema de Recomendación IA (TFG)</p>
                <p className="text-xs leading-snug">
                  Desarrollo de un motor de búsqueda semántica para la Biblioteca de la UCR utilizando embeddings vectoriales.
                </p>
              </div>
            </div>
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
