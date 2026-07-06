'use client';

// CV + IA (estudiante) — diseño tipo "CV Académico": documento estilo papel a la
// izquierda y panel de IA de carrera a la derecha (tarjeta oscura + inteligencia
// de mercado + proyección de perfil). Conserva la vista previa real del CV
// (CvDocumento), la exportación a PDF (#cv-print + @media print), la plantilla,
// la edición manual y el análisis real de /claude/career-analysis con estados
// honestos cuando no hay datos.

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import CvDocumento from '@/components/student/CvDocumento';
import PasosCV from '@/components/student/PasosCV';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

// Aviso temporal: los botones sin acción real (los reales llevan data-real).
function avisoProximamente(e: React.MouseEvent) {
  const el = (e.target as HTMLElement).closest('button, a[href="#"]');
  if (el && !el.hasAttribute('data-real')) {
    e.preventDefault();
    notificar('🚧 Función en desarrollo');
  }
}

export default function MiCurriculumPage() {
  const { perfil } = usePerfilEstudiante();
  const { token } = useAuth();
  const [analisis, setAnalisis] = useState<any>(null);
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);
  const [errorAnalisis, setErrorAnalisis] = useState(false);
  const [reintento, setReintento] = useState(0);

  const o = (v: string, d = '—') => (v && v.trim() ? v : d);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    const fetchAnalisis = async () => {
      setCargandoAnalisis(true);
      setErrorAnalisis(false);
      try {
        const res = await apiFetch('/claude/career-analysis', {
          method: 'POST',
          token,
        });
        if (activo && res && res.success) {
          setAnalisis(res.data);
        } else if (activo) {
          setErrorAnalisis(true);
        }
      } catch (err) {
        console.error('Error al obtener análisis de carrera:', err);
        if (activo) setErrorAnalisis(true);
      } finally {
        if (activo) setCargandoAnalisis(false);
      }
    };
    fetchAnalisis();
    return () => {
      activo = false;
    };
  }, [token, reintento]);

  // Estado honesto sin datos: el análisis falló o no llegó (no se inventan cifras).
  const AnalisisNoDisponible = () => (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-low p-3">
      <p className="text-xs text-on-surface-variant">No pudimos obtener el análisis de mercado en este momento.</p>
      <button
        type="button"
        data-real
        onClick={() => setReintento((n) => n + 1)}
        className="flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
      >
        <span className="material-symbols-outlined text-sm">refresh</span> Reintentar
      </button>
    </div>
  );

  const optimizarParaVacante = () => {
    window.dispatchEvent(
      new CustomEvent('open-global-chatbot', {
        detail: {
          mensaje: 'Me gustaría optimizar mi currículum para una vacante específica. ¿Cómo podemos empezar?'
        }
      })
    );
  };

  const actualizarLogros = () => {
    window.dispatchEvent(
      new CustomEvent('open-global-chatbot', {
        detail: {
          mensaje: 'Quiero actualizar y redactar mejor los logros de mi currículum. ¿Me ayudás a mejorarlos?'
        }
      })
    );
  };

  const sugerirCertificaciones = () => {
    window.dispatchEvent(
      new CustomEvent('open-global-chatbot', {
        detail: {
          mensaje: '¿Qué certificaciones me recomiendas para potenciar mi perfil y mi carrera profesional?'
        }
      })
    );
  };

  const fechaHoy = new Date().toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <StudentShell active="cv">
      {/* Indicador de pasos (paso 3: descargar) */}
      <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6 print:hidden">
        <PasosCV activo={3} />
      </div>

      <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-5 p-4 sm:p-6 print:hidden" onClick={avisoProximamente}>

        {/* ── Cabecera: título + acciones (Exportar PDF · Plantilla · Editar) ── */}
        <div className="col-span-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl text-on-surface">CV Académico</h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Refinado estilo Harvard · Sincronizado con tu perfil · {fechaHoy}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-real
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm font-bold text-on-surface shadow-sm transition-colors hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined text-base text-[#FF9B18]">download</span> Exportar PDF
            </button>
            <Link
              href="/mi-curriculum/plantillas"
              data-real
              className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm font-bold text-on-surface shadow-sm transition-colors hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined text-base text-secondary">palette</span> Plantilla
            </Link>
            <Link
              href="/mi-curriculum/crear"
              data-real
              className="flex items-center gap-2 rounded-full bg-[#12242F] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-base">edit</span> Editar Manualmente
            </Link>
          </div>
        </div>

        {/* ── Izquierda: documento estilo papel ── */}
        <section className="col-span-12 lg:col-span-8">
          <div className="rounded-xl border border-outline-variant/40 bg-white p-4 shadow-[0_10px_32px_-12px_rgba(0,25,40,0.25)] sm:p-6">
            <CvDocumento />
          </div>
        </section>

        {/* ── Derecha: IA de carrera ── */}
        <section className="col-span-12 flex flex-col gap-5 lg:col-span-4">
          {/* IA Asistente de Carrera (tarjeta oscura) */}
          <div className="rounded-2xl bg-[#12242F] p-5 text-white shadow-[0_10px_28px_-10px_rgba(0,25,40,0.5)]">
            <h2 className="flex items-center gap-2 font-headline-md text-base">
              <span className="material-symbols-outlined text-[#FF9B18]">auto_awesome</span> IA Asistente de Carrera
            </h2>

            <div className="mt-4 rounded-xl bg-white/5 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#54BCEB]">Estado actual</p>
              <p className="text-sm italic leading-relaxed text-white/85">
                {cargandoAnalisis
                  ? 'Conectando con el Asistente de IA para analizar el mercado…'
                  : analisis?.estadoActual || `Analizando el mercado para proyectar tu perfil hacia vacantes afines a ${o(perfil.carrera, 'tu carrera')}.`}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                data-real
                onClick={optimizarParaVacante}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#F34B26] py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-base">rocket_launch</span> Optimizar para Vacante
              </button>
              <button
                type="button"
                data-real
                onClick={actualizarLogros}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-base">military_tech</span> Actualizar Logros
              </button>
              <button
                type="button"
                data-real
                onClick={sugerirCertificaciones}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-base">workspace_premium</span> Sugerir Certificaciones
              </button>
              <Link
                href="/mi-curriculum/advisor"
                data-real
                className="mt-1 text-center text-xs font-bold text-[#54BCEB] hover:underline"
              >
                Abrir asistente completo →
              </Link>
            </div>
          </div>

          {/* Inteligencia de Mercado */}
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-[0_2px_12px_-4px_rgba(0,40,55,0.08)]">
            <h2 className="flex items-center gap-2 font-headline-md text-base text-on-surface">
              <span className="material-symbols-outlined text-[#FF9B18]">query_stats</span> Inteligencia de Mercado
            </h2>
            <div className="mt-4 space-y-4">
              {cargandoAnalisis ? (
                <div className="animate-pulse text-xs italic text-on-surface-variant">Cargando tendencias del mercado…</div>
              ) : analisis?.benchmarkingSalarial || (analisis?.tendencias && analisis.tendencias.length > 0) ? (
                <>
                  {analisis?.benchmarkingSalarial && (
                    <div className="rounded-xl bg-surface-container-low p-3">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Benchmarking salarial</p>
                      <p className="text-sm font-bold text-on-surface">
                        {analisis.benchmarkingSalarial.cargo || o(perfil.carrera, 'Tu carrera')}
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#FF9B18]/15">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF9B18] to-[#F34B26] transition-all duration-500"
                          style={{ width: `${analisis.benchmarkingSalarial.porcentaje || 0}%` }}
                        />
                      </div>
                      {analisis.benchmarkingSalarial.mensaje && (
                        <p className="mt-1.5 text-xs text-on-surface-variant">{analisis.benchmarkingSalarial.mensaje}</p>
                      )}
                    </div>
                  )}
                  {(analisis?.tendencias || []).map((t: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined mt-0.5 text-base text-emerald-500">trending_up</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{t.titulo}</p>
                        <p className="text-xs leading-tight text-on-surface-variant">{t.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <AnalisisNoDisponible />
              )}
            </div>
          </div>

          {/* Proyección de Perfil */}
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-[0_2px_12px_-4px_rgba(0,40,55,0.08)]">
            <h2 className="flex items-center gap-2 font-headline-md text-base text-on-surface">
              <span className="material-symbols-outlined text-[#FF9B18]">psychology</span> Proyección de Perfil
            </h2>
            <div className="mt-4 space-y-3">
              {cargandoAnalisis ? (
                <div className="animate-pulse text-xs italic text-on-surface-variant">Cargando proyecciones de perfil…</div>
              ) : analisis?.proyecciones && analisis.proyecciones.length > 0 ? (
                <>
                  {analisis.proyecciones.map((p: any, idx: number) => {
                    const isHigh = p.porcentaje >= 90;
                    // Anillo de progreso como en el diseño: % dentro de un aro.
                    const color = isHigh ? '#54BCEB' : '#10B981';
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span
                          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-xs font-bold"
                          style={{ background: `conic-gradient(${color} ${(p.porcentaje || 0) * 3.6}deg, rgba(0,40,55,0.08) 0deg)` }}
                        >
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-container-lowest text-on-surface">
                            {p.porcentaje}%
                          </span>
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-on-surface">{p.puesto}</p>
                          <p className="text-xs leading-tight text-on-surface-variant">{p.explicacion}</p>
                        </div>
                      </div>
                    );
                  })}
                  {analisis?.sugerenciaCertificacion && (
                    <p className="border-t border-outline-variant/30 pt-2 text-xs italic text-on-surface-variant">
                      {analisis.sugerenciaCertificacion}
                    </p>
                  )}
                </>
              ) : (
                <AnalisisNoDisponible />
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Documento para impresión/exportación (solo visible al imprimir) */}
      <div id="cv-print" className="hidden bg-white print:block">
        <CvDocumento />
      </div>
    </StudentShell>
  );
}
