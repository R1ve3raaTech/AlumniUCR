'use client';

// Editor de CV paso a paso (adaptado del Stitch). 3 columnas: secciones +
// progreso, formulario de la sección activa (conectado a la fuente única), y
// vista previa en vivo con guardado automático. Pantalla completa (sin sidebar)
// para dar espacio al editor.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AlumniLogo from '@/components/AlumniLogo';
import AvatarUploader from '@/components/student/AvatarUploader';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante, type Experiencia } from '@/context/PerfilEstudianteContext';
import { useAuth } from '@/context/AuthContext';

const SECCIONES = [
  { key: 'datos', label: 'Datos personales' },
  { key: 'contacto', label: 'Información de contacto' },
  { key: 'experiencia', label: 'Experiencia laboral' },
  { key: 'habilidades', label: 'Habilidades' },
  { key: 'educacion', label: 'Educación' },
  { key: 'resumen', label: 'Resumen profesional' },
];

const input = 'w-full rounded-xl border border-outline-variant bg-surface-container-low p-3.5 text-sm focus:border-transparent focus:ring-2 focus:ring-secondary';
const label = 'mb-1.5 block text-sm font-body-semibold text-primary';
const lista = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export default function EditorCurriculumPage() {
  const router = useRouter();
  const { perfil, actualizar } = usePerfilEstudiante();
  const { user } = useAuth();
  const [activa, setActiva] = useState('datos');
  const [guardando, setGuardando] = useState(false);
  const [editorFoto, setEditorFoto] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const centroRef = useRef<HTMLDivElement>(null);

  const idx = SECCIONES.findIndex((s) => s.key === activa);
  const irA = (delta: number) => {
    const sig = SECCIONES[idx + delta];
    if (sig) setActiva(sig.key);
  };
  const finalizar = () => {
    notificar('✅ ¡CV completo! Lo guardamos automáticamente.');
    router.push('/mi-curriculum');
  };

  // Al cambiar de sección, vuelve al inicio del formulario.
  useEffect(() => {
    centroRef.current?.scrollTo({ top: 0 });
  }, [activa]);

  // Guarda en la fuente única y muestra el indicador de "guardado automático".
  const set = (parcial: Parameters<typeof actualizar>[0]) => {
    actualizar(parcial);
    setGuardando(true);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setGuardando(false), 900);
  };

  const correo = user?.email || '';
  const tecnicas = lista(perfil.habilidadesTecnicas);

  // % de CV completado (campos clave del CV).
  const progreso = useMemo(() => {
    const checks = [
      perfil.nombre, perfil.apellidos, perfil.cargoDeseado, perfil.telefono,
      perfil.carrera, perfil.habilidadesTecnicas, perfil.resumen,
      perfil.experiencias.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [perfil]);

  // ── Experiencias ──
  const addExp = () => set({ experiencias: [...perfil.experiencias, { puesto: '', empresa: '', periodo: '', descripcion: '' }] });
  const updExp = (i: number, campo: keyof Experiencia, valor: string) =>
    set({ experiencias: perfil.experiencias.map((e, j) => (j === i ? { ...e, [campo]: valor } : e)) });
  const delExp = (i: number) => set({ experiencias: perfil.experiencias.filter((_, j) => j !== i) });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-body-base text-on-background">
      {/* Barra superior */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-6">
        <div className="flex items-center gap-4">
          <Link href="/mi-curriculum/plantillas" className="flex items-center gap-1 text-sm font-bold text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined text-base">arrow_back</span> Plantillas
          </Link>
          <span className="h-6 w-px bg-outline-variant" />
          <AlumniLogo height={28} />
        </div>
        <span className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
          <span className={`h-1.5 w-1.5 rounded-full ${guardando ? 'bg-amber-500' : 'animate-pulse bg-emerald-500'}`} />
          {guardando ? 'Guardando…' : 'Guardado automático'}
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Izquierda: secciones + progreso */}
        <aside className="flex w-72 shrink-0 flex-col gap-6 overflow-y-auto border-r border-outline-variant bg-surface-container-lowest p-6">
          <div>
            <h2 className="mb-3 text-sm font-label-caps font-bold uppercase tracking-wider text-on-surface-variant">Secciones del CV</h2>
            <div className="space-y-1">
              {SECCIONES.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiva(s.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors ${
                    activa === s.key ? 'bg-primary font-body-semibold text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded text-xs ${activa === s.key ? 'bg-white/20' : 'bg-surface-container-high'}`}>{i + 1}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-auto rounded-xl bg-primary-fixed-dim/20 p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-primary">
              <span>CV Completado</span><span>{progreso}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-container-highest">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progreso}%` }} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-primary/70">
              {progreso < 100 ? 'Completá las secciones para aumentar tu match con los reclutadores.' : '¡CV completo! Listo para descargar.'}
            </p>
          </div>
        </aside>

        {/* Centro: formulario */}
        <div ref={centroRef} className="flex-1 overflow-y-auto bg-background p-10">
          <div className="mx-auto max-w-2xl">
            <header className="mb-8">
              <h2 className="font-headline-md text-2xl text-primary">{SECCIONES.find((s) => s.key === activa)?.label}</h2>
              <p className="mt-1 text-on-surface-variant">Lo que cargaste en tu perfil ya está aquí. Editá lo que quieras; se guarda solo.</p>
            </header>

            {activa === 'datos' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div><label className={label}>Nombre</label><input className={input} value={perfil.nombre} onChange={(e) => set({ nombre: e.target.value })} /></div>
                  <div><label className={label}>Apellidos</label><input className={input} value={perfil.apellidos} onChange={(e) => set({ apellidos: e.target.value })} /></div>
                </div>
                <div><label className={label}>Cargo deseado</label><input className={input} value={perfil.cargoDeseado} onChange={(e) => set({ cargoDeseado: e.target.value })} placeholder="Ej: Desarrolladora Full Stack" /></div>
                <div>
                  <label className={label}>Foto de perfil</label>
                  <div className="flex items-center gap-6">
                    {perfil.foto ? (
                      <img src={perfil.foto} alt="" className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md" />
                    ) : (
                      <div className="grid h-24 w-24 place-items-center rounded-2xl bg-surface-container text-on-surface-variant"><span className="material-symbols-outlined text-3xl">add_a_photo</span></div>
                    )}
                    <button type="button" onClick={() => setEditorFoto(true)} className="rounded-lg border border-secondary/20 bg-secondary/10 px-6 py-2 text-sm font-body-semibold text-secondary hover:bg-secondary/20">
                      Cambiar foto
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activa === 'contacto' && (
              <div className="space-y-6">
                <div><label className={label}>Correo</label><input className={`${input} opacity-70`} value={correo} readOnly /></div>
                <div><label className={label}>Teléfono</label><input className={input} value={perfil.telefono} onChange={(e) => set({ telefono: e.target.value })} placeholder="+506 8888-0000" /></div>
                <div><label className={label}>Ubicación</label><input className={input} value={perfil.ubicacion} onChange={(e) => set({ ubicacion: e.target.value })} placeholder="San José, Costa Rica" /></div>
                <div><label className={label}>LinkedIn</label><input className={input} value={perfil.linkedin} onChange={(e) => set({ linkedin: e.target.value })} placeholder="linkedin.com/in/…" /></div>
              </div>
            )}

            {activa === 'experiencia' && (
              <div className="space-y-4">
                {perfil.experiencias.length === 0 && <p className="text-sm text-on-surface-variant">Aún no agregaste experiencia. Sumá tu primer registro.</p>}
                {perfil.experiencias.map((exp, i) => (
                  <div key={i} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-on-surface-variant">Experiencia {i + 1}</span>
                      <button type="button" onClick={() => delExp(i)} className="text-error hover:opacity-70"><span className="material-symbols-outlined text-base">delete</span></button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input className={input} value={exp.puesto} onChange={(e) => updExp(i, 'puesto', e.target.value)} placeholder="Puesto" />
                      <input className={input} value={exp.empresa} onChange={(e) => updExp(i, 'empresa', e.target.value)} placeholder="Empresa" />
                    </div>
                    <input className={input} value={exp.periodo} onChange={(e) => updExp(i, 'periodo', e.target.value)} placeholder="Período (ej: 2023 - Presente)" />
                    <textarea className={`${input} min-h-[70px]`} value={exp.descripcion} onChange={(e) => updExp(i, 'descripcion', e.target.value)} placeholder="Logros y responsabilidades…" />
                  </div>
                ))}
                <button type="button" onClick={addExp} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-outline py-3 text-sm font-body-semibold text-primary hover:bg-primary/5">
                  <span className="material-symbols-outlined text-base">add</span> Agregar experiencia
                </button>
              </div>
            )}

            {activa === 'habilidades' && (
              <div className="space-y-6">
                <div><label className={label}>Técnicas (separadas por coma)</label><input className={input} value={perfil.habilidadesTecnicas} onChange={(e) => set({ habilidadesTecnicas: e.target.value })} placeholder="React, Python, SQL…" /></div>
                <div><label className={label}>Blandas</label><input className={input} value={perfil.habilidadesBlandas} onChange={(e) => set({ habilidadesBlandas: e.target.value })} placeholder="Liderazgo, comunicación…" /></div>
                <div><label className={label}>Idiomas</label><input className={input} value={perfil.idiomas} onChange={(e) => set({ idiomas: e.target.value })} placeholder="Español (nativo), Inglés (B2)" /></div>
              </div>
            )}

            {activa === 'educacion' && (
              <div className="space-y-6">
                <div><label className={label}>Carrera</label><input className={input} value={perfil.carrera} onChange={(e) => set({ carrera: e.target.value })} /></div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div><label className={label}>Nivel</label><input className={input} value={perfil.nivel} onChange={(e) => set({ nivel: e.target.value })} placeholder="Bachillerato" /></div>
                  <div><label className={label}>Año de ingreso</label><input className={input} value={perfil.anioIngreso} onChange={(e) => set({ anioIngreso: e.target.value })} /></div>
                </div>
                <div><label className={label}>Sede</label><input className={input} value={perfil.sede} onChange={(e) => set({ sede: e.target.value })} /></div>
              </div>
            )}

            {activa === 'resumen' && (
              <div className="space-y-2">
                <label className={label}>Resumen profesional</label>
                <textarea className={`${input} min-h-[160px]`} value={perfil.resumen} onChange={(e) => set({ resumen: e.target.value })} placeholder="Un párrafo que resuma tu perfil, fortalezas y objetivos." />
              </div>
            )}

            {/* Navegación entre secciones */}
            <div className="mt-10 flex items-center justify-between border-t border-outline-variant pt-6">
              <button
                type="button"
                onClick={() => irA(-1)}
                disabled={idx === 0}
                className="flex items-center gap-2 font-body-semibold text-primary transition-transform hover:-translate-x-1 disabled:opacity-40 disabled:hover:translate-x-0"
              >
                <span className="material-symbols-outlined">arrow_back</span> Anterior
              </button>
              {idx < SECCIONES.length - 1 ? (
                <button
                  type="button"
                  onClick={() => irA(1)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-10 py-4 font-body-semibold text-on-primary shadow-md transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  Siguiente <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finalizar}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-10 py-4 font-body-semibold text-on-primary shadow-md transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  <span className="material-symbols-outlined">check_circle</span> Finalizar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Derecha: vista previa en vivo */}
        <aside className="hidden w-[420px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-outline-variant bg-surface-container-high p-6 xl:flex">
          <h3 className="text-sm font-label-caps font-bold uppercase tracking-wider text-on-surface-variant">Vista previa</h3>
          <div className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-xl">
            <div className="flex items-center gap-3 bg-primary p-5">
              {perfil.foto ? (
                <img src={perfil.foto} alt="" className="h-14 w-14 rounded-full border-2 border-white object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-white bg-white/15 text-sm font-bold text-white">
                  {`${perfil.nombre[0] || ''}${perfil.apellidos[0] || ''}`.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="truncate font-bold leading-none text-white">{`${perfil.nombre} ${perfil.apellidos}`.trim() || 'Tu nombre'}</h4>
                <p className="mt-1 truncate text-xs text-primary-fixed">{perfil.cargoDeseado || 'Cargo deseado'}</p>
              </div>
            </div>
            <div className="space-y-4 p-5 text-xs text-on-surface">
              <Bloque titulo="Contacto">
                {[perfil.ubicacion, correo, perfil.telefono].filter(Boolean).map((x) => <p key={x} className="text-on-surface-variant">{x}</p>)}
              </Bloque>
              {perfil.resumen && <Bloque titulo="Perfil"><p className="leading-relaxed text-on-surface-variant">{perfil.resumen}</p></Bloque>}
              {tecnicas.length > 0 && (
                <Bloque titulo="Habilidades">
                  <div className="flex flex-wrap gap-1">{tecnicas.map((s) => <span key={s} className="rounded bg-secondary-fixed px-1.5 py-0.5 text-[10px] text-primary">{s}</span>)}</div>
                </Bloque>
              )}
              {perfil.experiencias.length > 0 && (
                <Bloque titulo="Experiencia">
                  <div className="space-y-2">
                    {perfil.experiencias.map((e, i) => (
                      <div key={i}>
                        <p className="font-bold">{e.puesto || 'Puesto'} <span className="font-normal text-on-surface-variant">· {e.empresa}</span></p>
                        <p className="text-[10px] text-on-surface-variant">{e.periodo}</p>
                      </div>
                    ))}
                  </div>
                </Bloque>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/mi-curriculum/plantillas" className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm font-body-semibold text-primary hover:bg-primary/5">
              <span className="material-symbols-outlined text-lg">palette</span> Plantilla
            </Link>
            <button type="button" onClick={() => window.print()} className="col-span-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-body-semibold text-on-primary hover:bg-secondary">
              <span className="material-symbols-outlined text-lg">download</span> Descargar
            </button>
          </div>
        </aside>
      </div>

      <AvatarUploader abierto={editorFoto} fotoActual={perfil.foto} onGuardar={(foto) => set({ foto })} onCerrar={() => setEditorFoto(false)} />
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="mb-1.5 border-b border-outline-variant pb-1 text-[10px] font-bold uppercase tracking-widest text-primary">{titulo}</h5>
      {children}
    </div>
  );
}
