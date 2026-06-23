'use client';

// Directorio de Talento (estudiante): gestión de la ficha pública + vista previa
// en vivo. Adaptado del Stitch a la marca y conectado a funciones reales:
//  • Fuente única (perfil) con autosave a Supabase (perfil_onboarding).
//  • AvatarUploader real para la foto (recorte circular).
//  • Compartir ficha vía portapapeles.

import React, { useState } from 'react';
import StudentShell from '@/components/student/StudentShell';
import AvatarUploader from '@/components/student/AvatarUploader';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
import { tituloCaso, limpiarTexto } from '@/lib/texto';

const SEDES = ['Rodrigo Facio (Central)', 'Sede del Pacífico', 'Sede de Occidente', 'Sede del Atlántico', 'Sede de Guanacaste', 'Recinto de Golfito', 'Recinto de Tacares'];
const TIPOS = ['TFG (Trabajo Final de Graduación)', 'TCU (Trabajo Comunal)', 'Proyecto de Curso'];
const APOYOS: { key: 'mentoria' | 'pasantia' | 'empleo' | 'financiamiento'; label: string }[] = [
  { key: 'mentoria', label: 'Mentoría' },
  { key: 'pasantia', label: 'Pasantías' },
  { key: 'empleo', label: 'Empleo' },
  { key: 'financiamiento', label: 'Patrocinio' },
];

const input = 'w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30';
const lab = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant';
const chip = 'rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary';
const card = 'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';

