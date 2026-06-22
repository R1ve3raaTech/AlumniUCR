'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { useRequireRole } from '@/lib/useRequireRole';
import StudentNav from '@/components/StudentNav';
import perfilStyles from '@/components/perfil/perfil.module.css';
import { obtenerInformacionEstudiante } from '@/lib/perfilAcademico';
import { obtenerProyectoDelEstudiante } from '@/lib/proyectoGraduacion';
import { obtenerHabilidadesDelEstudiante } from '@/lib/habilidades';

// Carga diferida de los formularios (cada uno trae sus propios catálogos y
// estado): reduce el JS inicial de /perfil-estudiante y el costo de
// montar/desmontar la página al navegar hacia/desde el dashboard.
const cargando = <p className={perfilStyles.cargando}>Cargando…</p>;
const InformacionAcademicaForm = dynamic(() => import('@/components/perfil/InformacionAcademicaForm'), {
  loading: () => cargando,
});
const ProyectoGraduacionForm = dynamic(() => import('@/components/perfil/ProyectoGraduacionForm'), {
  loading: () => cargando,
});
const HabilidadesForm = dynamic(() => import('@/components/perfil/HabilidadesForm'), {
  loading: () => cargando,
});
const SolicitudesContacto = dynamic(() => import('@/components/perfil/SolicitudesContacto'), {
  loading: () => cargando,
});

