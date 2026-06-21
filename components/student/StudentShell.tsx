'use client';

// Shell del área de estudiante (rediseño Stitch): sidebar fijo + header + main.
// Reutilizable por dashboard, perfil, CV, matches y directorio. Identidad =
// usuario logueado (sin datos quemados). Paleta/markup fieles al diseño Stitch.

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AlumniLogo from '@/components/AlumniLogo';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { key: 'dashboard', href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { key: 'perfil', href: '/perfil-estudiante', icon: 'person', label: 'Mi Perfil' },
  { key: 'cv', href: '/mi-curriculum', icon: 'description', label: 'CV + IA' },
  { key: 'matches', href: '/mis-matches', icon: 'handshake', label: 'Matches' },
  { key: 'directorio', href: '/directorio', icon: 'list_alt', label: 'Directorio' },
  { key: 'comunidad', href: '#', icon: 'group', label: 'Comunidad' },
  { key: 'reportes', href: '#', icon: 'report', label: 'Reportes' },
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
  const router = useRouter();
  const { user, signOut } = useAuth();

  const correo = user?.email ?? '';
  const nombreMostrar = nombre || (correo ? correo.split('@')[0] : 'Estudiante');
  const iniciales = nombreMostrar
    .split(/[.\s_-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const salir = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <div className="bg-background text-on-background font-body-base antialiased">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col gap-2 border-r border-outline-variant bg-surface-container-low p-6">
        <div className="mb-8 flex w-full items-center justify-center py-2">
          <Link href="/dashboard" aria-label="UCR Conecta — inicio">
            <AlumniLogo height={56} />
          </Link>
        </div>

        <div className="mb-8 flex flex-col items-center px-4">
          <div className="relative mb-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-display-lg text-2xl font-bold text-primary shadow-sm">
              {iniciales || 'E'}
            </div>
            <div className="absolute bottom-0 right-0 rounded-full border-2 border-surface-container-low bg-secondary p-1 text-on-secondary">
              <span className="material-symbols-outlined text-xs">verified</span>
            </div>
            <div className="absolute left-0 top-0 h-3 w-3 rounded-full border-2 border-surface-container-low bg-green-500 shadow-sm" title="En línea" />
          </div>
          <h2 className="font-body-semibold text-primary">{nombreMostrar}</h2>
          <p className="text-xs font-bold uppercase tracking-tighter text-on-surface-variant">Estudiante UCR</p>
        </div>

        <nav className="flex flex-grow flex-col gap-1">
          {NAV.map((item) => {
            const activo = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={
                  activo
                    ? 'flex items-center gap-4 rounded-lg bg-primary-container p-4 font-bold text-on-primary-container'
                    : 'flex items-center gap-4 rounded-lg p-4 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface'
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-6">
          <Link href="#" className="flex items-center gap-4 rounded-lg p-4 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-semibold">Configuración</span>
          </Link>
          <button
            type="button"
            onClick={salir}
            className="flex items-center gap-4 rounded-lg p-4 text-on-surface-variant transition-all hover:bg-error/10 hover:text-error"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-semibold">Salir</span>
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed left-64 right-0 top-0 z-40 h-16 border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between px-8">
          <div className="max-w-xl flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-full rounded-full border-none bg-surface-container py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-secondary"
                placeholder="Buscar en la red UCR..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-variant">
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
      <main className="ml-64 min-h-screen pt-16">{children}</main>
    </div>
  );
}
