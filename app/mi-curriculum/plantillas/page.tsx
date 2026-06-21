'use client';

// Paso 1 del "Crear nuevo currículum": selección de plantilla con intervención de
// IA (recomendaciones según la carrera del estudiante) + conexión a Ayuda, chat
// inteligente y búsqueda web. Adaptado del Stitch a nuestra realidad.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';

const FILTROS = ['Todas', 'Simple', 'Profesional', 'Moderno', 'ATS'];

interface Plantilla {
  id: string;
  nombre: string;
  desc: string;
  cats: string[];
  cta: string;
  preview: React.ReactNode;
}

// Mini maquetas de las plantillas (placeholders, fieles al estilo del Stitch).
const PLANTILLAS: Plantilla[] = [
  {
    id: 'corporativa',
    nombre: 'Elegancia Corporativa',
    desc: 'Ideal para perfiles con experiencia. Clásica y sobria.',
    cats: ['Profesional', 'ATS'],
    cta: 'Elegir Diseño Clásico',
    preview: (
      <div className="flex h-full w-full flex-col gap-2 border border-gray-100 p-4">
        <div className="mb-3 h-6 w-3/4 bg-gray-100" />
        <div className="h-2 w-1/2 bg-gray-50" /><div className="h-2 w-full bg-gray-50" /><div className="h-2 w-full bg-gray-50" />
        <div className="mt-3 border-t pt-3"><div className="mb-2 h-4 w-1/3 bg-gray-100" /><div className="h-2 w-full bg-gray-50" /><div className="h-2 w-full bg-gray-50" /></div>
        <div className="mt-3 border-t pt-3"><div className="mb-2 h-4 w-1/3 bg-gray-100" /><div className="h-2 w-2/3 bg-gray-50" /></div>
      </div>
    ),
  },
  {
    id: 'moderna',
    nombre: 'Impacto Visual',
    desc: 'Columna lateral teal. Recomendada para tecnología.',
    cats: ['Moderno'],
    cta: 'Elegir Diseño Moderno',
    preview: (
      <div className="flex h-full w-full">
        <div className="flex w-1/3 flex-col gap-3 bg-primary p-3">
          <div className="aspect-square w-full rounded bg-white/20" />
          <div className="h-2 w-full bg-white/20" /><div className="h-2 w-2/3 bg-white/20" />
          <div className="mt-auto h-16 w-full rounded bg-white/10" />
        </div>
        <div className="w-2/3 bg-white p-4">
          <div className="mb-2 h-5 w-1/2 bg-gray-100" /><div className="mb-4 h-3 w-1/3 bg-gray-50" />
          <div className="space-y-3"><div className="h-2 w-full bg-gray-50" /><div className="h-2 w-full bg-gray-50" /><div className="h-24 w-full rounded bg-gray-100/60" /></div>
        </div>
      </div>
    ),
  },
  {
    id: 'tecnica',
    nombre: 'Equilibrio Técnico',
    desc: 'Fácil de leer para reclutadores de tech. ATS-friendly.',
    cats: ['Simple', 'ATS'],
    cta: 'Elegir Diseño Estructural',
    preview: (
      <div className="flex h-full w-full gap-4 bg-[#f4f7f8] p-4">
        <div className="w-1/3"><div className="mb-3 h-4 w-full bg-secondary/20" /><div className="space-y-2"><div className="h-1.5 w-full bg-gray-200" /><div className="h-1.5 w-full bg-gray-200" /><div className="h-1.5 w-full bg-gray-200" /></div></div>
        <div className="w-2/3"><div className="mb-2 h-7 w-3/4 bg-gray-100" /><div className="mb-4 h-3 w-1/2 bg-secondary/20" /><div className="space-y-3"><div className="h-2 w-full bg-gray-200" /><div className="h-2 w-full bg-gray-200" /><div className="h-2 w-5/6 bg-gray-200" /></div></div>
      </div>
    ),
  },
];

