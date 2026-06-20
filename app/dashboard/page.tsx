'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
import StudentNav from '@/components/StudentNav';
import ExalumnoDashboard from '@/components/ExalumnoDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { obtenerInformacionEstudiante } from '@/lib/perfilAcademico';
import { obtenerProyectoDelEstudiante } from '@/lib/proyectoGraduacion';
import { obtenerHabilidadesDelEstudiante } from '@/lib/habilidades';

interface Perfil {
  nombre?: string;
  correo_electronico?: string;
  estado?: string;
  roles?: { nombre?: string } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading, signOut } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [perfilCargando, setPerfilCargando] = useState(true);

  // Estado de avance del perfil (RF-03), igual que en /perfil-estudiante.
  const [estado, setEstado] = useState({ academica: false, proyecto: false, habilidades: false });
  // RF-03: al llegar al 100% el sistema pregunta si el perfil quedó finalizado.
  const [finalizado, setFinalizado] = useState(false);

  // Protección client-side: si no hay sesión una vez hidratado, redirige al login.
  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  // Carga el perfil (con rol) para mostrar el panel correspondiente.
  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const res = await obtenerPerfil(token);
        if (activo) setPerfil(res?.data ?? null);
      } catch {
        if (activo) setPerfil(null);
      } finally {
        if (activo) setPerfilCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [token]);

  const refrescarEstado = useCallback(async () => {
    if (!token || !user?.id) return;
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
  }, [token, user?.id]);

  useEffect(() => {
    if (token && user?.id) refrescarEstado();
  }, [token, user?.id, refrescarEstado]);

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  // Evita parpadeo de contenido protegido mientras se hidrata o se redirige.
  if (loading || !token || perfilCargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ucr-surface font-brand-body text-ucr-on-surface">
        Cargando…
      </div>
    );
  }

  const correo = user?.email ?? perfil?.correo_electronico ?? '—';
  const rol = perfil?.roles?.nombre?.toLowerCase().trim();

  // Panel dedicado del exalumno (identidad de marca).
  if (rol === 'exalumno') {
    return (
      <ExalumnoDashboard
        perfil={perfil}
        correo={correo}
        onSignOut={handleSignOut}
        userId={user?.id}
        token={token ?? undefined}
      />
    );
  }

  // Panel del administrador (identidad del landing) con matching interdisciplinario.
  if (rol === 'admin') {
    return <AdminDashboard correo={correo} onSignOut={handleSignOut} />;
  }

  const completadas = [estado.academica, estado.proyecto, estado.habilidades].filter(Boolean).length;
  const progreso = Math.round((completadas / 3) * 100);
  const inicial = correo.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-ucr-surface font-brand-body text-ucr-on-surface">
      <StudentNav onSignOut={handleSignOut} />

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
                ¡Hola de nuevo!
              </h1>
              <p className="mt-1 text-sm text-white/80">
                Has iniciado sesión como <span className="font-semibold">{correo}</span>.
              </p>
            </div>
          </div>
        </section>

        {/* RF-03: al llegar al 100% el sistema pregunta si el perfil quedó finalizado */}
        {progreso === 100 && (
          <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ucr-esmeralda/30 bg-ucr-esmeralda/5 p-6">
            {finalizado ? (
              <p className="font-brand-heading text-base font-semibold text-ucr-esmeralda">
                ✓ Marcaste tu perfil como finalizado. Ya está listo para aparecer en el directorio.
              </p>
            ) : (
              <>
                <div>
                  <h2 className="font-brand-heading text-lg font-bold text-ucr-on-surface">
                    ¿Diste por finalizado tu perfil?
                  </h2>
                  <p className="mt-1 text-sm text-ucr-on-surface-variant">
                    Llegaste al 100%. Confirma si ya está listo o seguí editándolo.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setFinalizado(true)} className="btn-primary">
                    Sí, está listo
                  </button>
                  <Link
                    href="/perfil-estudiante"
                    className="rounded-full border border-ucr-outline-variant px-5 py-2 text-sm font-semibold text-ucr-primary"
                  >
                    Seguir editando
                  </Link>
                </div>
              </>
            )}
          </section>
        )}

        {/* Bento grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="rounded-3xl bg-white p-6 shadow-lg lg:col-span-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-ucr-secondary">checklist</span>
              <h2 className="font-brand-heading text-xl font-bold text-ucr-on-surface">
                Estado del perfil
              </h2>
            </div>
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
                { ok: estado.academica, label: 'Académica y situación socioeconómica' },
                { ok: estado.proyecto, label: 'Proyecto, áreas de interés y tipo de apoyo' },
                { ok: estado.habilidades, label: 'Habilidades' },
              ].map((s) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined ${
                      s.ok ? 'text-ucr-esmeralda' : 'text-ucr-outline'
                    }`}
                  >
                    {s.ok ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  {s.label}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-lg lg:col-span-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-ucr-secondary">person</span>
              <h2 className="font-brand-heading text-xl font-bold text-ucr-on-surface">
                Mi perfil
              </h2>
            </div>
            <p className="mb-4 text-sm text-ucr-on-surface-variant">
              Completa y actualiza tu información académica, proyecto de graduación y
              habilidades.
            </p>
            <Link href="/perfil-estudiante" className="btn-primary">
              Ir a mi perfil
            </Link>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-lg lg:col-span-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-ucr-secondary">bolt</span>
              <h2 className="font-brand-heading text-xl font-bold text-ucr-on-surface">
                Accesos rápidos
              </h2>
            </div>
            <p className="mb-4 text-sm text-ucr-on-surface-variant">
              Las funciones clave de tu cuenta de estudiante.
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { href: '/mis-matches', icon: 'handshake', label: 'Mis matches con mentores' },
                { href: '/estudiantes', icon: 'groups', label: 'Directorio de exalumnos' },
                { href: '/posiciones', icon: 'work', label: 'Empleos y pasantías' },
                { href: '/mi-curriculum', icon: 'description', label: 'Mi currículum (CV + IA)' },
              ].map((a) => (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-ucr-on-surface transition-colors hover:bg-ucr-surface-container"
                  >
                    <span className="material-symbols-outlined text-ucr-secondary">{a.icon}</span>
                    {a.label}
                    <span className="material-symbols-outlined ml-auto text-ucr-outline">chevron_right</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
