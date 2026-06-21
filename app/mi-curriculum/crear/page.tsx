'use client';

// Intro del editor de currículum: el estudiante elige entre subir un CV ya
// hecho (mejorar) o crear uno nuevo paso a paso con una plantilla.

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';

export default function CrearCurriculumPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [archivo, setArchivo] = useState('');

  const onArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setArchivo(f.name);
    notificar(`📄 Recibido: ${f.name}`);
  };

  return (
    <StudentShell active="cv">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-3xl place-items-center p-8">
        <div className="w-full text-center">
          {/* Volver */}
          <Link
            href="/mi-curriculum"
            className="mb-8 inline-flex items-center gap-1 text-sm font-bold text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span> Volver al CV
          </Link>

          <h1 className="font-headline-lg text-4xl font-extrabold leading-tight text-on-background sm:text-5xl">
            ¡Crea un <span className="text-secondary">currículum ganador</span> en minutos!
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-on-surface-variant">
            Subí un CV que ya tengas para mejorarlo, o empezá uno nuevo paso a paso con nuestra plantilla.
          </p>

          {/* Opciones */}
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-secondary bg-surface-container-lowest px-8 py-4 font-bold text-secondary transition-colors hover:bg-secondary/5"
            >
              <span className="material-symbols-outlined">upload</span> Mejorar mi currículum
            </button>
            <Link
              href="/mi-curriculum/editor"
              className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-8 py-4 font-bold text-on-secondary transition-transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined">edit_document</span> Crear nuevo currículum
            </Link>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={onArchivo}
            />
          </div>

          {archivo && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-lg bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
              <span className="material-symbols-outlined text-base">check_circle</span>
              {archivo} — listo para mejorar
            </p>
          )}

          <p className="mt-8 text-xs text-on-surface-variant">
            Formatos aceptados: PDF, JPG o PNG · desde tu galería, archivos o Drive (descargado).
          </p>
        </div>
      </div>
    </StudentShell>
  );
}
