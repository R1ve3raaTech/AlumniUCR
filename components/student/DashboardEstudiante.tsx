'use client';

// Dashboard del estudiante: un "pizarrón" práctico que resume TODAS sus
// pantallas (perfil, CV, matches, directorio, comunidad, reportes), 100% ligado
// a la fuente única (perfil) + reportes reales. Pensado como un panel de
// practicidad y bienestar: reseñas breves, avisos accionables y próximos pasos.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante, type PerfilEstudiante } from '@/context/PerfilEstudianteContext';
import { misReportes } from '@/lib/reportesAnomalias';

const card = 'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-0.5';

const TIPS = [
  'Acordate de tomar descansos: 25 minutos de foco, 5 de pausa.',
  'Tu bienestar importa tanto como tus notas. Dormí bien hoy.',
  'Un perfil completo abre puertas: dedicale 10 minutos esta semana.',
  'Conectar con un mentor reduce la incertidumbre. Animate a escribir.',
  'Celebrá los pequeños avances; cada sección completada suma.',
];

// Porcentaje de perfil completo a partir de los campos clave.
function completitud(p: PerfilEstudiante): number {
  const campos = [
    p.nombre, p.apellidos, p.telefono, p.carrera, p.sede, p.resumen, p.foto,
    p.proyectoTitulo, p.habilidadesTecnicas,
    p.experiencias.length ? 'x' : '', p.intereses.length ? 'x' : '',
    Object.values(p.apoyo).some(Boolean) ? 'x' : '',
  ];
  return Math.round((campos.filter((c) => String(c).trim()).length / campos.length) * 100);
}

// Secciones del CV con datos.
function seccionesCV(p: PerfilEstudiante): number {
  return [
    p.nombre || p.apellidos,
    p.telefono || p.linkedin || p.ubicacion,
    p.experiencias.length,
    p.habilidadesTecnicas || p.habilidadesBlandas || p.idiomas,
    p.carrera || p.sede,
    p.resumen,
  ].filter(Boolean).length;
}