// Página del perfil de estudiante (RF-03). Incluye la Sección 1 (Información
// Académica / Situación Socioeconómica), la Sección 3 (Proyecto de
// Graduación) y la Sección 6 (Habilidades). La Sección 3 depende de que
// exista informacion_estudiante (FK proyecto_graduacion_id_estudiante_fkey),
// por lo que se oculta hasta que la Sección 1 esté completa.
export default function PerfilEstudiantePage() {
  const router = useRouter();
  const { token, user, loading, signOut } = useAuth();
  const { verificando, autorizado } = useRequireRole(['estudiante']);

  const [verificandoPerfil, setVerificandoPerfil] = useState(true);
  const [perfilAcademicoListo, setPerfilAcademicoListo] = useState(false);
  // Estado real por sección (RF-03), para el indicador de progreso y la regla
  // "el perfil incompleto no aparece en el directorio".
  const [estado, setEstado] = useState({ academica: false, proyecto: false, habilidades: false });

  const refrescarEstado = useCallback(async () => {
    if (!token || !user?.id || !autorizado) return;
    const [info, proyecto, habilidades] = await Promise.all([
      obtenerInformacionEstudiante(token, user.id).catch(() => null),
      obtenerProyectoDelEstudiante(token, user.id).catch(() => null),
      obtenerHabilidadesDelEstudiante(token, user.id).catch(() => null),
    ]);
    const academica = Boolean(info);
    const proyectoOk = Boolean(proyecto && (proyecto.titulo_proyecto || proyecto.id));
    const habilidadesOk = Array.isArray(habilidades)
      ? habilidades.length > 0
      : Boolean(habilidades && (habilidades.tecnicas || habilidades.id));
    setEstado({ academica, proyecto: proyectoOk, habilidades: habilidadesOk });
    setPerfilAcademicoListo(academica);
    setVerificandoPerfil(false);
  }, [token, user?.id, autorizado]);

  useEffect(() => {
    let activo = true;
    if (token && user?.id && autorizado) refrescarEstado().finally(() => { if (!activo) return; });
    return () => { activo = false; };
  }, [token, user?.id, autorizado, refrescarEstado]);

  // % de completitud del perfil (3 secciones obligatorias del RF-03).
  const completadas = [estado.academica, estado.proyecto, estado.habilidades].filter(Boolean).length;
  const progreso = Math.round((completadas / 3) * 100);

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  if (loading || !token || verificando || !autorizado) {
    return <div className="flex min-h-screen items-center justify-center bg-ucr-surface font-brand-body text-ucr-on-surface">Cargando…</div>;
  }

  const correo = user?.email ?? '—';
  const inicial = correo.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-ucr-surface font-brand-body text-ucr-on-surface">
      <StudentNav onSignOut={handleSignOut} />

      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {/* Hero header */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-ucr-primary to-ucr-secondary p-8 text-white shadow-sm">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 font-ucr-display text-3xl font-bold">
              {inicial}
            </div>
            <div>
              <h1 className="font-ucr-display text-3xl font-bold tracking-tight sm:text-4xl">
                Mi perfil de estudiante
              </h1>
              <p className="mt-1 text-sm text-white/80">
                Sesión iniciada como <span className="font-semibold">{correo}</span>. Completa
                tus datos para que tu perfil esté visible en Alumni UCR.
              </p>
            </div>
          </div>
        </section>

        {/* Contenido: formularios en columna + resumen de progreso fijo */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="flex flex-col gap-6 lg:col-span-8">
            <section id="academico" className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-ucr-secondary">school</span>
                <h2 className="font-brand-heading text-xl font-bold text-ucr-on-surface">
                  Información académica
                </h2>
              </div>
              <p className="mb-4 text-sm text-ucr-on-surface-variant">
                Completa tu información académica y socioeconómica para que el resto de tu perfil
                pueda guardarse correctamente.
              </p>
              <InformacionAcademicaForm onGuardado={refrescarEstado} />
            </section>

            <section id="proyecto" className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-ucr-secondary">assignment</span>
                <h2 className="font-brand-heading text-xl font-bold text-ucr-on-surface">
                  Proyecto de graduación
                </h2>
              </div>
              <p className="mb-4 text-sm text-ucr-on-surface-variant">
                Completa la información de tu proyecto de graduación para que aparezca en tu
                perfil.
              </p>
              {verificandoPerfil ? (
                <p className={perfilStyles.cargando}>Cargando…</p>
              ) : perfilAcademicoListo ? (
                <ProyectoGraduacionForm onGuardado={refrescarEstado} />
              ) : (
                <p className={perfilStyles.aviso}>
                  Primero completa y guarda tu información académica para poder registrar tu
                  proyecto de graduación.
                </p>
              )}
            </section>

            <section id="habilidades" className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-ucr-secondary">workspace_premium</span>
                <h2 className="font-brand-heading text-xl font-bold text-ucr-on-surface">
                  Habilidades
                </h2>
              </div>
              <p className="mb-4 text-sm text-ucr-on-surface-variant">
                Agrega tus habilidades técnicas (opcional) para mejorar las coincidencias con tu
                perfil.
              </p>
              <HabilidadesForm onGuardado={refrescarEstado} />
            </section>

            <SolicitudesContacto />
          </div>

          {/* Resumen de progreso: fijo al hacer scroll en pantallas grandes */}
          <aside className="lg:col-span-4">
            <section className="rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-ucr-secondary">checklist</span>
                <h2 className="font-brand-heading text-xl font-bold text-ucr-on-surface">
                  Estado del perfil
                </h2>
              </div>
              {/* Indicador de progreso (RF-03) */}
              <div className="mb-4">
                <div className="mb-1 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wide text-ucr-outline">
                  <span>Progreso del perfil</span>
                  <span className="font-ucr-display text-2xl text-ucr-esmeralda">{progreso}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ucr-surface-container">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-ucr-secondary to-ucr-esmeralda transition-all"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-ucr-on-surface-variant">
                  {progreso === 100
                    ? '✓ Perfil completo: ya puede aparecer en el directorio.'
                    : 'Completa las 3 secciones para llegar al 100% y aparecer en el directorio.'}
                </p>
              </div>

              <ul className="flex flex-col gap-3 text-sm">
                {[
                  { ok: estado.academica, label: 'Información académica', href: '#academico' },
                  { ok: estado.proyecto, label: 'Proyecto de graduación', href: '#proyecto' },
                  { ok: estado.habilidades, label: 'Habilidades', href: '#habilidades' },
                ].map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 -mx-2 transition hover:bg-ucr-surface-container"
                    >
                      <span
                        className={`material-symbols-outlined ${
                          s.ok ? 'text-ucr-esmeralda' : 'text-ucr-outline'
                        }`}
                      >
                        {s.ok ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
                {!perfilAcademicoListo && !verificandoPerfil && (
                  <li className={perfilStyles.aviso}>
                    Completa la información académica para habilitar el proyecto de graduación.
                  </li>
                )}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
