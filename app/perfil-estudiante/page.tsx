'use client';

// Mi perfil (estudiante) — EN RECONSTRUCCIÓN. Se rehará desde cero con Stitch.
import Link from 'next/link';

export default function PerfilEstudiantePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ucr-surface p-8 text-center font-brand-body text-ucr-on-surface">
      <div>
        <p className="font-ucr-display text-2xl font-bold text-ucr-primary">Mi perfil</p>
        <p className="mt-2 text-ucr-on-surface-variant">Sección en reconstrucción.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-ucr-esmeralda px-5 py-2 text-sm font-bold text-white"
        >
          Volver al panel
        </Link>
      </div>
    </main>
  );
}
