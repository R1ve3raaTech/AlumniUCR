'use client';

// Mi Perfil (estudiante) — versión desplegable (acordeón). Cada sección muestra
// poca información por defecto y se expande al tocarla, para una pantalla limpia
// y mucho más fácil de hacer responsiva. Datos reales desde la fuente única.

import React, { useState } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';

// Aviso temporal: botones aún sin acción real (los reales llevan data-real).
function avisoProximamente(e: React.MouseEvent) {
  const el = (e.target as HTMLElement).closest('button, a[href="#"]');
  if (el && !el.hasAttribute('data-real')) {
    e.preventDefault();
    notificar('🚧 Función en desarrollo');
  }
}

const SHADOW = 'shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';

// ── Sección desplegable (acordeón) ──────────────────────────────────────────
function Desplegable({
  titulo, icono, resumen, defaultOpen = false, children,
}: {
  titulo: string;
  icono?: string;
  resumen?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(defaultOpen);
  return (
    <div className={`overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest ${SHADOW}`}>
      <button
        type="button"
        data-real
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-surface-container-low"
      >
        <span className="flex min-w-0 items-center gap-2 font-headline-md text-lg text-primary">
          {icono && <span className="material-symbols-outlined shrink-0 text-secondary">{icono}</span>}
          <span className="truncate">{titulo}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {resumen && !abierto && (
            <span className="hidden max-w-[10rem] truncate text-xs font-semibold text-on-surface-variant sm:inline">{resumen}</span>
          )}
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${abierto ? 'rotate-180' : ''}`}>expand_more</span>
        </span>
      </button>
      <div className={abierto ? 'border-t border-outline-variant/40 p-5' : 'hidden'}>{children}</div>
    </div>
  );
}

function CampoLectura({ label, valor, resaltar }: { label: string; valor: string; resaltar?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-caps text-xs uppercase tracking-wider text-on-surface-variant">{label}</label>
      <div className={`rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 font-body-semibold ${resaltar ? 'text-primary' : ''}`}>
        {valor}
      </div>
    </div>
  );
}

export default function PerfilEstudiantePage() {
  const { perfil } = usePerfilEstudiante();
  const o = (v: string, d = '—') => (v && v.trim() ? v : d);
  const apoyosActivos = [
    perfil.apoyo.mentoria && 'Mentoría',
    perfil.apoyo.empleo && 'Empleo',
    perfil.apoyo.pasantia && 'Pasantía',
    perfil.apoyo.financiamiento && 'Financiamiento',
  ].filter(Boolean) as string[];

  return (
    <StudentShell active="perfil">
      <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-5 p-4 sm:p-8" onClick={avisoProximamente}>
        {/* Encabezado */}
        <div className="col-span-12">
          <h1 className="font-headline-md text-2xl text-primary sm:text-3xl">Mi Perfil</h1>
          <p className="text-sm text-on-surface-variant">Tocá cada sección para ver o esconder su contenido.</p>
        </div>

        {!perfil.completado && (
          <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4">
            <p className="text-sm text-on-surface"><strong>Completá tu perfil una vez</strong> y se reflejará en todas tus pantallas.</p>
            <Link href="/onboarding" data-real className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-on-secondary">Completar ahora</Link>
          </div>
        )}

        {/* ── Columna central ── */}
        <section className="col-span-12 flex flex-col gap-5 lg:col-span-8">
          <Desplegable titulo="Información Académica" icono="school" resumen={o(perfil.carrera)} defaultOpen>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoLectura label="Carné" valor={o(perfil.carne)} />
              <CampoLectura label="Carrera" valor={o(perfil.carrera)} resaltar />
              <CampoLectura label="Sede" valor={o(perfil.sede)} />
              <CampoLectura label="Año de Ingreso" valor={o(perfil.anioIngreso)} />
            </div>
          </Desplegable>

          <Desplegable titulo="Proyecto de Graduación (TFG)" icono="terminal" resumen={`${perfil.proyectoAvance}% avance`}>
            <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-on-primary">
              <p className="mb-4 font-body-semibold text-lg leading-tight">{o(perfil.proyectoTitulo, 'Aún no registraste tu proyecto de graduación')}</p>
              <div className="mb-1 flex justify-between text-xs"><span>Progreso</span><span className="font-bold">{perfil.proyectoAvance}%</span></div>
              <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-primary-container">
                <div className="h-full rounded-full bg-secondary-container shadow-[0_0_12px_rgba(106,207,255,0.6)]" style={{ width: `${perfil.proyectoAvance}%` }} />
              </div>
              <div className="flex flex-wrap gap-1">
                {(perfil.proyectoAreas.length ? perfil.proyectoAreas : ['Sin áreas aún']).map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase">{t}</span>
                ))}
              </div>
            </div>
          </Desplegable>

          <Desplegable titulo="Empleabilidad y Trayectoria" icono="work_history">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 p-4">
                <h3 className="font-body-semibold text-primary">Portal Empleabilidad</h3>
                <p className="text-sm text-on-surface-variant">Vacantes exclusivas para estudiantes y egresados UCR.</p>
                <a href="#" className="mt-auto rounded-lg bg-secondary py-2 text-center text-sm font-bold text-on-secondary">Ir a la Bolsa de Empleo</a>
              </div>
              <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 p-4">
                <h3 className="font-body-semibold text-primary">Gestión de Trayectoria</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container"><div className="h-full w-3/5 bg-tertiary" /></div>
                  <span className="text-xs font-bold text-tertiary">60%</span>
                </div>
                <button className="mt-auto rounded-lg border border-tertiary py-2 text-center text-sm font-bold text-tertiary">Ver Mapa de Carrera</button>
              </div>
            </div>
          </Desplegable>

          <Desplegable titulo="Historial Académico y Experiencia" icono="auto_stories" resumen="2 registros">
            <div className="space-y-3">
              {[
                { icon: 'auto_stories', color: 'secondary', titulo: 'Cursos de Carrera Aprobados', sub: '32 créditos • Promedio: 9.5' },
                { icon: 'corporate_fare', color: 'tertiary', titulo: 'Pasantía: Intel Costa Rica', sub: 'Frontend React • Set. 2023' },
              ].map((r) => (
                <div key={r.titulo} className="flex items-center gap-3 rounded-xl border border-outline-variant/30 p-3">
                  <div className={`rounded-lg p-2 ${r.color === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}`}>
                    <span className="material-symbols-outlined">{r.icon}</span>
                  </div>
                  <div><p className="font-body-semibold text-sm">{r.titulo}</p><p className="text-xs text-on-surface-variant">{r.sub}</p></div>
                </div>
              ))}
            </div>
          </Desplegable>

          <Desplegable titulo="Historial de Postulaciones" icono="assignment" resumen="2 postulaciones">
            <div className="space-y-3">
              {[
                { icon: 'business_center', titulo: 'Desarrollador Fullstack — Amazon CR', estado: 'En Revisión', estadoCls: 'bg-secondary/10 text-secondary', fecha: '15 Oct 2023' },
                { icon: 'analytics', titulo: 'Analista de Datos — BAC Credomatic', estado: 'Finalizada', estadoCls: 'bg-surface-container-highest text-on-surface-variant', fecha: '02 Set 2023' },
              ].map((p) => (
                <div key={p.titulo} className="flex items-center gap-3 rounded-xl border border-outline-variant/30 p-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><span className="material-symbols-outlined">{p.icon}</span></div>
                  <div>
                    <p className="font-body-semibold text-sm">{p.titulo}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${p.estadoCls}`}>{p.estado}</span>
                      <span className="text-xs text-on-surface-variant">{p.fecha}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Desplegable>
        </section>

        {/* ── Columna derecha ── */}
        <section className="col-span-12 flex flex-col gap-5 lg:col-span-4">
          <Desplegable titulo="Asistente de IA" icono="smart_toy" defaultOpen>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-on-surface-variant">Resolvé dudas sobre tu perfil, CV, matches o tu proyecto con el asistente inteligente de Alumni UCR.</p>
              <button
                type="button"
                data-real
                onClick={() => window.dispatchEvent(new Event('open-global-chatbot'))}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-bold text-on-primary transition-transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined">smart_toy</span> Abrir asistente
              </button>
            </div>
          </Desplegable>

          <Desplegable titulo="Tipo de Beca" icono="workspace_premium" resumen={o(perfil.beca, 'Sin asignar')}>
            <div className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Asignada</span>
                <span className="text-xl font-bold text-primary">{o(perfil.beca, 'Sin asignar')}</span>
              </div>
              <span className="material-symbols-outlined rounded-full bg-primary/10 p-2 text-primary">workspace_premium</span>
            </div>
          </Desplegable>

          <Desplegable titulo="Apoyo Requerido" icono="volunteer_activism" resumen={apoyosActivos.length ? `${apoyosActivos.length} tipos` : 'Ninguno'}>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Mentoría', checked: perfil.apoyo.mentoria },
                { label: 'Ofertas de Empleo', checked: perfil.apoyo.empleo },
                { label: 'Pasantía Académica', checked: perfil.apoyo.pasantia },
                { label: 'Financiamiento', checked: perfil.apoyo.financiamiento },
              ].map((a) => (
                <label key={a.label} className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low p-2">
                  <input type="checkbox" checked={a.checked} readOnly className="rounded border-outline-variant accent-secondary" />
                  <span className="font-body-semibold text-sm">{a.label}</span>
                </label>
              ))}
            </div>
          </Desplegable>

          <Desplegable titulo="Intereses" icono="interests" resumen={perfil.intereses.length ? `${perfil.intereses.length}` : 'Ninguno'}>
            <div className="flex flex-wrap items-center gap-2">
              {perfil.intereses.length === 0 && <span className="text-xs italic text-on-surface-variant">Sin intereses aún.</span>}
              {perfil.intereses.map((i) => (
                <span key={i} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-body-semibold text-primary">{i}</span>
              ))}
            </div>
          </Desplegable>

          <Desplegable titulo="Portafolio" icono="folder">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex cursor-pointer flex-col items-center gap-2 rounded-lg bg-surface-container p-3">
                <span className="material-symbols-outlined text-3xl text-secondary">folder</span>
                <span className="text-center text-xs font-bold uppercase">Info Educativa</span>
              </div>
              <div className="flex cursor-pointer flex-col items-center gap-2 rounded-lg bg-surface-container p-3">
                <span className="material-symbols-outlined text-3xl text-primary">collections</span>
                <span className="text-center text-xs font-bold uppercase">Galería TFG</span>
              </div>
            </div>
          </Desplegable>

          <Desplegable titulo="Comunidad" icono="forum">
            <div className="space-y-3">
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-secondary/10 px-1 text-xs font-bold uppercase text-secondary">NOTICIA</span>
                  <span className="text-xs text-on-surface-variant">Hace 2 días</span>
                </div>
                <p className="line-clamp-2 text-xs font-body-semibold">Nuevos avances en el Sistema de Gestión de Talento IA</p>
              </div>
              <Link href="/comunidad" data-real className="block rounded-lg bg-primary py-2 text-center text-sm font-bold text-on-primary">Ir a Comunidad</Link>
            </div>
          </Desplegable>

          <Desplegable titulo="Seguridad y Reportes" icono="security" resumen="Cuenta segura">
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-primary">Estado de Cuenta</span>
                  <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-bold text-green-600">SEGURO</span>
                </div>
                <p className="text-xs text-on-surface-variant">Tu cuenta está en buen estado. 0 reportes acumulados.</p>
              </div>
              <p className="text-xs italic leading-tight text-on-surface-variant">3 reportes generan una suspensión temporal automática. Los reportes son 100% anónimos.</p>
              <Link href="/reportes" data-real className="flex items-center justify-center gap-2 rounded-lg border border-error py-2 text-center text-sm font-bold text-error transition-colors hover:bg-error/5">
                <span className="material-symbols-outlined text-sm">flag</span> Ir a Reportes
              </Link>
            </div>
          </Desplegable>
        </section>
      </div>
    </StudentShell>
  );
}
