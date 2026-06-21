'use client';

// Editor de currículum paso a paso (manual). En construcción: se armará con la
// plantilla de Stitch. Por ahora muestra los apartados previstos.

import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';

const APARTADOS = [
  { icon: 'person', label: 'Datos personales' },
  { icon: 'badge', label: 'Perfil profesional' },
  { icon: 'work', label: 'Experiencia laboral' },
  { icon: 'school', label: 'Educación' },
  { icon: 'stars', label: 'Habilidades e idiomas' },
  { icon: 'workspace_premium', label: 'Certificaciones' },
];

export default function EditorCurriculumPage() {
  return (
    <StudentShell active="cv">
      <div className="mx-auto max-w-3xl p-8">
        <Link href="/mi-curriculum/crear" className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined text-base">arrow_back</span> Volver
        </Link>
        <h1 className="font-headline-md text-2xl text-primary">Crear currículum paso a paso</h1>
        <p className="mt-1 text-on-surface-variant">El editor manual se construirá con tu plantilla de Stitch. Apartados previstos:</p>

        <ol className="mt-6 space-y-3">
          {APARTADOS.map((a, i) => (
            <li key={a.label} className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">{i + 1}</span>
              <span className="material-symbols-outlined text-on-surface-variant">{a.icon}</span>
              <span className="font-body-semibold text-on-surface">{a.label}</span>
            </li>
          ))}
        </ol>

        <p className="mt-6 rounded-xl bg-secondary/5 p-4 text-sm text-on-surface-variant">
          🧩 Pasame el <strong>Stitch del editor paso a paso</strong> y lo construyo fiel, con estos apartados y la edición manual conectada a tu perfil.
        </p>
      </div>
    </StudentShell>
  );
}
