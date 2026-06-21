'use client';

// Centro de Matches (estudiante) — rediseño Stitch (estático). Se renderiza
// desde /mis-matches cuando el rol es estudiante (el exalumno mantiene su vista).
// Contenido de ejemplo; datos reales en otra etapa. Avatares con iniciales
// (sin depender de imágenes externas).

import React from 'react';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';

const BENTO =
  'rounded-xl border border-outline-variant bg-white shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-transform hover:-translate-y-0.5';

function avisoProximamente(e: React.MouseEvent) {
  const el = (e.target as HTMLElement).closest('button, a[href="#"]');
  if (el && !el.hasAttribute('data-real')) {
    e.preventDefault();
    notificar('🚧 Función en desarrollo');
  }
}

const iniciales = (n: string) =>
  n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const NECESIDADES = [
  { tag: 'Mentoría Técnica', tagCls: 'bg-secondary text-white', titulo: 'Guía en Arquitectura de IA', desc: 'Busco experto en modelos de lenguaje para optimizar el motor de recomendaciones de mi TFG.' },
  { tag: 'Pasantía Académica', tagCls: 'bg-tertiary-container text-white', titulo: 'Práctica en Depto. Talento', desc: 'Necesito validar el impacto del sistema en un entorno real de reclutamiento corporativo.' },
];

const SUGERIDOS = [
  { nombre: 'Lucía Méndez', cargo: 'HR Director | Especialista en Selección', tags: ['EMPLEABILIDAD', 'RRHH'] },
  { nombre: 'Carlos Vargas', cargo: 'Data Scientist | Investigador UCR', tags: ['INVESTIGACIÓN', 'PYTHON'] },
];

const SOLICITUDES = [
  { titulo: 'Mentoría: Roberto Solano', estado: 'En revisión', estadoCls: 'text-secondary', barra: 'bg-secondary', pct: 65, hace: 'Enviado hace 2 días' },
  { titulo: 'Pasantía: Intel CR', estado: 'Entrevista pendiente', estadoCls: 'text-tertiary-container', barra: 'bg-tertiary', pct: 90, hace: 'Enviado hace 5 días' },
  { titulo: 'Colaboración: Ana Rojas', estado: 'Pendiente', estadoCls: 'text-outline', barra: 'bg-outline', pct: 20, hace: 'Enviado hace 1 hora' },
];

