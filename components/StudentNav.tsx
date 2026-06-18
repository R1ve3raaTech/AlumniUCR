'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AlumniLogo from '@/components/AlumniLogo';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/perfil-estudiante', label: 'Mi perfil' },
  { href: '/mi-curriculum', label: 'Mi CV' },
  { href: '/mis-matches', label: 'Mis matches' },
  { href: '/posiciones', label: 'Posiciones' },
  { href: '/estudiantes?rol=estudiante', label: 'Directorio' },
];

export default function StudentNav({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-ucr-outline-variant bg-white">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Alumni UCR inicio" className="shrink-0">
          <AlumniLogo height={30} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label }) => {
            const base = href.split('?')[0];
            const active = pathname === base;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                  active
                    ? 'bg-ucr-secondary-container/30 text-ucr-primary'
                    : 'text-ucr-on-surface-variant hover:bg-ucr-surface-container'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-2 rounded-xl border border-ucr-outline-variant px-4 py-2 text-sm font-semibold text-ucr-on-surface-variant transition hover:bg-ucr-surface-container"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Cerrar sesion
        </button>
      </div>
    </header>
  );
}