export default function DashboardEstudiante() {
  const { token } = useAuth();
  const { perfil } = usePerfilEstudiante();
  const [reportes, setReportes] = useState<any[]>([]);

  useEffect(() => {
    if (token) misReportes(token).then(setReportes).catch(() => {});
  }, [token]);

  const nombre = perfil.nombre?.trim() || 'estudiante';
  const pct = completitud(perfil);
  const cvSecs = seccionesCV(perfil);
  const apoyos = Object.values(perfil.apoyo).filter(Boolean).length;
  const reportesActivos = reportes.filter((r) => r.estado !== 'resuelta').length;
  const tip = TIPS[nombre.length % TIPS.length];

  // Avisos prácticos derivados de lo que falta en el perfil.
  const avisos: { icon: string; texto: string; href: string }[] = [];
  if (!perfil.foto) avisos.push({ icon: 'add_a_photo', texto: 'Subí tu foto de perfil para destacar.', href: '/perfil-estudiante' });
  if (!perfil.resumen) avisos.push({ icon: 'edit_note', texto: 'Escribí tu resumen profesional para tu CV.', href: '/mi-curriculum/editor' });
  if (perfil.experiencias.length === 0) avisos.push({ icon: 'work', texto: 'Agregá experiencia o proyectos a tu CV.', href: '/mi-curriculum/editor' });
  if (apoyos === 0) avisos.push({ icon: 'volunteer_activism', texto: 'Definí qué apoyo buscás (mentoría, pasantía…).', href: '/directorio' });
  if (!perfil.proyectoTitulo) avisos.push({ icon: 'science', texto: 'Registrá tu proyecto de graduación (TFG/TCU).', href: '/directorio' });
  if (perfil.intereses.length === 0) avisos.push({ icon: 'interests', texto: 'Agregá tus intereses para mejores matches.', href: '/mis-matches' });

  // Tarjetas-resumen de cada sección (reseña + enlace).
  const secciones = [
    { titulo: 'Mi Perfil', icon: 'person', valor: `${pct}% completo`, detalle: `${perfil.carne || 'Sin carné'} · ${perfil.sede || 'Sede pendiente'}`, href: '/perfil-estudiante' },
    { titulo: 'CV + IA', icon: 'description', valor: `${cvSecs}/6 secciones`, detalle: perfil.cargoDeseado || 'Definí tu cargo deseado', href: '/mi-curriculum' },
    { titulo: 'Matches', icon: 'handshake', valor: `${apoyos} necesidad${apoyos === 1 ? '' : 'es'}`, detalle: apoyos ? 'Buscando conexiones' : 'Definí qué apoyo buscás', href: '/mis-matches' },
    { titulo: 'Directorio', icon: 'badge', valor: perfil.proyectoTitulo ? 'Ficha lista' : 'Ficha incompleta', detalle: perfil.proyectoTitulo || 'Registrá tu proyecto', href: '/directorio' },
    { titulo: 'Reportes', icon: 'flag', valor: `${reportes.length} enviado${reportes.length === 1 ? '' : 's'}`, detalle: reportesActivos ? `${reportesActivos} en seguimiento` : 'Todo al día', href: '/reportes' },
    { titulo: 'Comunidad', icon: 'forum', valor: 'Próx: 24 Nov', detalle: 'Feria de Empleo Tech 2026', href: '/comunidad' },
  ];

  return (
    <StudentShell active="dashboard">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 p-6 lg:p-8">
        {/* Saludo + progreso */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 text-white">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/70">Tu pizarrón</p>
              <h1 className="font-headline-md text-2xl sm:text-3xl">Hola, {nombre} 👋</h1>
              <p className="mt-1 max-w-lg text-white/85">{perfil.carrera || 'Estudiante UCR'}{perfil.sede ? ` · ${perfil.sede}` : ''}. Acá tenés un resumen práctico de todo lo tuyo.</p>
            </div>
            {/* Anillo de progreso */}
            <div className="flex items-center gap-4">
              <div className="relative grid h-24 w-24 place-items-center rounded-full" style={{ background: `conic-gradient(#54BCEB ${pct * 3.6}deg, rgba(255,255,255,0.2) 0deg)` }}>
                <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-primary">
                  <span className="font-display-lg text-2xl font-bold">{pct}%</span>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-body-semibold">Perfil completo</p>
                <Link
                  href="/onboarding"
                  aria-label="Editar mi perfil"
                  title="Editar mi perfil"
                  className="mt-2 inline-grid h-9 w-9 place-items-center rounded-full bg-[#54BCEB] text-primary shadow-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Resumen por sección */}
          <div className="space-y-6 lg:col-span-8">
            <div>
              <h2 className="mb-3 font-body-semibold text-primary">Resumen de tus secciones</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {secciones.map((s) => (
                  <Link key={s.titulo} href={s.href} className={`${card} flex flex-col gap-2 p-5`}>
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary/10 text-secondary">
                        <span className="material-symbols-outlined">{s.icon}</span>
                      </span>
                      <span className="material-symbols-outlined text-outline">chevron_right</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{s.titulo}</p>
                      <p className="font-headline-md text-lg text-primary">{s.valor}</p>
                      <p className="line-clamp-1 text-xs text-on-surface-variant">{s.detalle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mi proyecto de graduación */}
            <div className={`${card} p-6`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-body-semibold text-primary">
                  <span className="material-symbols-outlined text-secondary">science</span> Mi proyecto de graduación
                </h2>
                <div className="flex items-center gap-2">
                  <Link href="/directorio" className="text-xs font-bold uppercase text-secondary hover:underline">Gestionar</Link>
                  <Link
                    href="/onboarding"
                    aria-label="Editar proyecto"
                    title="Editar proyecto"
                    className="grid h-8 w-8 place-items-center rounded-full bg-secondary/10 text-secondary transition-colors hover:bg-secondary/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </Link>
                </div>
              </div>
              {perfil.proyectoTitulo ? (
                <>
                  <p className="mb-1 text-xs font-bold uppercase text-outline">{perfil.proyectoTipo.split(' ')[0]} · {perfil.proyectoAvance}% de avance</p>
                  <h3 className="mb-3 font-body-semibold text-on-surface">{perfil.proyectoTitulo}</h3>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${perfil.proyectoAvance}%` }} />
                  </div>
                  {perfil.proyectoAreas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {perfil.proyectoAreas.map((a) => <span key={a} className="rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary">{a}</span>)}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-on-surface-variant">Todavía no registraste tu proyecto. <Link href="/directorio" className="font-semibold text-secondary underline">Registralo</Link> para aparecer en el directorio y mejorar tus matches.</p>
              )}
            </div>
          </div>

          {/* Columna derecha: avisos + bienestar */}
          <div className="space-y-6 lg:col-span-4">
            {/* Avisos prácticos */}
            <div className={`${card} p-6`}>
              <h2 className="mb-4 flex items-center gap-2 font-body-semibold text-primary">
                <span className="material-symbols-outlined text-secondary">checklist</span> Próximos pasos
              </h2>
              {avisos.length === 0 ? (
                <div className="flex items-center gap-3 rounded-lg bg-tertiary/5 p-4">
                  <span className="material-symbols-outlined text-tertiary">task_alt</span>
                  <p className="text-sm text-on-surface-variant">¡Excelente! Tu perfil está al día. Seguí explorando matches y comunidad.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {avisos.map((a, i) => (
                    <li key={i}>
                      <Link href={a.href} className="flex items-center gap-3 rounded-lg border border-outline-variant/40 p-3 transition-colors hover:border-secondary hover:bg-secondary/5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
                          <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
                        </span>
                        <span className="flex-1 text-sm text-on-surface">{a.texto}</span>
                        <span className="material-symbols-outlined text-outline">chevron_right</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bienestar */}
            <div className="rounded-xl border-none bg-[#E6F4F9] p-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-3xl text-secondary">self_improvement</span>
                <div>
                  <h3 className="font-body-semibold text-primary">Tu bienestar</h3>
                  <p className="mt-1 text-sm text-on-secondary-fixed-variant">{tip}</p>
                </div>
              </div>
            </div>

            {/* Stats rápidas */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`${card} p-4 text-center`}>
                <p className="text-2xl font-bold text-secondary">{perfil.intereses.length}</p>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Intereses</p>
              </div>
              <div className={`${card} p-4 text-center`}>
                <p className="text-2xl font-bold text-secondary">{perfil.experiencias.length}</p>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Experiencias</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