export default function PlantillasCVPage() {
  const router = useRouter();
  const { perfil } = usePerfilEstudiante();
  const [filtro, setFiltro] = useState('Todas');
  const [sel, setSel] = useState<string | null>(null);
  const [mostrarFoto, setMostrarFoto] = useState(true);

  const carrera = perfil.carrera || 'tu carrera';
  const nombre = perfil.nombre || 'estudiante';

  const visibles = useMemo(
    () => (filtro === 'Todas' ? PLANTILLAS : PLANTILLAS.filter((p) => p.cats.includes(filtro))),
    [filtro],
  );

  const continuar = () => {
    if (!sel) {
      notificar('Elegí una plantilla para continuar');
      return;
    }
    router.push(`/mi-curriculum/editor?plantilla=${sel}`);
  };

  const buscarWeb = () =>
    window.open(`https://www.google.com/search?q=${encodeURIComponent(`plantillas de CV ${carrera} ATS`)}`, '_blank', 'noopener');
  const abrirChat = () => {
    // El GlobalChatbot escucha este evento para abrirse.
    window.dispatchEvent(new Event('open-global-chatbot'));
    notificar('💬 Abriendo el asistente inteligente…');
  };

  return (
    <StudentShell active="cv">
      <div className="mx-auto max-w-[1100px] p-8">
        {/* Indicador de pasos */}
        <div className="mb-10 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm">
            <Paso n="1" label="Elegir plantilla" activo />
            <span className="h-px w-12 bg-outline-variant" />
            <Paso n="2" label="Ingresá tus datos" />
            <span className="h-px w-12 bg-outline-variant" />
            <Paso n="3" label="Descargar currículum" />
          </div>
        </div>

        {/* Encabezado con IA */}
        <div className="mb-8 text-center">
          <h2 className="font-headline-md text-2xl text-primary sm:text-3xl">
            Elegí una plantilla que te ayude a conseguir el empleo
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-on-surface-variant">
            La IA analizó tu perfil y recomienda estas plantillas según tu carrera de{' '}
            <span className="font-bold text-primary">{carrera}</span>.
          </p>
        </div>

        {/* Filtros + toggle foto */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-1">
            {FILTROS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  filtro === f ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 px-4 text-sm font-semibold text-on-surface-variant">
            Mostrar foto de perfil
            <input type="checkbox" checked={mostrarFoto} onChange={(e) => setMostrarFoto(e.target.checked)} className="h-5 w-9 accent-secondary" />
          </label>
        </div>

        {/* Grid de plantillas */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {visibles.map((p) => {
            const elegida = sel === p.id;
            return (
              <article
                key={p.id}
                className={`group relative overflow-hidden rounded-xl border bg-white shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-1 ${
                  elegida ? 'border-secondary ring-2 ring-secondary' : 'border-outline-variant'
                }`}
              >
                <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-primary shadow-md">
                  <span className="material-symbols-outlined text-sm">star</span> Recomendado
                </div>
                <div className="relative aspect-[1/1.3] overflow-hidden bg-[#fdfdfd] p-4">
                  {p.preview}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary/40 p-6 text-center opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <button type="button" onClick={() => setSel(p.id)} className="w-full rounded-xl bg-white py-3 font-bold text-primary shadow-lg">
                      {p.cta}
                    </button>
                    <button type="button" onClick={() => notificar('🔍 Vista previa próximamente')} className="w-full rounded-xl border-2 border-white py-3 font-bold text-white">
                      Vista Previa
                    </button>
                  </div>
                </div>
                <div className="border-t border-outline-variant bg-surface-container-low p-5">
                  <h4 className="flex items-center gap-2 font-body-semibold text-primary">
                    {p.nombre}
                    {elegida && <span className="material-symbols-outlined text-base text-secondary">check_circle</span>}
                  </h4>
                  <p className="text-sm text-on-surface-variant">{p.desc}</p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Acción */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={continuar}
            className="rounded-xl bg-gradient-to-r from-primary to-secondary px-12 py-4 text-lg font-bold text-on-primary shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            Seleccionar y Continuar
          </button>
          <Link href="/mi-curriculum/editor" className="font-body-semibold text-primary underline-offset-4 hover:underline">
            O elegir más adelante
          </Link>
        </div>

        {/* IA Insights */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-primary p-8 text-on-primary">
          <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 bg-secondary opacity-20 blur-[80px]" />
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container">auto_awesome</span>
              <h3 className="text-xl font-bold">Análisis de Talento UCR</h3>
            </div>
            <p className="text-on-primary-container">
              «{nombre}, según tu trayectoria en {carrera}, priorizamos plantillas con secciones de{' '}
              <strong>Habilidades</strong> prominentes y diseño <strong>ATS-friendly</strong>. Esto puede aumentar
              tus probabilidades de ser contactada por empresas tecnológicas.»
            </p>
          </div>
        </div>

        {/* Ayuda / Chat / Web */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/ayuda" className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-colors hover:bg-surface-container">
            <span className="material-symbols-outlined rounded-full bg-secondary/10 p-2 text-secondary">support_agent</span>
            <div>
              <p className="font-body-semibold text-primary">Centro de Ayuda</p>
              <p className="text-xs text-on-surface-variant">Asistencia y soporte</p>
            </div>
          </Link>
          <button type="button" onClick={abrirChat} className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 text-left transition-colors hover:bg-surface-container">
            <span className="material-symbols-outlined rounded-full bg-secondary/10 p-2 text-secondary">smart_toy</span>
            <div>
              <p className="font-body-semibold text-primary">Chat inteligente</p>
              <p className="text-xs text-on-surface-variant">Consejos y recomendaciones IA</p>
            </div>
          </button>
          <button type="button" onClick={buscarWeb} className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 text-left transition-colors hover:bg-surface-container">
            <span className="material-symbols-outlined rounded-full bg-secondary/10 p-2 text-secondary">travel_explore</span>
            <div>
              <p className="font-body-semibold text-primary">Buscar en la web</p>
              <p className="text-xs text-on-surface-variant">Más plantillas e ideas</p>
            </div>
          </button>
        </div>
      </div>
    </StudentShell>
  );
}

function Paso({ n, label, activo }: { n: string; label: string; activo?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${activo ? 'bg-primary text-on-primary' : 'border border-outline-variant bg-surface-container-high text-outline'}`}>
        {n}
      </div>
      <span className={activo ? 'font-body-semibold text-primary' : 'text-outline'}>{label}</span>
    </div>
  );
}
