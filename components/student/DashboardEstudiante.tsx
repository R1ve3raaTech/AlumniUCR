'use client';

// Dashboard del estudiante: bienvenida + accesos rápidos + próximos pasos
// (criterios RF-03) + conexiones sugeridas reales (RF-06). 100% ligado a la
// fuente única (perfil); sin datos quemados.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import { usePerfilEstudiante, type PerfilEstudiante } from '@/context/PerfilEstudianteContext';
import { obtenerSugeridos } from '@/lib/matchesEstudiante';

const card = 'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-0.5';

const iniciales = (n: string) => n.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

// Accesos rápidos a las secciones del área de estudiante.
const ACCESOS: { titulo: string; icon: string; href: string }[] = [
  { titulo: 'Mi Perfil', icon: 'person', href: '/perfil-estudiante' },
  { titulo: 'CV + IA', icon: 'description', href: '/mi-curriculum' },
  { titulo: 'Matches', icon: 'handshake', href: '/mis-matches' },
  { titulo: 'Directorio', icon: 'badge', href: '/directorio' },
  { titulo: 'Reportes', icon: 'flag', href: '/reportes' },
  { titulo: 'Comunidad', icon: 'forum', href: '/comunidad' },
];

// Porcentaje de perfil completo según los campos obligatorios de RF-03
// (Sección 1: información académica, Sección 3: proyecto de graduación,
// Sección 4: mín. 1 área de interés del proyecto). No incluye campos del
// editor de CV (RF-11), que es una sección aparte del perfil.
function completitud(p: PerfilEstudiante): number {
  const campos = [
    p.carne, p.carrera, p.facultad, p.sede, p.anioIngreso, p.nivel,
    p.proyectoTitulo, p.proyectoDescripcion, p.areaTematica, p.proyectoTipo,
    p.proyectoAreas.length ? 'x' : '',
  ];
  return Math.round((campos.filter((c) => String(c).trim()).length / campos.length) * 100);
}

