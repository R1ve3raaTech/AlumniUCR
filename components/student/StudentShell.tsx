'use client';

// Shell del área de estudiante (rediseño Stitch): sidebar fijo + header + main.
// Reutilizable por dashboard, perfil, CV, matches y directorio. Identidad =
// usuario logueado (sin datos quemados). Paleta/markup fieles al diseño Stitch.

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AlumniLogo from '@/components/AlumniLogo';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
import Toast, { notificar } from '@/components/student/Toast';
import AvatarUploader from '@/components/student/AvatarUploader';

// Departamentos del estudiante. Todos activos.
const NAV: { key: string; href: string; icon: string; label: string; proximamente?: boolean }[] = [
  { key: 'dashboard', href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { key: 'perfil', href: '/perfil-estudiante', icon: 'person', label: 'Mi Perfil' },
  { key: 'cv', href: '/mi-curriculum', icon: 'description', label: 'CV + IA' },
  { key: 'matches', href: '/mis-matches', icon: 'handshake', label: 'Matches' },
  { key: 'directorio', href: '/directorio', icon: 'list_alt', label: 'Directorio' },
  { key: 'comunidad', href: '/comunidad', icon: 'group', label: 'Comunidad' },
  { key: 'reportes', href: '/reportes', icon: 'report', label: 'Reportes' },
];

export default function StudentShell({
  active,
  nombre,
  children,
}: {
  active?: string;
  nombre?: string;
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const salir = () => { signOut(); router.replace('/login'); };
  const { perfil, actualizar } = usePerfilEstudiante();
  const [editorFoto, setEditorFoto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const correo = user?.email ?? '';
  const nombrePerfil = `${perfil.nombre} ${perfil.apellidos}`.trim();
  const nombreMostrar = nombre || nombrePerfil || (correo ? correo.split('@')[0] : 'Estudiante');
  const subtitulo = perfil.carrera ? `Estudiante · ${perfil.carrera}` : 'Estudiante UCR';
  const iniciales = nombreMostrar
    .split(/[.\s_-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  // Nombre compacto y responsivo: primer nombre + inicial del apellido (ej. "Carlos J.").
  const primerNombre = (perfil.nombre || nombreMostrar).trim().split(/\s+/)[0] || 'Estudiante';
  const inicialApellido = (perfil.apellidos || '').trim().charAt(0);
  const nombreCompacto = inicialApellido ? `${primerNombre} ${inicialApellido.toUpperCase()}.` : primerNombre;

  return (
    <div className="bg-background text-on-background font-body-base antialiased">
      {/* Sidebar */}
      {/* Overlay para cerrar el menú en móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuAbierto(false)} aria-hidden />
      )}

      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col gap-2 border-r border-outline-variant bg-surface-container-low p-6 transition-transform duration-300 lg:translate-x-0 ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex w-full shrink-0 items-center justify-center py-1 sm:mb-8 sm:py-2">
          <Link href="/dashboard" aria-label="UCR Conecta — inicio">
            <AlumniLogo className="!h-11 w-auto sm:!h-14" />
          </Link>
        </div>

        <div className="mb-6 flex shrink-0 flex-col items-center px-2 sm:mb-8">
          <div className="relative mb-3 sm:mb-4">
            {perfil.foto ? (
              <img
                src={perfil.foto}
                alt={nombreMostrar}
                className="h-20 w-20 rounded-full border-2 border-primary object-cover object-center shadow-sm sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-display-lg text-2xl font-bold text-primary shadow-sm sm:h-24 sm:w-24">
                {iniciales || 'E'}
              </div>
            )}
            {/* Botón para subir/editar la foto */}
            <button
              type="button"
              onClick={() => setEditorFoto(true)}
              title="Cambiar foto"
              aria-label="Cambiar foto de perfil"
              className="absolute bottom-0 right-0 rounded-full border-2 border-surface-container-low bg-secondary p-1.5 text-on-secondary transition-transform hover:scale-110"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
            <div className="absolute left-0 top-0 h-3 w-3 rounded-full border-2 border-surface-container-low bg-green-500 shadow-sm" title="En línea" />
          </div>
          <h2 className="max-w-full truncate font-body-semibold text-primary" title={nombreMostrar}>{nombreCompacto}</h2>
          <p className="max-w-full truncate text-xs font-bold uppercase tracking-tighter text-on-surface-variant" title={subtitulo}>{subtitulo}</p>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => {
            const activo = item.key === active;
            const claseBase = activo
              ? 'flex items-center gap-3 rounded-lg bg-primary-container p-3 font-bold text-on-primary-container sm:gap-4 sm:p-3.5'
              : 'flex items-center gap-3 rounded-lg p-3 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface sm:gap-4 sm:p-3.5';

            // Departamentos por crear: botón con aviso, sin navegar a un link muerto.
            if (item.proximamente) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => notificar('🚧 Departamento en desarrollo')}
                  className={`${claseBase} text-left`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-body-semibold">{item.label}</span>
                  <span className="ml-auto rounded-full bg-surface-variant px-2 py-0.5 text-[11px] font-bold uppercase text-on-surface-variant">
                    Pronto
                  </span>
                </button>
              );
            }

            return (
              <Link key={item.key} href={item.href} className={claseBase}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 flex-col gap-1 border-t border-outline-variant pt-6">
          <Link
            href="/configuracion"
            className={
              active === 'configuracion'
                ? 'flex items-center gap-4 rounded-lg bg-primary-container p-4 font-bold text-on-primary-container'
                : 'flex items-center gap-4 rounded-lg p-4 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface'
            }
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-semibold">Configuración</span>
          </Link>
          <button
            type="button"
            onClick={salir}
            className="flex items-center gap-4 rounded-lg p-4 text-left text-error transition-all hover:bg-error/10"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-semibold">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-outline-variant bg-surface-container-lowest lg:left-64">
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between gap-2 px-4 sm:px-8">
          {/* En móvil el logo va en el header (el sidebar está oculto). */}
          <Link href="/dashboard" className="lg:hidden" aria-label="Inicio">
            <AlumniLogo className="!h-8 w-auto" />
          </Link>
          <div className="hidden max-w-xl flex-1 lg:block">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                className="w-full rounded-full border border-outline-variant bg-surface-container py-2 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                placeholder="Buscar en la red UCR..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => notificar('🔔 No tenés notificaciones nuevas')}
              className="relative rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
            </button>
            <div className="flex cursor-pointer items-center gap-2 rounded-lg p-1 transition-all hover:bg-surface-container">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {iniciales || 'E'}
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ml-0 min-h-screen pb-16 pt-16 lg:ml-64 lg:pb-0">{children}</main>

      {/* Barra inferior estilo app (solo móvil): SOLO íconos, con indicador
          activo en píldora (Material 3). El resto de opciones vive en el Menú. */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-stretch justify-around border-t border-outline-variant bg-surface-container-lowest shadow-[0_-4px_16px_-10px_rgba(0,40,55,0.25)] lg:hidden">
        {NAV.slice(0, 4).map((item) => {
          const activo = item.key === active;
          return (
            <Link key={item.key} href={item.href} aria-label={item.label} aria-current={activo ? 'page' : undefined}
              className="flex flex-1 flex-col items-center justify-center">
              <span className={`grid place-items-center rounded-full px-5 py-1 transition-colors ${activo ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>
                <span className="material-symbols-outlined" style={activo ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              </span>
            </Link>
          );
        })}
        <button type="button" onClick={() => setMenuAbierto(true)} aria-label="Más opciones"
          className="flex flex-1 flex-col items-center justify-center">
          <span className="grid place-items-center rounded-full px-5 py-1 text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </span>
        </button>
      </nav>

      <AvatarUploader
        abierto={editorFoto}
        fotoActual={perfil.foto}
        onGuardar={(foto) => actualizar({ foto })}
        onCerrar={() => setEditorFoto(false)}
      />
      <Toast />
    </div>
  );
}
