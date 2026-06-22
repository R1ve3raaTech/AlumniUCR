'use client';

// Configuración (estudiante) — agrupa Ayuda, Accesibilidad y Cerrar sesión.
// Antes "Salir" vivía suelto en el panel lateral; ahora vive aquí para no
// competir visualmente con la navegación principal.

import React from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';

const SHADOW = 'shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';
const CARD = `rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ${SHADOW}`;

function Fila({
  icono,
  titulo,
  descripcion,
  accion,
}: {
  icono: string;
  titulo: string;
  descripcion: string;
  accion: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
          <span className="material-symbols-outlined">{icono}</span>
        </div>
        <div>
          <h3 className="font-body-semibold text-on-surface">{titulo}</h3>
          <p className="text-sm text-on-surface-variant">{descripcion}</p>
        </div>
      </div>
      {accion}
    </div>
  );
}

export default function ConfiguracionPage() {
  return (
    <StudentShell active="configuracion">
      <div className="mx-auto flex max-w-[900px] flex-col gap-6 p-8">
        <h1 className="font-headline-md text-3xl text-primary">Configuración</h1>

        <div className={CARD}>
          <div className="divide-y divide-outline-variant/30">
            <Fila
              icono="help"
              titulo="Ayuda y soporte"
              descripcion="Preguntas frecuentes, guías y contacto con soporte."
              accion={
                <Link
                  href="/ayuda"
                  className="rounded-lg border border-outline px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-variant"
                >
                  Ir a Ayuda
                </Link>
              }
            />
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
