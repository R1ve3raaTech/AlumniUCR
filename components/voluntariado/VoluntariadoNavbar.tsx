'use client';

// Navbar propio de /voluntariado (público, sin sesión requerida). No reutiliza
// el Navbar de la landing porque pide un menú distinto (Inicio | Alumni |
// Voluntariado | Contacto), específico de esta página.

import React, { useState } from 'react';
import Link from 'next/link';
import AlumniLogo from '@/components/AlumniLogo';

const LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Alumni', href: '/login' },
  { label: 'Voluntariado', href: '/voluntariado', activo: true },
  { label: 'Contacto', href: '/ayuda' },
];

export default function VoluntariadoNavbar() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ucr-outline-variant bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Alumni UCR — inicio">
          <AlumniLogo height={34} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-semibold transition-colors ${
                l.activo ? 'text-ucr-secondary' : 'text-ucr-on-surface-variant hover:text-ucr-primary'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg text-ucr-primary md:hidden"
          aria-label="Abrir menú"
          aria-expanded={abierto}
        >
          <span className="material-symbols-outlined">{abierto ? 'close' : 'menu'}</span>
        </button>
      </div>

      {abierto && (
        <nav className="flex flex-col gap-1 border-t border-ucr-outline-variant bg-white px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setAbierto(false)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                l.activo ? 'bg-ucr-secondary/10 text-ucr-secondary' : 'text-ucr-on-surface-variant'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
