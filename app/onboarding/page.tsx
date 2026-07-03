'use client';

// Onboarding único del estudiante. Se llena una vez; guarda en la fuente única
// (PerfilEstudianteContext) y de ahí lo leen todas sus pantallas. Wizard de 3
// pasos, humanizado.

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
import AvatarUploader from '@/components/student/AvatarUploader';

const SEDES = ['Rodrigo Facio (Central)', 'Sede del Pacífico', 'Sede de Occidente', 'Sede del Atlántico', 'Sede de Guanacaste', 'Recinto de Golfito', 'Recinto de Tacares'];
const NIVELES = ['Bachillerato', 'Licenciatura', 'Maestría'];
const AREAS = ['tecnología', 'salud', 'educación', 'ambiente', 'arte y cultura', 'ciencias sociales', 'agro', 'emprendimiento', 'ingeniería', 'derecho', 'economía', 'comunicación', 'turismo', 'investigación'];

const inputCls =
  'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/30';
const labelCls = 'mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant';

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { perfil, actualizar } = usePerfilEstudiante();
  const [paso, setPaso] = useState(1);

  const [f, setF] = useState({
    nombre: perfil.nombre, apellidos: perfil.apellidos, telefono: perfil.telefono, linkedin: perfil.linkedin,
    carne: perfil.carne, carrera: perfil.carrera, sede: perfil.sede || SEDES[0], anioIngreso: perfil.anioIngreso, nivel: perfil.nivel || NIVELES[0],
    beca: perfil.beca || 'Tipo 5',
    proyectoTitulo: perfil.proyectoTitulo, proyectoDescripcion: perfil.proyectoDescripcion, proyectoAvance: perfil.proyectoAvance,
    proyectoAreasStr: perfil.proyectoAreas.join(', '),
    proyectoAdjunto: perfil.proyectoAdjunto, proyectoAdjuntoTipo: perfil.proyectoAdjuntoTipo, proyectoAdjuntoNombre: perfil.proyectoAdjuntoNombre,
    apoyo: { ...perfil.apoyo },
    interesesSel: [...perfil.intereses],
    habilidadesTecnicas: perfil.habilidadesTecnicas, habilidadesBlandas: perfil.habilidadesBlandas, idiomas: perfil.idiomas,
  });

  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  const toggleInteres = (a: string) =>
    setF((p) => ({ ...p, interesesSel: p.interesesSel.includes(a) ? p.interesesSel.filter((x) => x !== a) : [...p.interesesSel, a] }));

  // ── Adjunto del proyecto (foto recortable / PDF / link) ──
  const [editorAdjunto, setEditorAdjunto] = useState(false);
  const [adjError, setAdjError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const ADJ_MAX = 5 * 1024 * 1024; // 5MB

  const onPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdjError(null);
    if (file.type !== 'application/pdf') { setAdjError('El documento debe ser PDF.'); return; }
    if (file.size > ADJ_MAX) { setAdjError('El archivo supera los 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setF((p) => ({ ...p, proyectoAdjunto: String(reader.result), proyectoAdjuntoTipo: 'pdf', proyectoAdjuntoNombre: file.name }));
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const setLink = (v: string) =>
    setF((p) => ({ ...p, proyectoAdjunto: v, proyectoAdjuntoTipo: v ? 'link' : '', proyectoAdjuntoNombre: v ? 'Enlace del proyecto' : '' }));
  const quitarAdjunto = () => { setAdjError(null); setF((p) => ({ ...p, proyectoAdjunto: '', proyectoAdjuntoTipo: '', proyectoAdjuntoNombre: '' })); };

  const finalizar = () => {
    actualizar({
      nombre: f.nombre.trim(), apellidos: f.apellidos.trim(), telefono: f.telefono.trim(), linkedin: f.linkedin.trim(),
      carne: f.carne.trim(), carrera: f.carrera.trim(), sede: f.sede, anioIngreso: f.anioIngreso.trim(), nivel: f.nivel,
      beca: f.beca,
      proyectoTitulo: f.proyectoTitulo.trim(), proyectoDescripcion: f.proyectoDescripcion.trim(), proyectoAvance: Number(f.proyectoAvance) || 0,
      proyectoAreas: f.proyectoAreasStr.split(',').map((s) => s.trim()).filter(Boolean),
      proyectoAdjunto: f.proyectoAdjunto, proyectoAdjuntoTipo: f.proyectoAdjuntoTipo, proyectoAdjuntoNombre: f.proyectoAdjuntoNombre,
      apoyo: f.apoyo,
      intereses: f.interesesSel,
      habilidadesTecnicas: f.habilidadesTecnicas.trim(), habilidadesBlandas: f.habilidadesBlandas.trim(), idiomas: f.idiomas.trim(),
      completado: true,
    });
    router.push('/dashboard');
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4 font-body-base text-on-background">
      <div className="w-full max-w-2xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]">
        {/* Encabezado */}
        <div className="mb-6 text-center">
          <span className="material-symbols-outlined mb-2 text-4xl text-secondary">waving_hand</span>
          <h1 className="font-headline-md text-2xl text-primary">¡Bienvenida/o a Alumni UCR!</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Completá tu perfil una sola vez. Esto se reflejará automáticamente en tu dashboard, CV, matches y más.
          </p>
        </div>

        {/* Progreso */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= paso ? 'bg-secondary' : 'bg-surface-container-high'}`} />
          ))}
        </div>
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Paso {paso} de 3</p>

        {/* Paso 1: Identidad + Académica */}
        {paso === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Nombre"><input className={inputCls} value={f.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Adriana" /></Campo>
            <Campo label="Apellidos"><input className={inputCls} value={f.apellidos} onChange={(e) => set('apellidos', e.target.value)} placeholder="Solano" /></Campo>
            <Campo label="Teléfono"><input className={inputCls} value={f.telefono} onChange={(e) => set('telefono', e.target.value)} placeholder="+506 8888-0000" /></Campo>
            <Campo label="LinkedIn"><input className={inputCls} value={f.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/..." /></Campo>
            <Campo label="Carné"><input className={inputCls} value={f.carne} onChange={(e) => set('carne', e.target.value)} placeholder="C17482" /></Campo>
            <Campo label="Carrera"><input className={inputCls} value={f.carrera} onChange={(e) => set('carrera', e.target.value)} placeholder="Ingeniería de Software" /></Campo>
            <Campo label="Sede">
              <select className={inputCls} value={f.sede} onChange={(e) => set('sede', e.target.value)}>
                {SEDES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Campo>
            <Campo label="Año de ingreso"><input className={inputCls} value={f.anioIngreso} onChange={(e) => set('anioIngreso', e.target.value)} placeholder="2019" /></Campo>
            <Campo label="Nivel académico">
              <select className={inputCls} value={f.nivel} onChange={(e) => set('nivel', e.target.value)}>
                {NIVELES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Campo>
          </div>
        )}

        {/* Paso 2: Situación + Proyecto */}
        {paso === 2 && (
          <div className="grid grid-cols-1 gap-4">
            <Campo label="Tipo de beca socioeconómica">
              <select className={inputCls} value={f.beca} onChange={(e) => set('beca', e.target.value)}>
                <option>Tipo 4</option>
                <option>Tipo 5</option>
              </select>
            </Campo>
            <Campo label="Título del proyecto de graduación (TFG)">
              <input className={inputCls} value={f.proyectoTitulo} onChange={(e) => set('proyectoTitulo', e.target.value)} placeholder="Sistema de Gestión de Talento basado en IA" />
            </Campo>
            <Campo label="Descripción del proyecto">
              <textarea className={`${inputCls} min-h-[80px]`} value={f.proyectoDescripcion} onChange={(e) => set('proyectoDescripcion', e.target.value)} placeholder="Resumen breve de tu TFG..." />
            </Campo>
            <Campo label={`Avance del proyecto: ${f.proyectoAvance}%`}>
              <input type="range" min={0} max={100} value={f.proyectoAvance} onChange={(e) => set('proyectoAvance', Number(e.target.value))} className="w-full accent-secondary" />
            </Campo>
            <Campo label="Áreas del proyecto (separadas por coma)">
              <input className={inputCls} value={f.proyectoAreasStr} onChange={(e) => set('proyectoAreasStr', e.target.value)} placeholder="Data Science, Web Dev, IA/ML" />
            </Campo>

            {/* Adjunto del proyecto: foto (recortable), PDF o link */}
            <Campo label="Adjunto del proyecto (foto, PDF o link)">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setEditorAdjunto(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-primary transition-colors hover:border-secondary">
                  <span className="material-symbols-outlined text-base">add_a_photo</span> Foto
                </button>
                <button type="button" onClick={() => pdfInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-primary transition-colors hover:border-secondary">
                  <span className="material-symbols-outlined text-base">picture_as_pdf</span> PDF
                </button>
                <input ref={pdfInputRef} type="file" accept="application/pdf" hidden onChange={onPdf} />
              </div>
              <input
                className={`${inputCls} mt-2`}
                placeholder="O pegá un enlace (https://...)"
                value={f.proyectoAdjuntoTipo === 'link' ? f.proyectoAdjunto : ''}
                onChange={(e) => setLink(e.target.value)}
              />
              {adjError && <p className="mt-1 text-xs font-semibold text-error">{adjError}</p>}

              {f.proyectoAdjunto && (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  {f.proyectoAdjuntoTipo === 'imagen' ? (
                    <img src={f.proyectoAdjunto} alt="Adjunto" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-secondary/10 text-secondary">
                      <span className="material-symbols-outlined">{f.proyectoAdjuntoTipo === 'pdf' ? 'picture_as_pdf' : 'link'}</span>
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-on-surface">{f.proyectoAdjuntoNombre || 'Adjunto'}</p>
                    <p className="text-xs text-on-surface-variant">
                      {f.proyectoAdjuntoTipo === 'imagen' ? 'Foto' : f.proyectoAdjuntoTipo === 'pdf' ? 'Documento PDF' : 'Enlace'}
                    </p>
                  </div>
                  <button type="button" onClick={quitarAdjunto} aria-label="Quitar adjunto" className="shrink-0 text-on-surface-variant transition-colors hover:text-error">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              )}
            </Campo>
          </div>
        )}

        {/* Paso 3: Apoyo + Intereses + Habilidades */}
        {paso === 3 && (
          <div className="grid grid-cols-1 gap-4">
            <Campo label="Apoyo requerido">
              <div className="flex flex-wrap gap-2">
                {([['mentoria', 'Mentoría'], ['empleo', 'Empleo'], ['pasantia', 'Pasantía'], ['financiamiento', 'Financiamiento']] as const).map(([k, lbl]) => (
                  <label key={k} className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm">
                    <input type="checkbox" className="accent-secondary" checked={f.apoyo[k]} onChange={(e) => set('apoyo', { ...f.apoyo, [k]: e.target.checked })} />
                    {lbl}
                  </label>
                ))}
              </div>
            </Campo>
            <Campo label="Áreas de interés">
              <div className="flex flex-wrap gap-2">
                {AREAS.map((a) => {
                  const sel = f.interesesSel.includes(a);
                  return (
                    <button key={a} type="button" onClick={() => toggleInteres(a)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${sel ? 'bg-primary text-on-primary' : 'border border-outline-variant bg-surface-container-low text-on-surface-variant'}`}>
                      {a}
                    </button>
                  );
                })}
              </div>
            </Campo>
            <Campo label="Habilidades técnicas"><input className={inputCls} value={f.habilidadesTecnicas} onChange={(e) => set('habilidadesTecnicas', e.target.value)} placeholder="Java, Python, React..." /></Campo>
            <Campo label="Habilidades blandas"><input className={inputCls} value={f.habilidadesBlandas} onChange={(e) => set('habilidadesBlandas', e.target.value)} placeholder="Liderazgo, comunicación..." /></Campo>
            <Campo label="Idiomas"><input className={inputCls} value={f.idiomas} onChange={(e) => set('idiomas', e.target.value)} placeholder="Español (nativo), Inglés (B2)" /></Campo>
          </div>
        )}

        {/* Navegación */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPaso((p) => Math.max(1, p - 1))}
            disabled={paso === 1}
            className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant disabled:opacity-40"
          >
            Atrás
          </button>
          {paso < 3 ? (
            <button type="button" onClick={() => setPaso((p) => p + 1)} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary">
              Siguiente
            </button>
          ) : (
            <button type="button" onClick={finalizar} className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-bold text-on-secondary">
              <span className="material-symbols-outlined text-base">check_circle</span> Finalizar
            </button>
          )}
        </div>
      </div>

      {/* Recorte/ajuste de la foto del proyecto (reutiliza el editor de avatar) */}
      <AvatarUploader
        abierto={editorAdjunto}
        fotoActual={f.proyectoAdjuntoTipo === 'imagen' ? f.proyectoAdjunto : ''}
        onGuardar={(foto) => setF((p) => ({ ...p, proyectoAdjunto: foto, proyectoAdjuntoTipo: 'imagen', proyectoAdjuntoNombre: 'Foto del proyecto' }))}
        onCerrar={() => setEditorAdjunto(false)}
      />
    </main>
  );
}
