'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import InformacionAcademicaForm from '@/components/perfil/InformacionAcademicaForm';
import ProyectoGraduacionForm from '@/components/perfil/ProyectoGraduacionForm';
import HabilidadesForm from '@/components/perfil/HabilidadesForm';
import { obtenerInformacionEstudiante } from '@/lib/perfilAcademico';
import perfilStyles from '@/components/perfil/perfil.module.css';

// Página del perfil de estudiante (RF-03). Incluye la Sección 1 (Información
// Académica / Situación Socioeconómica), la Sección 3 (Proyecto de
// Graduación) y la Sección 6 (Habilidades). La Sección 3 depende de que
// exista informacion_estudiante (FK proyecto_graduacion_id_estudiante_fkey),
// por lo que se oculta hasta que la Sección 1 esté completa.
export default function PerfilEstudiantePage() {
  const router = useRouter();
  const { token, user, loading, signOut } = useAuth();

  const [verificandoPerfil, setVerificandoPerfil] = useState(true);
  const [perfilAcademicoListo, setPerfilAcademicoListo] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token || !user?.id) return;
    let activo = true;

    obtenerInformacionEstudiante(token, user.id).then((informacion) => {
      if (!activo) return;
      setPerfilAcademicoListo(Boolean(informacion));
      setVerificandoPerfil(false);
    });

    return () => {
      activo = false;
    };
  }, [token, user?.id]);

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  if (loading || !token) {
    return <div className="flex min-h-screen items-center justify-center bg-ucr-surface font-brand-body text-ucr-on-surface">Cargando…</div>;
  }

  const correo = user?.email ?? '—';
  const inicial = correo.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-ucr-surface font-brand-body text-ucr-on-surface lg:flex">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ucr-outline-variant bg-white px-6 py-8 lg:flex">
        <Link href="/" aria-label="Alumni UCR — inicio" className="mb-10 block">
          <AlumniLogo height={32} />
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ucr-outline">
            Paneles
          </p>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container"
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <span className="flex items-center gap-3 rounded-xl bg-ucr-secondary-container/30 px-3 py-2 text-sm font-semibold text-ucr-primary">
            <span className="material-symbols-outlined">person</span>
            Mi perfil
          </span>
          <span
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-outline opacity-60 cursor-not-allowed"
            title="Próximamente"
            aria-disabled="true"
          >
            <span className="material-symbols-outlined">groups</span>
            Directorio
          </span>

          <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-ucr-outline">
            Secciones
          </p>
          <a
            href="#academico"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container"
          >
            <span className="material-symbols-outlined">school</span>
            Información académica
          </a>
          <a
            href="#proyecto"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container"
          >
            <span className="material-symbols-outlined">assignment</span>
            Proyecto de graduación
          </a>
          <a
            href="#habilidades"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container"
          >
            <span className="material-symbols-outlined">workspace_premium</span>
            Habilidades
          </a>
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
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

        {/* Bento grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section
            id="academico"
            className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-8"
          >
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
            <InformacionAcademicaForm onGuardado={() => setPerfilAcademicoListo(true)} />
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-ucr-secondary">checklist</span>
              <h2 className="font-brand-heading text-xl font-bold text-ucr-on-surface">
                Estado del perfil
              </h2>
            </div>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined ${
                    perfilAcademicoListo ? 'text-ucr-esmeralda' : 'text-ucr-outline'
                  }`}
                >
                  {perfilAcademicoListo ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                Información académica
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined ${
                    perfilAcademicoListo ? 'text-ucr-esmeralda' : 'text-ucr-outline'
                  }`}
                >
                  {perfilAcademicoListo ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                Proyecto de graduación
              </li>
              {!perfilAcademicoListo && !verificandoPerfil && (
                <li className={perfilStyles.aviso}>
                  Completa la información académica para habilitar el proyecto de graduación.
                </li>
              )}
            </ul>
          </section>

          <section
            id="proyecto"
            className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-12"
          >
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
              <ProyectoGraduacionForm />
            ) : (
              <p className={perfilStyles.aviso}>
                Primero completa y guarda tu información académica para poder registrar tu
                proyecto de graduación.
              </p>
            )}
          </section>

          <section
            id="habilidades"
            className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-12"
          >
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
            <HabilidadesForm />
          </section>
        </div>
      </main>
    </div>
  );
}