export default function MatchesEstudiante() {
  return (
    <StudentShell active="matches">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 p-6" onClick={avisoProximamente}>
        {/* Encabezado */}
        <section className="flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <h1 className="font-headline-md text-3xl text-primary">Centro de Matches</h1>
            <p className="max-w-2xl text-on-surface-variant">
              Potencia tu carrera conectando con la red de egresados más influyente del país. Encuentra
              mentoría estratégica y oportunidades académicas alineadas a tu TFG.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
            <span className="material-symbols-outlined mr-1 text-sm">bolt</span> 85% Perfil Completado
          </span>
        </section>

        {/* Bento */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Columna izquierda */}
          <div className="space-y-6 lg:col-span-8">
            {/* Mis Necesidades Actuales */}
            <div className={`${BENTO} p-6`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-body-semibold text-primary">
                  <span className="material-symbols-outlined text-secondary">campaign</span>
                  Mis Necesidades Actuales
                </h2>
                <button className="flex items-center gap-1 font-bold text-secondary hover:underline">
                  <span className="material-symbols-outlined text-lg">add_circle</span> Publicar Nueva
                </button>
              </div>
              <p className="mb-4 text-xs italic text-on-surface-variant">
                Relacionado a: &quot;Sistema de Gestión de Talento basado en IA&quot;
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {NECESIDADES.map((n) => (
                  <div key={n.titulo} className="group rounded-lg border border-outline-variant bg-surface-container-low p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <span className={`rounded px-2 py-1 text-xs font-bold uppercase ${n.tagCls}`}>{n.tag}</span>
                      <button className="opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </div>
                    <h3 className="mb-1 font-body-semibold text-primary">{n.titulo}</h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Estratégico (destacado) */}
            <div className="overflow-hidden rounded-xl shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]">
              <div className="flex flex-col items-center gap-8 bg-gradient-to-br from-primary to-secondary p-8 md:flex-row">
                <div className="relative shrink-0">
                  <div className="flex h-32 w-32 items-center justify-center rounded-xl border-4 border-secondary-container/30 bg-white/15 font-display-lg text-4xl font-bold text-white">
                    RS
                  </div>
                  <div className="absolute -bottom-2 -right-2 rounded-lg bg-secondary-container px-2 py-1 text-xs font-bold text-on-secondary-container shadow-lg">
                    MATCH 98%
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-center text-white md:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                    <span className="material-symbols-outlined text-lg text-secondary-fixed-dim">verified</span>
                    <span className="text-xs uppercase tracking-widest">Match Sugerido por IA</span>
                  </div>
                  <h2 className="font-headline-md text-3xl leading-none">Roberto Solano</h2>
                  <p className="text-secondary-fixed-dim">Lead AI Engineer @ TechFlow Solutions | Exalumno UCR &apos;05</p>
                  <p className="max-w-lg text-sm leading-relaxed opacity-90">
                    Roberto tiene 15 años de experiencia en automatización de procesos de RRHH con modelos de
                    Machine Learning. Puede asesorarte directamente en la validación técnica de tu arquitectura
                    para el TFG.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-4 md:justify-start">
                    <button className="flex items-center gap-3 rounded-lg bg-[#54BCEB] px-6 py-3 font-bold text-primary transition-transform hover:scale-105">
                      Solicitar Mentoría <span className="material-symbols-outlined">send</span>
                    </button>
                    <button className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
                      Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Perfiles Sugeridos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-body-semibold text-primary">Perfiles Sugeridos</h2>
                <div className="flex items-center gap-4">
                  <select className="cursor-pointer border-none bg-transparent text-sm font-semibold text-secondary focus:ring-0">
                    <option>Todas las Áreas</option>
                    <option>Tecnología</option>
                    <option>Mentoría</option>
                    <option>Empleo</option>
                  </select>
                  <button className="text-outline transition-colors hover:text-primary">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {SUGERIDOS.map((s) => (
                  <div key={s.nombre} className={`${BENTO} flex items-center justify-between p-4`}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {iniciales(s.nombre)}
                      </div>
                      <div>
                        <h4 className="font-body-semibold text-primary">{s.nombre}</h4>
                        <p className="text-xs text-on-surface-variant">{s.cargo}</p>
                      </div>
                    </div>
                    <div className="hidden gap-2 md:flex">
                      {s.tags.map((t) => (
                        <span key={t} className="rounded bg-secondary/10 px-2 py-1 text-xs font-bold text-secondary">{t}</span>
                      ))}
                    </div>
                    <button className="rounded-full p-2 text-secondary transition-colors hover:bg-secondary/10">
                      <span className="material-symbols-outlined">person_add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6 lg:col-span-4">
            {/* Solicitudes Enviadas */}
            <div className={`${BENTO} p-6`}>
              <h3 className="mb-6 flex items-center justify-between text-sm font-bold uppercase tracking-wider text-primary">
                Solicitudes Enviadas
                <span className="rounded-full bg-secondary-container px-2 py-0.5 text-xs text-on-secondary-container">3 ACTIVAS</span>
              </h3>
              <div className="space-y-8">
                {SOLICITUDES.map((s) => (
                  <div key={s.titulo}>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="font-body-semibold text-primary">{s.titulo}</span>
                      <span className={s.estadoCls}>{s.estado}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className={`h-full ${s.barra}`} style={{ width: `${s.pct}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant">{s.hace}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip de IA */}
            <div className="rounded-xl border-none bg-[#E6F4F9] p-6 shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-3xl text-secondary">psychology</span>
                <div>
                  <h3 className="font-body-semibold text-primary">Tip de IA</h3>
                  <p className="mt-1 text-sm text-on-secondary-fixed-variant">
                    Hemos detectado que tu perfil destaca en <b>Procesamiento de Lenguaje Natural</b>. Contactar a
                    mentores con esta etiqueta aumentará tus chances de match en un 25%.
                  </p>
                  <button className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">Ver más consejos</button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`${BENTO} p-4 text-center`}>
                <p className="text-2xl font-bold text-secondary">14</p>
                <p className="text-xs font-bold uppercase text-on-surface-variant">Vistas Perfil</p>
              </div>
              <div className={`${BENTO} p-4 text-center`}>
                <p className="text-2xl font-bold text-secondary">8</p>
                <p className="text-xs font-bold uppercase text-on-surface-variant">Conexiones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto flex items-center justify-between border-t border-outline-variant/30 px-2 py-4 text-xs text-on-surface-variant">
          <p>© 2024 Alumni Universidad de Costa Rica</p>
          <div className="flex gap-6">
            <a href="/ayuda" className="hover:text-primary">Centro de Ayuda</a>
            <a href="/terminos" className="hover:text-primary">Términos de Conexión</a>
          </div>
        </footer>
      </div>
    </StudentShell>
  );
}
