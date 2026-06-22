'use client';

// CV + IA (estudiante) — rediseño Stitch (dinámico). CV estilo Harvard + columna
// de IA Asistente de Carrera alimentada por Claude API.

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import CvDocumento from '@/components/student/CvDocumento';
import PasosCV from '@/components/student/PasosCV';
import { notificar } from '@/components/student/Toast';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
import { apiFetch } from '@/lib/api';

const AI_GLOW = 'shadow-[0_0_15px_rgba(84,188,235,0.3)]';

interface CareerAnalysis {
  estadoActual: string;
  benchmarkingSalarial: {
    cargo: string;
    porcentaje: number;
    mensaje: string;
  };
  tendencias: Array<{
    titulo: string;
    descripcion: string;
  }>;
  proyecciones: Array<{
    puesto: string;
    porcentaje: number;
    explicacion: string;
  }>;
  sugerenciaCertificacion: string;
}

export default function MiCurriculumPage() {
  const { token, loading: authLoading } = useAuth();
  const { perfil } = usePerfilEstudiante();
  const [analisis, setAnalisis] = useState<CareerAnalysis | null>(null);
  const [cargandoAnalisis, setCargandoAnalisis] = useState(true);

  useEffect(() => {
    if (authLoading || !token) return;

    let activo = true;
    setCargandoAnalisis(true);

    apiFetch('/claude/career-analysis', { method: 'POST', token })
      .then((res) => {
        if (activo && res && res.success) {
          setAnalisis(res.data);
        }
      })
      .catch((err) => {
        console.error('Error al cargar análisis de carrera:', err);
      })
      .finally(() => {
        if (activo) setCargandoAnalisis(false);
      });

    return () => {
      activo = false;
    };
  }, [token, authLoading]);

  // Dispatch custom event to trigger global chatbot with dynamic prompt
  const abrirChatconPrompt = (mensaje: string) => {
    const ev = new CustomEvent('open-global-chatbot', {
      detail: { mensaje }
    });
    window.dispatchEvent(ev);
  };

  const data = analisis || {
    estadoActual: "Proyectando tu perfil para vacantes de tu carrera...",
    benchmarkingSalarial: {
      cargo: perfil.cargoDeseado || perfil.carrera || "Tu Perfil Profesional",
      porcentaje: 65,
      mensaje: "Completa más secciones de tu CV e ingresa tu proyecto de graduación para recibir recomendaciones específicas."
    },
    tendencias: [
      {
        titulo: "Habilidades y Certificaciones",
        descripcion: "Los reclutadores costarricenses valoran enormemente el dominio de idiomas (inglés B2/C1) y certificaciones técnicas."
      },
      {
        titulo: "Demanda en el Mercado",
        descripcion: "Las vacantes dirigidas a graduados de la UCR destacan a postulantes que han realizado proyectos prácticos o TFG aplicados."
      }
    ],
    proyecciones: [
      {
        puesto: `Puesto Junior en ${perfil.carrera || "tu carrera"}`,
        porcentaje: 75,
        explicacion: "Coincidencia estimada basada en tu perfil de la Universidad de Costa Rica."
      }
    ],
    sugerenciaCertificacion: "Sugerencia IA: Completa todos tus datos académicos e intenta cargar de nuevo esta sección."
  };

  return (
    <StudentShell active="cv">
      {/* Indicador de pasos (compartido): aquí es el paso 3 (descargar) */}
      <div className="mx-auto max-w-[1280px] px-6 pt-6 print:hidden">
        <PasosCV activo={3} />
      </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-8 px-6 pb-6 pt-6">
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
        {cargandoAnalisis ? (
          <section className="col-span-12 space-y-6 lg:col-span-4 animate-pulse">
            {/* IA Asistente de Carrera loading state */}
            <div className={`relative overflow-hidden rounded-xl bg-primary p-6 text-white ${AI_GLOW}`}>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-secondary-fixed">progress_activity</span>
                  <div className="h-5 w-48 rounded bg-white/20" />
                </div>
                <div className="rounded-lg border border-secondary-fixed/20 bg-primary-container/20 p-3 space-y-2">
                  <div className="h-2 w-20 rounded bg-white/30" />
                  <div className="h-4 w-full rounded bg-white/20" />
                  <div className="h-4 w-3/4 rounded bg-white/20" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-11 w-full rounded-lg bg-white/10" />
                  <div className="h-11 w-full rounded-lg bg-white/10" />
                  <div className="h-11 w-full rounded-lg bg-white/10" />
                </div>
              </div>
            </div>

            {/* Inteligencia de Mercado loading state */}
            <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-outline-variant/30" />
                <div className="h-5 w-40 rounded bg-outline-variant/30" />
              </div>
              <div className="space-y-3">
                <div className="rounded-lg bg-surface-container-low p-3 space-y-2">
                  <div className="h-3 w-24 rounded bg-outline-variant/30" />
                  <div className="h-4 w-48 rounded bg-outline-variant/30" />
                  <div className="h-2 w-full rounded bg-outline-variant/20" />
                  <div className="h-3 w-36 rounded bg-outline-variant/20" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 rounded bg-outline-variant/30 mt-1" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-1/2 rounded bg-outline-variant/30" />
                    <div className="h-3 w-5/6 rounded bg-outline-variant/20" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 rounded bg-outline-variant/30 mt-1" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-1/3 rounded bg-outline-variant/30" />
                    <div className="h-3 w-2/3 rounded bg-outline-variant/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Proyección de Perfil loading state */}
            <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-outline-variant/30" />
                <div className="h-5 w-36 rounded bg-outline-variant/30" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded bg-outline-variant/20" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded bg-outline-variant/30" />
                    <div className="h-3 w-full rounded bg-outline-variant/20" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded bg-outline-variant/20" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-1/2 rounded bg-outline-variant/30" />
                    <div className="h-3 w-5/6 rounded bg-outline-variant/20" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="col-span-12 space-y-6 lg:col-span-4 animate-fade-in">
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
                    &quot;{data.estadoActual}&quot;
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    data-real
                    onClick={() => abrirChatconPrompt("¡Hola! Quiero que me ayudes a optimizar mi perfil y CV para postularme a una vacante. ¿Qué me recomiendas?")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-fixed py-3 text-sm font-bold text-primary transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span> Optimizar para Vacante
                  </button>
                  <button
                    data-real
                    onClick={() => abrirChatconPrompt("¡Hola! ¿Qué logros o experiencias debería actualizar en mi CV para que sea más competitivo en mi área?")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-sm font-bold text-white transition-all hover:bg-white/20"
                  >
                    <span className="material-symbols-outlined text-sm">update</span> Actualizar Logros
                  </button>
                  <button
                    data-real
                    onClick={() => abrirChatconPrompt("¡Hola! Recomiéndame certificaciones que puedan mejorar mi perfil para las proyecciones sugeridas.")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-sm font-bold text-white transition-all hover:bg-white/20"
                  >
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
                  <p className="text-sm font-semibold">{data.benchmarkingSalarial.cargo}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-outline-variant/30">
                    <div
                      className="h-full bg-secondary transition-all duration-500"
                      style={{ width: `${data.benchmarkingSalarial.porcentaje}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">{data.benchmarkingSalarial.mensaje}</p>
                </div>
                <div className="space-y-3">
                  {data.tendencias.map((tendencia, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined mt-1 text-sm text-secondary">trending_up</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{tendencia.titulo}</p>
                        <p className="text-xs leading-tight text-on-surface-variant">{tendencia.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Proyección de Perfil */}
            <div className="rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
              <h4 className="mb-4 flex items-center gap-2 font-bold text-primary">
                <span className="material-symbols-outlined">psychology</span> Proyección de Perfil
              </h4>
              <div className="space-y-4">
                {data.proyecciones.map((proyeccion, idx) => {
                  const matchVal = proyeccion.porcentaje;
                  const isHigh = matchVal >= 85;
                  const colorClass = isHigh ? 'bg-secondary/10 text-secondary' : 'bg-emerald-500/10 text-emerald-600';
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${colorClass}`}>
                        {matchVal}%
                      </div>
                      <div>
                        <p className="text-xs font-bold">Match: {proyeccion.puesto}</p>
                        <p className="text-xs text-on-surface-variant">{proyeccion.explicacion}</p>
                      </div>
                    </div>
                  );
                })}
                <div className="border-t border-outline-variant/20 pt-2">
                  <p className="text-xs italic text-on-surface-variant">
                    &quot;{data.sugerenciaCertificacion}&quot;
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </StudentShell>
  );
}
