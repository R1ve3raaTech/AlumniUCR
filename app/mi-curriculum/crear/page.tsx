'use client';

// Intro del editor de currículum: el estudiante elige entre subir un CV ya
// hecho (mejorar) o crear uno nuevo paso a paso con una plantilla.

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';

const ACEPTADOS = ['application/pdf', 'image/jpeg', 'image/png'];

interface Archivo {
  nombre: string;
  tipo: string;
  url: string; // data URL para la vista previa
}

export default function CrearCurriculumPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [archivo, setArchivo] = useState<Archivo | null>(null);
  const [error, setError] = useState('');

  // Muestra un error que se borra solo a los 4s (no se queda pegado).
  const mostrarError = (msg: string) => {
    setError(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setError(''), 4000);
  };

  const onArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ''; // reset: permite re-seleccionar el mismo archivo y evita que se bugee
    if (!f) return;
    if (!ACEPTADOS.includes(f.type)) {
      mostrarError(`«${f.name}» no es un formato válido. Solo se aceptan PDF, JPG o PNG.`);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setArchivo({ nombre: f.name, tipo: f.type, url: String(reader.result) });
      notificar(`📄 Recibido: ${f.name}`);
    };
    reader.readAsDataURL(f);
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
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={onArchivo}
            />
          </div>

          {/* Error (auto-desaparece) */}
          <div className="mt-6 min-h-[2.75rem]">
            {error && (
              <p className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-sm font-semibold text-error">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </p>
            )}
          </div>

          {/* Archivo elegido: vista previa + cambiar/eliminar + continuar */}
          {archivo && (
            <div className="mx-auto mt-2 w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 text-left shadow-sm">
              {/* Mini vista previa */}
              <div className="mb-3 grid h-44 place-items-center overflow-hidden rounded-xl bg-surface-container">
                {archivo.tipo.startsWith('image/') ? (
                  <img src={archivo.url} alt={archivo.nombre} className="h-full w-full object-contain" />
                ) : (
                  <iframe src={archivo.url} title="Vista previa del PDF" className="h-full w-full" />
                )}
              </div>

              {/* Nombre + acciones */}
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                  <span className="truncate">{archivo.nombre}</span>
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-secondary hover:bg-secondary/10"
                  >
                    <span className="material-symbols-outlined text-base">cached</span> Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchivo(null)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-error hover:bg-error/10"
                  >
                    <span className="material-symbols-outlined text-base">delete</span> Eliminar
                  </button>
                </div>
              </div>

              {/* Continuar */}
              <Link
                href="/mi-curriculum/editor"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-on-primary transition-transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined">auto_fix_high</span> Mejorar este CV
              </Link>
            </div>
          )}

          {/* Formatos aceptados — con más presencia */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm font-extrabold uppercase tracking-wider text-on-surface-variant">
              Formatos aceptados
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['PDF', 'JPG', 'PNG'].map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container px-4 py-1.5 text-sm font-bold text-primary"
                >
                  <span className="material-symbols-outlined text-base">description</span> {f}
                </span>
              ))}
            </div>
            <p className="text-xs font-medium text-on-surface-variant">
              Desde tu galería, archivos o Drive (descargado).
            </p>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