const aChips = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export default function DirectorioTalento() {
  const { perfil, actualizar } = usePerfilEstudiante();
  const [editorFoto, setEditorFoto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const nombre = `${perfil.nombre} ${perfil.apellidos}`.trim() || 'Tu nombre';
  const areas = perfil.proyectoAreas;
  const apoyosActivos = APOYOS.filter((a) => perfil.apoyo[a.key]);

  // El perfil ya hace autosave en cada cambio; este botón confirma el respaldo.
  const guardar = () => {
    setGuardando(true);
    actualizar({}); // fuerza el respaldo a Supabase con el estado actual
    setTimeout(() => {
      setGuardando(false);
      notificar('✅ Ficha guardada y respaldada');
    }, 700);
  };

  const compartir = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notificar('🔗 Enlace de tu ficha copiado al portapapeles');
    } catch {
      notificar('No se pudo copiar el enlace');
    }
  };

  return (
    <StudentShell active="directorio">
      <div className="mx-auto max-w-[1280px] p-6 lg:p-8">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-headline-md text-2xl text-on-surface sm:text-3xl">Directorio de Talento</h2>
            <p className="mt-1 max-w-2xl text-on-surface-variant">
              Gestioná la visibilidad de tu proyecto de graduación y conectá con mentores y empresas de la red UCR.
            </p>
          </div>
          <button onClick={compartir} className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container">
            <span className="material-symbols-outlined text-[18px]">share</span> Compartir ficha
          </button>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          {/* IZQUIERDA: ficha editable */}
          <div className="flex flex-col gap-6 xl:col-span-7">
            <div className={`${card} p-6 sm:p-8`}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-headline-md text-xl text-primary">
                  <span className="material-symbols-outlined text-secondary">edit_document</span> Gestión de Ficha Pública
                </h3>
                <button
                  type="button"
                  onClick={guardar}
                  disabled={guardando}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-bold text-on-primary shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {guardando && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                  {guardando ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={lab}>Carrera</label>
                  <input className={input} value={perfil.carrera} onChange={(e) => actualizar({ carrera: e.target.value })} onBlur={(e) => actualizar({ carrera: tituloCaso(e.target.value) })} />
                </div>
                <div>
                  <label className={lab}>Sede / Centro</label>
                  <select className={input} value={perfil.sede || SEDES[0]} onChange={(e) => actualizar({ sede: e.target.value })}>
                    {SEDES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={lab}>Título del Proyecto (TFG/TCU)</label>
                  <input className={input} value={perfil.proyectoTitulo} onChange={(e) => actualizar({ proyectoTitulo: e.target.value })} onBlur={(e) => actualizar({ proyectoTitulo: limpiarTexto(e.target.value) })} placeholder="Título de tu proyecto de graduación" />
                </div>
                <div className="md:col-span-2">
                  <label className={lab}>Bio / Descripción corta</label>
                  <textarea className={`${input} min-h-[90px]`} value={perfil.resumen} onChange={(e) => actualizar({ resumen: e.target.value })} onBlur={(e) => actualizar({ resumen: limpiarTexto(e.target.value) })} placeholder="Breve descripción de tu perfil profesional…" />
                </div>
                <div>
                  <label className={lab}>Tipo de Proyecto</label>
                  <select className={input} value={perfil.proyectoTipo} onChange={(e) => actualizar({ proyectoTipo: e.target.value })}>
                    {TIPOS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lab}>Área Temática</label>
                  <input className={input} value={areas.join(', ')} onChange={(e) => actualizar({ proyectoAreas: aChips(e.target.value) })} placeholder="Ej: Cloud Computing, DevOps" />
                </div>
                <div className="md:col-span-2">
                  <label className={lab}>Apoyo Requerido</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {APOYOS.map((a) => (
                      <label key={a.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-surface-container-low px-3 py-2 transition-colors ${perfil.apoyo[a.key] ? 'border-secondary' : 'border-transparent hover:bg-secondary-container/20'}`}>
                        <input type="checkbox" className="accent-secondary" checked={perfil.apoyo[a.key]} onChange={(e) => actualizar({ apoyo: { ...perfil.apoyo, [a.key]: e.target.checked } })} />
                        <span className="text-sm font-semibold">{a.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de proyectos (desde la experiencia del perfil) */}
            <div className={`${card} p-6 sm:p-8`}>
              <h3 className="mb-5 flex items-center gap-2 font-headline-md text-xl text-primary">
                <span className="material-symbols-outlined text-secondary">history</span> Historial de Proyectos
              </h3>
              {perfil.experiencias.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Aún no agregaste proyectos previos (los podés sumar desde tu CV).</p>
              ) : (
                <div className="space-y-3">
                  {perfil.experiencias.map((e, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border-l-4 border-outline-variant bg-surface-container-low p-4">
                      <div>
                        <h4 className="font-body-semibold text-on-surface">{e.puesto || 'Proyecto'}</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{e.empresa}{e.periodo ? ` • ${e.periodo}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DERECHA: vista previa pública */}
          <div className="xl:col-span-5 xl:sticky xl:top-24">
            <div className={`overflow-hidden rounded-2xl ${card}`}>
              <div className="relative h-32 overflow-hidden">
                <img src="/images/campus.png" alt="Portada UCR" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: 'center 30%' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute -bottom-12 left-8 rounded-full bg-white p-1">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
                    {perfil.foto ? (
                      <img src={perfil.foto} alt={nombre} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-primary/10 font-display-lg text-2xl font-bold text-primary">
                        {`${perfil.nombre[0] || ''}${perfil.apellidos[0] || ''}`.toUpperCase() || 'E'}
                      </div>
                    )}
                  </div>
                  {/* Botón real para cambiar la foto (AvatarUploader) */}
                  <button type="button" onClick={() => setEditorFoto(true)} title="Cambiar foto" className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-secondary p-1.5 text-on-secondary transition-transform hover:scale-110">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </button>
                </div>
                <span className="absolute bottom-4 right-6 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">Estudiante Activa</span>
              </div>

              <div className="px-8 pb-8 pt-16">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-headline-md text-xl text-primary">{nombre}</h2>
                    <p className="font-body-semibold text-secondary">{perfil.carrera || 'Carrera'}{perfil.sede ? ` • ${perfil.sede}` : ''}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-secondary/10 px-2 py-1 text-secondary">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span className="text-xs font-bold uppercase">Verificado</span>
                  </span>
                </div>

                {perfil.resumen && <p className="mb-5 text-sm italic leading-snug text-on-surface-variant">{perfil.resumen}</p>}

                <div className="mb-5 rounded-xl bg-surface-container-low p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-outline">Proyecto Actual ({perfil.proyectoTipo.split(' ')[0]})</span>
                    <span className="text-xs font-bold text-secondary">{perfil.proyectoAvance}%</span>
                  </div>
                  <h3 className="mb-3 font-body-semibold leading-snug text-on-surface">{perfil.proyectoTitulo || 'Tu proyecto de graduación'}</h3>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-outline-variant/30">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${perfil.proyectoAvance}%` }} />
                  </div>
                </div>

                <div className="mb-6 space-y-4">
                  {areas.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Áreas Temáticas</span>
                      <div className="flex flex-wrap gap-1.5">{areas.map((a) => <span key={a} className={chip}>{a}</span>)}</div>
                    </div>
                  )}
                  {perfil.intereses.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Intereses</span>
                      <div className="flex flex-wrap gap-1.5">{perfil.intereses.map((a) => <span key={a} className={chip}>{a}</span>)}</div>
                    </div>
                  )}
                  {apoyosActivos.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Apoyo Requerido</span>
                      <div className="flex flex-wrap gap-1.5">{apoyosActivos.map((a) => <span key={a.key} className="rounded-full bg-tertiary/10 px-2.5 py-1 text-[11px] font-semibold text-tertiary">{a.label}</span>)}</div>
                    </div>
                  )}
                </div>

                <button type="button" onClick={() => notificar('🤝 Esta acción es para mentores y empresas validadas')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-lg font-headline-md font-bold text-on-secondary shadow-lg transition-all hover:bg-primary">
                  <span className="material-symbols-outlined">handshake</span> Ofrecer Apoyo
                </button>
                <p className="mt-3 text-center text-xs italic text-outline">Visible solo para mentores y empresas validadas.</p>
              </div>
            </div>

            {/* Privacidad */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-tertiary-fixed bg-tertiary/5 p-5">
              <span className="material-symbols-outlined text-tertiary">security</span>
              <div>
                <h4 className="text-sm font-body-semibold text-tertiary">Privacidad por diseño</h4>
                <p className="text-xs text-on-surface-variant">Tu información sensible (promedio, nivel de beca, datos socioeconómicos) nunca es pública. El directorio solo muestra tu talento y proyectos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AvatarUploader
        abierto={editorFoto}
        fotoActual={perfil.foto}
        onGuardar={(foto) => actualizar({ foto })}
        onCerrar={() => setEditorFoto(false)}
      />
    </StudentShell>
  );
}