export default function DashboardEstudiante() {
  const { perfil } = usePerfilEstudiante();
  const [sugeridos, setSugeridos] = useState<any[]>([]);

  useEffect(() => {
    let activo = true;
    obtenerSugeridos(perfil).then((res) => { if (activo) setSugeridos(res); });
    return () => { activo = false; };
  }, [perfil]);

  useEffect(() => {
    let activo = true;
    obtenerSugeridos(perfil).then((s) => { if (activo) setSugeridos(s); }).catch(() => {});
    return () => { activo = false; };
  }, [perfil]);

  const iniciales = (n: string) => (n || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const interesar = (n: string) => notificar(`📨 Registramos tu interés por ${n}.`);

  const nombre = perfil.nombre?.trim() || 'estudiante';
  const pct = completitud(perfil);
  const apoyos = Object.values(perfil.apoyo).filter(Boolean).length;

  // Avisos prácticos derivados de los criterios de aceptación de RF-03: el
  // perfil incompleto no aparece en el directorio, así que estos son los
  // campos obligatorios reales (info académica, proyecto, áreas de interés).
  const avisos: { icon: string; texto: string; href: string }[] = [];
  if (!perfil.carne || !perfil.carrera || !perfil.facultad || !perfil.sede || !perfil.anioIngreso || !perfil.nivel) {
    avisos.push({ icon: 'school', texto: 'Completá tu información académica (carné, carrera, sede, nivel).', href: '/perfil-estudiante' });
  }
  if (!perfil.proyectoTitulo || !perfil.proyectoDescripcion || !perfil.areaTematica || !perfil.proyectoTipo) {
    avisos.push({ icon: 'science', texto: 'Registrá tu proyecto de graduación (TFG/Tesis/Práctica Dirigida).', href: '/perfil-estudiante' });
  }
  if (perfil.proyectoAreas.length === 0) {
    avisos.push({ icon: 'interests', texto: 'Agregá al menos un área de interés a tu proyecto para mejores matches.', href: '/perfil-estudiante' });
  }
  if (apoyos === 0) avisos.push({ icon: 'volunteer_activism', texto: 'Definí qué apoyo buscás (financiamiento, mentoría, empleo, pasantía).', href: '/perfil-estudiante' });
  if (perfil.proyectoAvance >= 100 && !perfil.proyectoFinalizado) {
    avisos.push({ icon: 'flag', texto: 'Tu proyecto llegó al 100% — marcalo como finalizado.', href: '/perfil-estudiante' });
  }

  const proximoPaso = avisos[0];
  const sugeridosDestacados = sugeridos.slice(0, 3);

  return (
    <StudentShell active="dashboard">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 p-6 lg:p-8">
        {/* Saludo + progreso */}
        <section className="relative overflow-hidden rounded-2xl bg-primary p-8 text-on-primary">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-on-primary/70">¡Hola de nuevo!</p>
              <h1 className="font-headline-md text-2xl font-bold sm:text-3xl">{nombre}</h1>
              <p className="mt-1 max-w-lg text-sm text-on-primary/85">
                Es un placer tenerte de vuelta. Tenés {sugeridosDestacados.length} sugerencia{sugeridosDestacados.length === 1 ? '' : 's'} de conexión basada{sugeridosDestacados.length === 1 ? '' : 's'} en tu progreso actual.
              </p>
            </div>
            {/* Anillo de progreso */}
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 pr-5">
              <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#fb923c ${pct * 3.6}deg, rgba(255,255,255,0.25) 0deg)` }}>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-bold">{pct}%</span>
              </div>
              <div>
                <p className="font-body-semibold text-sm">Perfil Completo</p>
                <Link href="/perfil-estudiante" className="text-xs text-on-primary/70 underline hover:text-on-primary">
                  {pct >= 100 ? '¡Tu perfil se ve genial para los reclutadores!' : 'Completar ahora →'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {ACCESOS.map((s) => (
            <Link
              key={`acceso-${s.titulo}`}
              href={s.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-0.5 hover:border-secondary"
            >
              <span className="material-symbols-outlined text-secondary">{s.icon}</span>
              <span className="text-xs font-bold text-on-surface">{s.titulo}</span>
            </Link>
          ))}
        </div>

        {/* Próximos pasos */}
        <div className={`${card} p-6`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-body-semibold text-primary">Próximos pasos</h2>
            {proximoPaso && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-500">Pendiente</span>
            )}
          </div>
          {proximoPaso ? (
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                <span className="material-symbols-outlined">{proximoPaso.icon}</span>
              </div>
              <div>
                <p className="font-body-semibold text-sm text-on-surface">{proximoPaso.texto}</p>
                <p className="mt-1 text-xs text-on-surface-variant">Sumá este paso para que tu perfil se vea mejor ante exalumnos y reclutadores.</p>
                <Link href={proximoPaso.href} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline">
                  Ver detalles del proceso <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-tertiary/5 p-4">
              <span className="material-symbols-outlined text-tertiary">task_alt</span>
              <p className="text-sm text-on-surface-variant">¡Excelente! Tu perfil está al día. Seguí explorando matches y comunidad.</p>
            </div>
          )}
        </div>

        {/* Conexiones sugeridas */}
        <div className={`${card} p-6`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-body-semibold text-primary">Conexiones sugeridas para ti</h2>
            <Link href="/mis-matches" className="text-xs font-bold text-secondary hover:underline">Ver todos los perfiles</Link>
          </div>
          {sugeridosDestacados.length === 0 ? (
            <p className="text-sm italic text-on-surface-variant">Completá tu perfil para recibir sugerencias de conexión.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sugeridosDestacados.map((s) => (
                <div key={s.id ?? s.nombre} className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary bg-primary/10 font-bold text-primary">
                    {s.foto_perfil ? <img src={s.foto_perfil} alt={s.nombre} className="h-full w-full object-cover" /> : iniciales(s.nombre || '')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body-semibold text-sm text-on-surface">{s.nombre}</p>
                    <p className="truncate text-xs text-tertiary">{s.score}% de coincidencia{s.comunes?.length ? ` en ${s.comunes[0]}` : ''}</p>
                    <div className="mt-2 flex gap-2">
                      <Link href="/mis-matches" className="rounded-lg bg-orange-400 px-4 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90">
                        Conectar
                      </Link>
                      <Link href="/directorio" aria-label={`Ver perfil de ${s.nombre}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
