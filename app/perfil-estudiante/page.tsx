'use client';

// Mi Perfil (estudiante) — rediseño Stitch (estático). Contenido de ejemplo;
// se conectarán datos reales en una etapa posterior. Layout fiel al diseño.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante, type PerfilEstudiante, type ArchivoPortafolio } from '@/context/PerfilEstudianteContext';
import { FACULTADES_UCR } from '@/lib/catalogoUCR';
import { useAuth } from '@/context/AuthContext';
import { obtenerMisAplicaciones } from '@/lib/aplicaciones';

const FOTO_MAX_BYTES = 3 * 1024 * 1024;

const SEDES = ['Rodrigo Facio (Central)', 'Sede del Pacífico', 'Sede de Occidente', 'Sede del Atlántico', 'Sede de Guanacaste', 'Recinto de Golfito', 'Recinto de Tacares'];
const NIVELES_ACADEMICOS = ['Bachillerato', 'Licenciatura', 'Maestría', 'Doctorado'];
const BECAS = ['Sin beca', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5'];
// RF-03 Sección 3: catálogo cerrado (no "TCU"/"Proyecto de Curso", que no son parte del requerimiento).
const TIPOS_PROYECTO = ['TFG', 'Tesis', 'Práctica Dirigida', 'Seminario'];
// Catálogo de 14 áreas (mismo que /estudiantes, para que Área temática y Áreas de
// interés del proyecto usen exactamente la misma lista).
const AREAS_INTERES = [
  'Tecnología e Innovación',
  'Salud y Bienestar',
  'Educación y Pedagogía',
  'Medio Ambiente y Sostenibilidad',
  'Arte y Cultura',
  'Ciencias Sociales',
  'Agro y Alimentación',
  'Emprendimiento y Negocios',
  'Ingeniería y Construcción',
  'Derecho y Política Pública',
  'Economía y Finanzas',
  'Comunicación y Medios',
  'Turismo y Patrimonio',
  'Investigación Científica',
];
const NECESIDADES_PROYECTO: { clave: 'financiamiento' | 'mentoriaTecnica' | 'accesoDatos' | 'infraestructura' | 'validacionEmpresarial' | 'empleoParalelo'; label: string }[] = [
  { clave: 'financiamiento', label: 'Financiamiento' },
  { clave: 'mentoriaTecnica', label: 'Mentoría técnica' },
  { clave: 'accesoDatos', label: 'Acceso a datos' },
  { clave: 'infraestructura', label: 'Infraestructura' },
  { clave: 'validacionEmpresarial', label: 'Validación empresarial' },
  { clave: 'empleoParalelo', label: 'Empleo paralelo' },
];

// Aviso temporal: todos los botones de esta pantalla aún no tienen acción real.
// Se captura el clic en el contenedor y se muestra un toast consistente. Cuando
// se cablee una acción real, ese botón lleva data-real para excluirse de aquí.
function avisoProximamente(e: React.MouseEvent) {
  const el = (e.target as HTMLElement).closest('button, a[href="#"]');
  if (el && !el.hasAttribute('data-real')) {
    e.preventDefault();
    notificar('🚧 Función en desarrollo');
  }
}

const SHADOW = 'shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';
const CARD = `rounded-xl border border-outline-variant bg-surface-container-lowest p-8 ${SHADOW}`;

function CampoLectura({ label, valor, resaltar }: { label: string; valor: string; resaltar?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-caps text-xs uppercase tracking-wider text-on-surface-variant">{label}</label>
      <div
        className={`rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 font-body-semibold ${
          resaltar ? 'text-primary' : ''
        }`}
      >
        {valor}
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 font-body-semibold text-on-surface focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30';

function ModalEditarAcademico({
  abierto,
  inicial,
  onGuardar,
  onCerrar,
}: {
  abierto: boolean;
  inicial: { carne: string; carrera: string; facultad: string; sede: string; anioIngreso: string; nivel: string; promedioPonderado: string };
  onGuardar: (datos: { carne: string; carrera: string; facultad: string; sede: string; anioIngreso: string; nivel: string; promedioPonderado: string }) => void;
  onCerrar: () => void;
}) {
  const [f, setF] = useState(inicial);

  React.useEffect(() => {
    if (abierto) setF(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  if (!abierto) return null;
  const set = (campo: keyof typeof f, valor: string) => setF((p) => ({ ...p, [campo]: valor }));

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-headline-md text-lg text-primary">Editar información académica</h3>
          <button type="button" data-real onClick={onCerrar} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Carné</span>
            <input data-real className={inputCls} value={f.carne} onChange={(e) => set('carne', e.target.value)} placeholder="C17482" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Carrera</span>
            <input data-real className={inputCls} value={f.carrera} onChange={(e) => set('carrera', e.target.value)} placeholder="Ingeniería de Software" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Escuela / Facultad</span>
            <select data-real className={inputCls} value={f.facultad} onChange={(e) => set('facultad', e.target.value)}>
              <option value="">Seleccionar…</option>
              {FACULTADES_UCR.map((fac: string) => <option key={fac}>{fac}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Sede</span>
            <select data-real className={inputCls} value={f.sede} onChange={(e) => set('sede', e.target.value)}>
              {SEDES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Año de ingreso</span>
            <input data-real className={inputCls} value={f.anioIngreso} onChange={(e) => set('anioIngreso', e.target.value)} placeholder="2019" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nivel académico</span>
            <select data-real className={inputCls} value={f.nivel} onChange={(e) => set('nivel', e.target.value)}>
              <option value="">Seleccionar…</option>
              {NIVELES_ACADEMICOS.map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Promedio ponderado (opcional, privado)</span>
            <input data-real type="number" min={0} max={10} step={0.01} className={inputCls} value={f.promedioPonderado} onChange={(e) => set('promedioPonderado', e.target.value)} placeholder="8.75" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" data-real onClick={onCerrar} className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant">Cancelar</button>
          <button
            type="button"
            data-real
            onClick={() => { onGuardar(f); onCerrar(); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary"
          >
            <span className="material-symbols-outlined text-base">check</span> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEditarTFG({
  abierto,
  inicial,
  onGuardar,
  onCerrar,
}: {
  abierto: boolean;
  inicial: {
    proyectoTitulo: string;
    proyectoDescripcion: string;
    proyectoAvance: number;
    areaTematica: string;
    proyectoAreas: string[];
    proyectoTipo: string;
    necesidadesProyecto: PerfilEstudiante['necesidadesProyecto'];
  };
  onGuardar: (datos: {
    proyectoTitulo: string;
    proyectoDescripcion: string;
    proyectoAvance: number;
    areaTematica: string;
    proyectoAreas: string[];
    proyectoTipo: string;
    necesidadesProyecto: PerfilEstudiante['necesidadesProyecto'];
  }) => void;
  onCerrar: () => void;
}) {
  const [f, setF] = useState(inicial);

  React.useEffect(() => {
    if (abierto) setF(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  if (!abierto) return null;
  const set = <K extends keyof typeof f>(campo: K, valor: typeof f[K]) => setF((p) => ({ ...p, [campo]: valor }));
  const toggleArea = (a: string) =>
    setF((p) => ({ ...p, proyectoAreas: p.proyectoAreas.includes(a) ? p.proyectoAreas.filter((x) => x !== a) : [...p.proyectoAreas, a] }));
  const toggleNecesidad = (clave: keyof PerfilEstudiante['necesidadesProyecto']) =>
    setF((p) => ({ ...p, necesidadesProyecto: { ...p.necesidadesProyecto, [clave]: !p.necesidadesProyecto[clave] } }));

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-headline-md text-lg text-primary">Editar proyecto de graduación</h3>
          <button type="button" data-real onClick={onCerrar} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Título</span>
            <input data-real className={inputCls} value={f.proyectoTitulo} onChange={(e) => set('proyectoTitulo', e.target.value)} placeholder="Título del proyecto" maxLength={200} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Descripción</span>
            <textarea data-real className={inputCls} rows={3} value={f.proyectoDescripcion} onChange={(e) => set('proyectoDescripcion', e.target.value)} maxLength={1000} />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tipo de proyecto</span>
              <select data-real className={inputCls} value={f.proyectoTipo} onChange={(e) => set('proyectoTipo', e.target.value)}>
                {TIPOS_PROYECTO.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Área temática</span>
              <select data-real className={inputCls} value={f.areaTematica} onChange={(e) => set('areaTematica', e.target.value)}>
                <option value="">Seleccionar…</option>
                {AREAS_INTERES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Progreso de desarrollo ({f.proyectoAvance}%)</span>
            <input data-real type="range" min={0} max={100} step={5} value={f.proyectoAvance} onChange={(e) => set('proyectoAvance', Number(e.target.value))} className="accent-secondary" />
          </label>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Áreas de interés del proyecto (mín. 1)</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {AREAS_INTERES.map((a) => {
                const sel = f.proyectoAreas.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    data-real
                    onClick={() => toggleArea(a)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      sel ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Necesidades específicas</span>
            <div className="mt-2 flex flex-col gap-2">
              {NECESIDADES_PROYECTO.map((n) => (
                <label key={n.clave} data-real className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low p-2 transition-colors hover:border-secondary">
                  <input data-real type="checkbox" checked={f.necesidadesProyecto[n.clave]} onChange={() => toggleNecesidad(n.clave)} className="rounded border-outline-variant accent-secondary" />
                  <span className="font-body-semibold text-sm">{n.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" data-real onClick={onCerrar} className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant">Cancelar</button>
          <button
            type="button"
            data-real
            disabled={f.proyectoAreas.length === 0}
            onClick={() => { onGuardar(f); onCerrar(); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-base">check</span> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEditarBeca({
  abierto,
  inicial,
  onGuardar,
  onCerrar,
}: {
  abierto: boolean;
  inicial: string;
  onGuardar: (beca: string) => void;
  onCerrar: () => void;
}) {
  const [beca, setBeca] = useState(inicial);

  React.useEffect(() => {
    if (abierto) setBeca(inicial);
  }, [abierto, inicial]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-headline-md text-lg text-primary">Editar tipo de beca</h3>
          <button type="button" data-real onClick={onCerrar} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tipo de beca asignada</span>
          <select data-real className={inputCls} value={beca} onChange={(e) => setBeca(e.target.value)}>
            {BECAS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" data-real onClick={onCerrar} className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant">Cancelar</button>
          <button
            type="button"
            data-real
            onClick={() => { onGuardar(beca); onCerrar(); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary"
          >
            <span className="material-symbols-outlined text-base">check</span> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEditarApoyo({
  abierto,
  inicial,
  onGuardar,
  onCerrar,
}: {
  abierto: boolean;
  inicial: { mentoria: boolean; empleo: boolean; pasantia: boolean; financiamiento: boolean };
  onGuardar: (apoyo: { mentoria: boolean; empleo: boolean; pasantia: boolean; financiamiento: boolean }) => void;
  onCerrar: () => void;
}) {
  const [f, setF] = useState(inicial);

  React.useEffect(() => {
    if (abierto) setF(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  if (!abierto) return null;
  const OPCIONES: { key: keyof typeof f; label: string }[] = [
    { key: 'mentoria', label: 'Mentoría' },
    { key: 'empleo', label: 'Ofertas de Empleo' },
    { key: 'pasantia', label: 'Pasantía Académica' },
    { key: 'financiamiento', label: 'Financiamiento' },
  ];

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-headline-md text-lg text-primary">Editar apoyo requerido</h3>
          <button type="button" data-real onClick={onCerrar} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {OPCIONES.map((op) => (
            <label key={op.key} data-real className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 transition-colors hover:border-secondary">
              <input
                data-real
                type="checkbox"
                checked={f[op.key]}
                onChange={(e) => setF((p) => ({ ...p, [op.key]: e.target.checked }))}
                className="rounded border-outline-variant accent-secondary"
              />
              <span className="font-body-semibold text-sm">{op.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" data-real onClick={onCerrar} className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant">Cancelar</button>
          <button
            type="button"
            data-real
            onClick={() => { onGuardar(f); onCerrar(); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary"
          >
            <span className="material-symbols-outlined text-base">check</span> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

const ICONOS_REGISTRO = ['auto_stories', 'corporate_fare', 'school', 'work', 'military_tech', 'science'];
const REGISTRO_VACIO = { icono: ICONOS_REGISTRO[0], titulo: '', subtitulo: '' };

function ModalEditarRegistro({
  abierto,
  inicial,
  onGuardar,
  onCerrar,
}: {
  abierto: boolean;
  inicial: { icono: string; titulo: string; subtitulo: string };
  onGuardar: (datos: { icono: string; titulo: string; subtitulo: string }) => void;
  onCerrar: () => void;
}) {
  const [f, setF] = useState(inicial);

  React.useEffect(() => {
    if (abierto) setF(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  if (!abierto) return null;
  const set = (campo: keyof typeof f, valor: string) => setF((p) => ({ ...p, [campo]: valor }));

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-headline-md text-lg text-primary">Registro académico</h3>
          <button type="button" data-real onClick={onCerrar} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Icono</span>
            <select data-real className={inputCls} value={f.icono} onChange={(e) => set('icono', e.target.value)}>
              {ICONOS_REGISTRO.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Título</span>
            <input data-real className={inputCls} value={f.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Cursos de Carrera Aprobados" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Detalle</span>
            <input data-real className={inputCls} value={f.subtitulo} onChange={(e) => set('subtitulo', e.target.value)} placeholder="32 créditos completados • Promedio: 9.5" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" data-real onClick={onCerrar} className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant">Cancelar</button>
          <button
            type="button"
            data-real
            disabled={!f.titulo.trim()}
            onClick={() => { onGuardar(f); onCerrar(); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-base">check</span> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalMapaCarrera({ abierto, hitos, onCerrar }: { abierto: boolean; hitos: { texto: string; hecho: boolean }[]; onCerrar: () => void }) {
  if (!abierto) return null;
  const completados = hitos.filter((h) => h.hecho).length;
  const porcentaje = Math.round((completados / hitos.length) * 100);
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-headline-md text-lg text-primary">Mapa de Carrera</h3>
          <button type="button" data-real onClick={onCerrar} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="mb-4 text-sm text-on-surface-variant">Avance calculado a partir de tu perfil ({porcentaje}% completo).</p>
        <ul className="flex flex-col gap-3">
          {hitos.map((h) => (
            <li key={h.texto} className="flex items-center gap-3 rounded-lg border border-outline-variant/30 bg-surface-container-low p-3">
              <span className={`material-symbols-outlined ${h.hecho ? 'text-tertiary' : 'text-outline'}`}>
                {h.hecho ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={`text-sm ${h.hecho ? 'font-body-semibold text-on-surface' : 'text-on-surface-variant'}`}>{h.texto}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <button type="button" data-real onClick={onCerrar} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function ModalPortafolio({
  abierto,
  categoria,
  archivos,
  onSubir,
  onEliminar,
  onCerrar,
}: {
  abierto: boolean;
  categoria: 'educativa' | 'galeria' | null;
  archivos: ArchivoPortafolio[];
  onSubir: (archivo: ArchivoPortafolio) => void;
  onEliminar: (id: string) => void;
  onCerrar: () => void;
}) {
  const [error, setError] = useState('');
  if (!abierto || !categoria) return null;
  const titulo = categoria === 'educativa' ? 'Info Educativa' : 'Galería TFG';
  const propios = archivos.filter((a) => a.categoria === categoria);

  const onArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > FOTO_MAX_BYTES) {
      setError('El archivo no puede superar los 3 MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => onSubir({ id: `${Date.now()}`, categoria, nombre: file.name, dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline-md text-lg text-primary">{titulo}</h3>
          <button type="button" data-real onClick={onCerrar} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <label className="mb-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-on-secondary">
          <span className="material-symbols-outlined text-base">upload</span> Subir archivo
          <input data-real type="file" accept="image/*,.pdf" className="hidden" onChange={onArchivo} />
        </label>
        {error && <p className="mb-3 text-xs text-error">{error}</p>}
        {propios.length === 0 ? (
          <p className="text-sm italic text-on-surface-variant">Sin archivos aún.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {propios.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant/30 p-2">
                <a data-real href={a.dataUrl} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 text-sm text-on-surface hover:text-primary">
                  <span className="material-symbols-outlined text-base text-on-surface-variant">description</span>
                  <span className="truncate">{a.nombre}</span>
                </a>
                <button data-real type="button" onClick={() => onEliminar(a.id)} className="p-1 text-outline-variant hover:text-error">
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ModalActividad({ abierto, items, onCerrar }: { abierto: boolean; items: { id: string; texto: string; fecha: string }[]; onCerrar: () => void }) {
  if (!abierto) return null;
  const fmt = (iso: string) => new Date(iso).toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline-md text-lg text-primary">Mi actividad</h3>
          <button type="button" data-real onClick={onCerrar} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-sm italic text-on-surface-variant">Todavía no hay actividad registrada.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((a) => (
              <li key={a.id} className="flex items-start gap-3 border-b border-outline-variant/30 pb-3 last:border-0">
                <span className="material-symbols-outlined mt-0.5 text-base text-secondary">history</span>
                <div>
                  <p className="text-sm text-on-surface">{a.texto}</p>
                  <p className="text-xs text-on-surface-variant">{fmt(a.fecha)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface Aplicacion {
  id: number | string;
  estado: string;
  created_at: string;
  puestos_empleo: { id: number | string; titulo_puesto: string; empresa: string | null } | null;
}

export default function PerfilEstudiantePage() {
  const { token } = useAuth();
  const { perfil, actualizar } = usePerfilEstudiante();
  const [editandoAcademico, setEditandoAcademico] = useState(false);
  const [editandoTFG, setEditandoTFG] = useState(false);
  const [editandoBeca, setEditandoBeca] = useState(false);
  const [editandoApoyo, setEditandoApoyo] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<{ id: string | null } | null>(null);
  const [preguntarFinalizado, setPreguntarFinalizado] = useState(false);
  const [nuevoInteres, setNuevoInteres] = useState('');
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [verMapaCarrera, setVerMapaCarrera] = useState(false);
  const [categoriaPortafolio, setCategoriaPortafolio] = useState<'educativa' | 'galeria' | null>(null);
  const [verActividad, setVerActividad] = useState(false);
  const o = (v: string, d = '—') => (v && v.trim() ? v : d);

  // Solo se usa para el hito "Aplicar a tu primera posición" del Mapa de Carrera;
  // el detalle de postulaciones vive en /mis-aplicaciones.
  useEffect(() => {
    if (!token) return;
    let activo = true;
    obtenerMisAplicaciones(token).then((apps) => { if (activo) setAplicaciones(apps ?? []); });
    return () => { activo = false; };
  }, [token]);

  const registrarActividad = (texto: string) => {
    const item = { id: `${Date.now()}`, texto, fecha: new Date().toISOString() };
    actualizar({ actividad: [item, ...perfil.actividad].slice(0, 30) });
  };

  const agregarInteres = () => {
    const v = nuevoInteres.trim();
    if (v && !perfil.intereses.includes(v)) {
      actualizar({ intereses: [...perfil.intereses, v] });
      registrarActividad(`Agregaste el interés "${v}".`);
    }
    setNuevoInteres('');
  };
  const quitarInteres = (i: string) => actualizar({ intereses: perfil.intereses.filter((x) => x !== i) });

  const guardarRegistro = (id: string | null, datos: { icono: string; titulo: string; subtitulo: string }) => {
    if (id) {
      actualizar({ historialAcademico: perfil.historialAcademico.map((r) => (r.id === id ? { ...r, ...datos } : r)) });
      registrarActividad(`Actualizaste el registro "${datos.titulo}".`);
    } else {
      actualizar({ historialAcademico: [...perfil.historialAcademico, { id: `${Date.now()}`, ...datos }] });
      registrarActividad(`Agregaste el registro "${datos.titulo}" a tu historial académico.`);
    }
  };
  const eliminarRegistro = (id: string) => actualizar({ historialAcademico: perfil.historialAcademico.filter((r) => r.id !== id) });

  const subirArchivoPortafolio = (archivo: ArchivoPortafolio) => {
    actualizar({ portafolio: [...perfil.portafolio, archivo] });
    registrarActividad(`Subiste "${archivo.nombre}" a tu portafolio.`);
  };
  const eliminarArchivoPortafolio = (id: string) => actualizar({ portafolio: perfil.portafolio.filter((a) => a.id !== id) });

  const hitosCarrera = [
    { texto: 'Completar información académica', hecho: Boolean(perfil.carne && perfil.carrera && perfil.facultad && perfil.nivel) },
    { texto: 'Registrar proyecto de graduación', hecho: Boolean(perfil.proyectoTitulo.trim()) },
    { texto: 'Avance del proyecto al 100%', hecho: perfil.proyectoAvance >= 100 },
    { texto: 'Agregar al menos un registro académico o de experiencia', hecho: perfil.historialAcademico.length > 0 },
    { texto: 'Definir tus áreas de interés', hecho: perfil.intereses.length > 0 },
    { texto: 'Aplicar a tu primera posición', hecho: aplicaciones.length > 0 },
  ];
  const porcentajeCarrera = Math.round((hitosCarrera.filter((h) => h.hecho).length / hitosCarrera.length) * 100);

  return (
    <StudentShell active="perfil">
      <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-6 p-8" onClick={avisoProximamente}>
        {/* Aviso: si no completó el onboarding, invitarlo (humaniza la conexión inicial) */}
        {!perfil.completado && (
          <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4">
            <p className="text-sm text-on-surface">
              <strong>Completá tu perfil una vez</strong> y se reflejará automáticamente en todas tus pantallas.
            </p>
            <Link href="/onboarding" data-real className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-on-secondary">
              Completar ahora
            </Link>
          </div>
        )}

        {/* Pausar perfil: no recibir contactos temporalmente (RF-03, criterio de aceptación) */}
        <div className={`col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${perfil.pausado ? 'border-error/30 bg-error/5' : 'border-outline-variant bg-surface-container-lowest'}`}>
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined ${perfil.pausado ? 'text-error' : 'text-tertiary'}`}>{perfil.pausado ? 'pause_circle' : 'check_circle'}</span>
            <div>
              <p className="font-body-semibold text-on-surface">
                {perfil.pausado ? 'Tu perfil está pausado.' : 'Tu perfil está activo.'}{' '}
                <span className="font-body-base text-on-surface-variant">
                  {perfil.pausado ? 'No estás recibiendo solicitudes de contacto de exalumnos.' : 'Podés pausarlo temporalmente si no querés recibir contactos.'}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            data-real
            onClick={() => { actualizar({ pausado: !perfil.pausado }); registrarActividad(perfil.pausado ? 'Reactivaste tu perfil.' : 'Pausaste tu perfil.'); }}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-variant"
          >
            {perfil.pausado ? 'Reactivar perfil' : 'Pausar perfil'}
          </button>
        </div>
        {/* ── Columna central (gestión central) ── */}
        <section className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          {/* Información Académica */}
          <div className={CARD}>
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-headline-md text-2xl text-primary">
                <span className="material-symbols-outlined">school</span>
                Información Académica
              </h3>
              <button data-real onClick={() => setEditandoAcademico(true)} className="flex items-center gap-1 text-secondary hover:underline">
                <span className="material-symbols-outlined text-lg">edit</span>
                <span className="font-body-semibold text-sm">Editar</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CampoLectura label="Carné" valor={o(perfil.carne)} />
              <CampoLectura label="Carrera" valor={o(perfil.carrera)} resaltar />
              <CampoLectura label="Escuela / Facultad" valor={o(perfil.facultad)} />
              <CampoLectura label="Sede" valor={o(perfil.sede)} />
              <CampoLectura label="Año de Ingreso" valor={o(perfil.anioIngreso)} />
              <CampoLectura label="Nivel Académico" valor={o(perfil.nivel)} />
              <CampoLectura label="Promedio Ponderado" valor={o(perfil.promedioPonderado, 'No registrado')} />
            </div>
          </div>

          <ModalEditarAcademico
            abierto={editandoAcademico}
            inicial={{
              carne: perfil.carne,
              carrera: perfil.carrera,
              facultad: perfil.facultad,
              sede: perfil.sede || SEDES[0],
              anioIngreso: perfil.anioIngreso,
              nivel: perfil.nivel,
              promedioPonderado: perfil.promedioPonderado,
            }}
            onGuardar={(datos) => { actualizar(datos); registrarActividad('Actualizaste tu información académica.'); }}
            onCerrar={() => setEditandoAcademico(false)}
          />

          {/* Proyecto de Graduación (TFG) */}
          <div className={`relative overflow-hidden rounded-xl bg-primary p-8 text-on-primary ${SHADOW}`}>
            <div className="absolute right-0 top-0 p-6 opacity-10">
              <span className="material-symbols-outlined text-9xl">terminal</span>
            </div>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="font-headline-md text-xl">Proyecto de Graduación (TFG)</h3>
                <div className="flex items-center gap-3">
                  {perfil.proyectoFinalizado ? (
                    <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold">FINALIZADO</span>
                  ) : (
                    <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold">{perfil.proyectoTipo || 'TFG'}</span>
                  )}
                  <button data-real onClick={() => setEditandoTFG(true)} className="rounded-lg bg-white/10 p-1.5 text-on-primary transition-colors hover:bg-white/20">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
              </div>
              <p className="mb-1 font-body-semibold text-lg leading-tight">
                {o(perfil.proyectoTitulo, 'Aún no registraste tu proyecto de graduación')}
              </p>
              {perfil.areaTematica && (
                <p className="mb-4 text-xs text-on-primary/70">Área temática: {perfil.areaTematica}</p>
              )}
              <div className="mb-6">
                <div className="mb-1 flex justify-between text-xs">
                  <span>Progreso de Desarrollo</span>
                  <span className="font-bold">{perfil.proyectoAvance}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-primary-container">
                  <div
                    className="h-full rounded-full bg-orange-400"
                    style={{ width: `${perfil.proyectoAvance}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {(perfil.proyectoAreas.length ? perfil.proyectoAreas : ['Sin áreas aún']).map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <ModalEditarTFG
            abierto={editandoTFG}
            inicial={{
              proyectoTitulo: perfil.proyectoTitulo,
              proyectoDescripcion: perfil.proyectoDescripcion,
              proyectoAvance: perfil.proyectoAvance,
              areaTematica: perfil.areaTematica,
              proyectoAreas: perfil.proyectoAreas,
              proyectoTipo: perfil.proyectoTipo,
              necesidadesProyecto: perfil.necesidadesProyecto,
            }}
            onGuardar={(datos) => {
              const llegaA100 = datos.proyectoAvance === 100 && perfil.proyectoAvance !== 100;
              actualizar({ ...datos, proyectoFinalizado: llegaA100 ? false : perfil.proyectoFinalizado });
              registrarActividad('Actualizaste tu proyecto de graduación.');
              if (llegaA100) setPreguntarFinalizado(true);
            }}
            onCerrar={() => setEditandoTFG(false)}
          />

          {/* Si el avance llega a 100%, se pregunta si se marca como finalizado (RF-03) */}
          {preguntarFinalizado && (
            <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
              <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 text-center shadow-2xl">
                <span className="material-symbols-outlined text-4xl text-secondary">celebration</span>
                <h3 className="mt-2 font-headline-md text-lg text-primary">¡Tu proyecto llegó al 100%!</h3>
                <p className="mt-1 text-sm text-on-surface-variant">¿Deseas marcarlo como finalizado?</p>
                <div className="mt-6 flex justify-center gap-2">
                  <button type="button" data-real onClick={() => setPreguntarFinalizado(false)} className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant">Todavía no</button>
                  <button
                    type="button"
                    data-real
                    onClick={() => { actualizar({ proyectoFinalizado: true }); registrarActividad('Marcaste tu proyecto de graduación como finalizado.'); setPreguntarFinalizado(false); }}
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary"
                  >
                    <span className="material-symbols-outlined text-base">check</span> Marcar finalizado
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empleabilidad + Trayectoria */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className={`${CARD} flex flex-col gap-4 !p-6`}>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                  <span className="material-symbols-outlined">work_history</span>
                </div>
                <h3 className="font-headline-md text-lg text-primary">Portal Empleabilidad</h3>
              </div>
              <p className="text-sm text-on-surface-variant">
                Accede a vacantes exclusivas para estudiantes y egresados UCR.
              </p>
              <Link href="/posiciones" data-real className="mt-auto rounded-lg bg-ucr-celeste py-2 text-center font-bold text-sm text-white transition-opacity hover:opacity-90">
                Ir a la Bolsa de Empleo
              </Link>
            </div>
            <div className={`${CARD} flex flex-col gap-4 !p-6`}>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-ucr-celeste/10 p-2 text-ucr-celeste">
                  <span className="material-symbols-outlined">query_stats</span>
                </div>
                <h3 className="font-headline-md text-lg text-primary">Gestión de Trayectoria</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full bg-ucr-celeste" style={{ width: `${porcentajeCarrera}%` }} />
                </div>
                <span className="text-xs font-bold text-ucr-celeste">{porcentajeCarrera}% COMPLETO</span>
              </div>
              <button data-real onClick={() => setVerMapaCarrera(true)} className="mt-auto rounded-lg border border-primary py-2 text-center font-bold text-sm text-primary transition-colors hover:bg-surface-variant">
                Ver Mapa de Carrera
              </button>
            </div>
          </div>

          <ModalMapaCarrera abierto={verMapaCarrera} hitos={hitosCarrera} onCerrar={() => setVerMapaCarrera(false)} />

          {/* Historial Académico y Experiencia */}
          <div className={CARD}>
            <div className="mb-8 flex items-center justify-between">
              <h3 className="font-headline-md text-xl text-primary">Historial Académico y Experiencia</h3>
              <button data-real onClick={() => setRegistroEditando({ id: null })} className="flex items-center gap-1.5 rounded-full border border-orange-300 px-3 py-1.5 text-sm font-bold text-orange-500 transition-colors hover:bg-orange-50">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>Añadir Registro</span>
              </button>
            </div>
            <div className="space-y-4">
              {perfil.historialAcademico.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-outline-variant py-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline">history_edu</span>
                  <p className="text-sm italic text-on-surface-variant">Sin registros aún.</p>
                </div>
              )}
              {perfil.historialAcademico.map((r) => (
                <div key={r.id} className="group flex items-center justify-between rounded-xl border border-outline-variant/30 p-4 transition-colors hover:bg-surface-container-low">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                      <span className="material-symbols-outlined">{r.icono}</span>
                    </div>
                    <div>
                      <p className="font-body-semibold text-sm">{r.titulo}</p>
                      <p className="text-xs text-on-surface-variant">{r.subtitulo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                    <button data-real onClick={() => setRegistroEditando({ id: r.id })} className="p-2 text-outline-variant hover:text-secondary"><span className="material-symbols-outlined">edit</span></button>
                    <button data-real onClick={() => eliminarRegistro(r.id)} className="p-2 text-outline-variant hover:text-error"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ModalEditarRegistro
            abierto={registroEditando !== null}
            inicial={
              registroEditando?.id
                ? (() => {
                    const r = perfil.historialAcademico.find((x) => x.id === registroEditando.id);
                    return r ? { icono: r.icono, titulo: r.titulo, subtitulo: r.subtitulo } : REGISTRO_VACIO;
                  })()
                : REGISTRO_VACIO
            }
            onGuardar={(datos) => guardarRegistro(registroEditando?.id ?? null, datos)}
            onCerrar={() => setRegistroEditando(null)}
          />

        </section>

        {/* ── Columna derecha (apoyo y comunidad) ── */}
        <section className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          {/* Tipo de Beca */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Tipo de Beca</h3>
              <button data-real onClick={() => setEditandoBeca(true)} className="text-on-surface-variant transition-colors hover:text-secondary"><span className="material-symbols-outlined text-lg">edit</span></button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Asignada</span>
                <span className="text-xl font-bold text-primary">{o(perfil.beca, 'Sin beca')}</span>
              </div>
              <div className="rounded-full bg-orange-100 p-2 text-orange-500">
                <span className="material-symbols-outlined">star</span>
              </div>
            </div>
          </div>

          <ModalEditarBeca abierto={editandoBeca} inicial={perfil.beca} onGuardar={(beca) => { actualizar({ beca }); registrarActividad('Actualizaste tu tipo de beca.'); }} onCerrar={() => setEditandoBeca(false)} />

          {/* Apoyo Requerido */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Apoyo Requerido</h3>
              <button data-real onClick={() => setEditandoApoyo(true)} className="text-on-surface-variant transition-colors hover:text-secondary"><span className="material-symbols-outlined text-lg">edit</span></button>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Mentoría', checked: perfil.apoyo.mentoria },
                { label: 'Ofertas de Empleo', checked: perfil.apoyo.empleo },
                { label: 'Pasantía Académica', checked: perfil.apoyo.pasantia },
                { label: 'Financiamiento', checked: perfil.apoyo.financiamiento },
              ].map((a) => (
                <label
                  key={a.label}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                    a.checked ? 'border-orange-300 bg-orange-50' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-secondary'
                  }`}
                >
                  <input type="checkbox" checked={a.checked} readOnly className="rounded border-outline-variant accent-orange-400" />
                  <span className="font-body-semibold text-sm">{a.label}</span>
                </label>
              ))}
            </div>
          </div>

          <ModalEditarApoyo abierto={editandoApoyo} inicial={perfil.apoyo} onGuardar={(apoyo) => { actualizar({ apoyo }); registrarActividad('Actualizaste tu apoyo requerido.'); }} onCerrar={() => setEditandoApoyo(false)} />

          {/* Intereses */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Intereses</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {perfil.intereses.length === 0 && (
                <span className="text-xs italic text-on-surface-variant">Sin intereses aún.</span>
              )}
              {perfil.intereses.map((i) => (
                <span key={i} className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 font-body-semibold text-xs text-primary">
                  {i}
                  <button data-real type="button" onClick={() => quitarInteres(i)} aria-label={`Quitar ${i}`} className="text-primary/60 hover:text-error">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}
              <input
                data-real
                value={nuevoInteres}
                onChange={(e) => setNuevoInteres(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarInteres(); } }}
                placeholder="Nuevo interés…"
                className="w-32 rounded-full border border-dashed border-outline-variant bg-transparent px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
              />
              <button data-real type="button" onClick={agregarInteres} className="rounded-full border border-dashed border-outline-variant p-1.5 text-on-surface-variant transition-all hover:border-primary hover:text-primary">
                <span className="material-symbols-outlined text-xs">add</span>
              </button>
            </div>
          </div>

          {/* Portafolio */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Portafolio</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button data-real onClick={() => setCategoriaPortafolio('educativa')} className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent bg-surface-container p-2 transition-all hover:border-secondary">
                <span className="material-symbols-outlined text-3xl text-secondary">folder</span>
                <span className="text-center text-xs font-bold uppercase">Info Educativa</span>
                <span className="text-[11px] text-on-surface-variant">{perfil.portafolio.filter((a) => a.categoria === 'educativa').length} archivo(s)</span>
              </button>
              <button data-real onClick={() => setCategoriaPortafolio('galeria')} className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent bg-surface-container p-2 transition-all hover:border-secondary">
                <span className="material-symbols-outlined text-3xl text-primary">collections</span>
                <span className="text-center text-xs font-bold uppercase">Galería TFG</span>
                <span className="text-[11px] text-on-surface-variant">{perfil.portafolio.filter((a) => a.categoria === 'galeria').length} archivo(s)</span>
              </button>
            </div>
          </div>

          <ModalPortafolio
            abierto={categoriaPortafolio !== null}
            categoria={categoriaPortafolio}
            archivos={perfil.portafolio}
            onSubir={subirArchivoPortafolio}
            onEliminar={eliminarArchivoPortafolio}
            onCerrar={() => setCategoriaPortafolio(null)}
          />

          {/* Mi actividad */}
          <div className="flex-grow rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                <span className="material-symbols-outlined">history</span>
              </div>
              <h3 className="font-headline-md text-lg text-primary">Mi actividad</h3>
            </div>
            <p className="mb-4 text-sm text-on-surface-variant">
              {perfil.actividad.length > 0 ? perfil.actividad[0].texto : 'Todavía no hay actividad registrada.'}
            </p>
            <button data-real onClick={() => setVerActividad(true)} className="w-full rounded-lg border border-outline py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-variant">Ver toda mi actividad</button>
          </div>

          <ModalActividad abierto={verActividad} items={perfil.actividad} onCerrar={() => setVerActividad(false)} />

          {/* Seguridad */}
          <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-error/10 p-2 text-error">
                <span className="material-symbols-outlined">security</span>
              </div>
              <h3 className="font-headline-md text-lg text-primary">Seguridad</h3>
            </div>
            <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-primary">Estado de Cuenta</span>
                <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-bold text-green-500">SEGURO</span>
              </div>
              <p className="text-xs text-on-surface-variant">Tu cuenta está en buen estado. 0 reportes acumulados.</p>
            </div>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
