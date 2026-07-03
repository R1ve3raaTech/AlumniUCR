'use client';

// Mi Perfil (estudiante) — versión desplegable (acordeón). Cada sección muestra
// poca información por defecto y se expande al tocarla. Datos reales desde la
// fuente única (PerfilEstudianteContext) y edición real por sección (RF-03):
// información académica, proyecto TFG, beca, apoyo, intereses, historial y
// portafolio. Las postulaciones vienen del backend (obtenerMisAplicaciones).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import Desplegable from '@/components/student/Desplegable';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante, type PerfilEstudiante, type ArchivoPortafolio } from '@/context/PerfilEstudianteContext';
import { FACULTADES_UCR } from '@/lib/catalogoUCR';
import { useAuth } from '@/context/AuthContext';
import { obtenerMisAplicaciones } from '@/lib/aplicaciones';

const FOTO_MAX_BYTES = 3 * 1024 * 1024;

const SEDES = ['Rodrigo Facio (Central)', 'Sede del Pacífico', 'Sede de Occidente', 'Sede del Atlántico', 'Sede de Guanacaste', 'Recinto de Golfito', 'Recinto de Tacares'];
const NIVELES_ACADEMICOS = ['Bachillerato', 'Licenciatura', 'Maestría', 'Doctorado'];
const BECAS = ['Sin beca', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5'];
// RF-03 Sección 3: catálogo cerrado.
const TIPOS_PROYECTO = ['TFG', 'Tesis', 'Práctica Dirigida', 'Seminario'];
// Catálogo de 14 áreas (mismo que /estudiantes).
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
const NECESIDADES_PROYECTO: { clave: keyof PerfilEstudiante['necesidadesProyecto']; label: string }[] = [
  { clave: 'financiamiento', label: 'Financiamiento' },
  { clave: 'mentoriaTecnica', label: 'Mentoría técnica' },
  { clave: 'accesoDatos', label: 'Acceso a datos' },
  { clave: 'infraestructura', label: 'Infraestructura' },
  { clave: 'validacionEmpresarial', label: 'Validación empresarial' },
  { clave: 'empleoParalelo', label: 'Empleo paralelo' },
];
const ICONOS_REGISTRO = ['auto_stories', 'corporate_fare', 'school', 'work', 'military_tech', 'science'];
const REGISTRO_VACIO = { icono: ICONOS_REGISTRO[0], titulo: '', subtitulo: '' };

const ESTADO_APLICACION: Record<string, { label: string; cls: string }> = {
  enviada: { label: 'Enviada', cls: 'bg-secondary/10 text-secondary' },
  en_revision: { label: 'En Revisión', cls: 'bg-amber-500/10 text-amber-600' },
  seleccionado: { label: 'Seleccionado', cls: 'bg-tertiary/10 text-tertiary' },
  descartado: { label: 'Finalizada', cls: 'bg-surface-container-highest text-on-surface-variant' },
};

// Aviso temporal: botones aún sin acción real (los reales llevan data-real).
function avisoProximamente(e: React.MouseEvent) {
  const el = (e.target as HTMLElement).closest('button, a[href="#"]');
  if (el && !el.hasAttribute('data-real')) {
    e.preventDefault();
    notificar('🚧 Función en desarrollo');
  }
}

function CampoLectura({ label, valor, resaltar }: { label: string; valor: string; resaltar?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-caps text-xs uppercase tracking-wider text-on-surface-variant">{label}</label>
      <div className={`rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 font-body-semibold ${resaltar ? 'text-primary' : ''}`}>
        {valor}
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 font-body-semibold text-on-surface focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30';

function BotonEditar({ onClick, label = 'Editar' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" data-real onClick={onClick} className="mb-4 flex items-center gap-1 text-secondary hover:underline">
      <span className="material-symbols-outlined text-lg">edit</span>
      <span className="font-body-semibold text-sm">{label}</span>
    </button>
  );
}

function ModalEditarAcademico({
  abierto, inicial, onGuardar, onCerrar,
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
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
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
  abierto, inicial, onGuardar, onCerrar,
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
  abierto, inicial, onGuardar, onCerrar,
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

function ModalEditarRegistro({
  abierto, inicial, onGuardar, onCerrar,
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
  abierto, categoria, archivos, onSubir, onEliminar, onCerrar,
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
  const [registroEditando, setRegistroEditando] = useState<{ id: string | null } | null>(null);
  const [preguntarFinalizado, setPreguntarFinalizado] = useState(false);
  const [nuevoInteres, setNuevoInteres] = useState('');
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [verMapaCarrera, setVerMapaCarrera] = useState(false);
  const [categoriaPortafolio, setCategoriaPortafolio] = useState<'educativa' | 'galeria' | null>(null);

  const o = (v: string, d = '—') => (v && v.trim() ? v : d);

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

  const toggleApoyo = (clave: keyof PerfilEstudiante['apoyo']) => {
    actualizar({ apoyo: { ...perfil.apoyo, [clave]: !perfil.apoyo[clave] } });
    registrarActividad('Actualizaste tu apoyo requerido.');
  };

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

  const apoyosActivos = [
    perfil.apoyo.mentoria && 'Mentoría',
    perfil.apoyo.empleo && 'Empleo',
    perfil.apoyo.pasantia && 'Pasantía',
    perfil.apoyo.financiamiento && 'Financiamiento',
  ].filter(Boolean) as string[];
  const nombre = `${perfil.nombre} ${perfil.apellidos}`.trim() || 'Estudiante';
  const iniciales = nombre.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'E';

  // % de perfil según los campos obligatorios de RF-03 (mismo cálculo que el
  // dashboard y /mis-matches, para que el número sea consistente).
  const pctCampos = [
    perfil.carne, perfil.carrera, perfil.facultad, perfil.sede, perfil.anioIngreso, perfil.nivel,
    perfil.proyectoTitulo, perfil.proyectoDescripcion, perfil.areaTematica, perfil.proyectoTipo,
    perfil.proyectoAreas.length ? 'x' : '',
  ];
  const pct = Math.round((pctCampos.filter((c) => String(c).trim()).length / pctCampos.length) * 100);

  const hitosCarrera = [
    { texto: 'Completar información académica', hecho: Boolean(perfil.carne && perfil.carrera && perfil.facultad && perfil.nivel) },
    { texto: 'Registrar proyecto de graduación', hecho: Boolean(perfil.proyectoTitulo.trim()) },
    { texto: 'Avance del proyecto al 100%', hecho: perfil.proyectoAvance >= 100 },
    { texto: 'Agregar al menos un registro académico o de experiencia', hecho: perfil.historialAcademico.length > 0 },
    { texto: 'Definir tus áreas de interés', hecho: perfil.intereses.length > 0 },
    { texto: 'Aplicar a tu primera posición', hecho: aplicaciones.length > 0 },
  ];
  const porcentajeCarrera = Math.round((hitosCarrera.filter((h) => h.hecho).length / hitosCarrera.length) * 100);

  const fmtFecha = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return ''; }
  };

  return (
    <StudentShell active="perfil">
      <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-5 p-4 sm:p-8" onClick={avisoProximamente}>
        {/* Tarjeta de perfil (encabezado dinámico, responsivo) */}
        <div className="col-span-12">
          <div className="relative overflow-hidden rounded-3xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] sm:p-7">
            {/* Acentos decorativos */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-secondary/25 to-primary/10 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-[#54bceb]" aria-hidden />

            <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                {perfil.foto ? (
                  <img src={perfil.foto} alt={nombre} className="h-24 w-24 rounded-2xl border-2 border-white object-cover object-center shadow-md sm:h-28 sm:w-28" />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-2xl border-2 border-white bg-gradient-to-br from-primary to-secondary font-display-lg text-3xl font-bold text-white shadow-md sm:h-28 sm:w-28">{iniciales}</div>
                )}
                <span className="absolute -bottom-1.5 -right-1.5 grid h-7 w-7 place-items-center rounded-full border-2 border-surface-container-lowest bg-secondary text-on-secondary" title="Estudiante verificado">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </span>
              </div>

              {/* Identidad + chips */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h1 className="truncate font-headline-md text-2xl text-primary sm:text-3xl">{nombre}</h1>
                <p className="text-on-surface-variant">Estudiante · {o(perfil.carrera)}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {[
                    { icon: 'badge', txt: o(perfil.carne, 'Sin carné') },
                    { icon: 'location_on', txt: o(perfil.sede, 'Sede pendiente') },
                    { icon: 'workspace_premium', txt: `Beca ${o(perfil.beca, '—')}` },
                  ].map((c) => (
                    <span key={c.icon} className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                      <span className="material-symbols-outlined text-[15px] text-secondary">{c.icon}</span> {c.txt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Anillo de progreso + editar */}
              <div className="flex shrink-0 flex-col items-center gap-2">
                <div className="relative grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(#54bceb ${pct * 3.6}deg, rgba(0,76,99,0.08) 0deg)` }}>
                  <div className="grid h-[60px] w-[60px] place-items-center rounded-full bg-surface-container-lowest">
                    <span className="text-lg font-bold text-primary">{pct}%</span>
                  </div>
                </div>
                <Link href="/onboarding" data-real className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1.5 text-xs font-bold text-on-primary shadow-sm transition-transform hover:-translate-y-0.5">
                  <span className="material-symbols-outlined text-[16px]">edit</span> Editar
                </Link>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="relative mt-6 flex items-center justify-around gap-2 border-t border-outline-variant/40 pt-5 text-center">
              {[
                { icon: 'science', label: 'Avance TFG', valor: `${perfil.proyectoAvance}%` },
                { icon: 'work_history', label: 'Registros', valor: String(perfil.historialAcademico.length).padStart(2, '0') },
                { icon: 'interests', label: 'Intereses', valor: String(perfil.intereses.length).padStart(2, '0') },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && <div className="h-10 w-px shrink-0 bg-outline-variant/50" />}
                  <div className="flex flex-1 flex-col items-center">
                    <span className="material-symbols-outlined mb-0.5 text-secondary">{s.icon}</span>
                    <p className="text-xl font-bold text-primary">{s.valor}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">{s.label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {!perfil.completado && (
          <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4">
            <p className="text-sm text-on-surface"><strong>Completá tu perfil una vez</strong> y se reflejará en todas tus pantallas.</p>
            <Link href="/onboarding" data-real className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-on-secondary">Completar ahora</Link>
          </div>
        )}

        {/* Pausar perfil: no recibir contactos temporalmente (RF-03) */}
        <div className={`col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${perfil.pausado ? 'border-error/30 bg-error/5' : 'border-outline-variant/50 bg-surface-container-lowest'}`}>
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined ${perfil.pausado ? 'text-error' : 'text-tertiary'}`}>{perfil.pausado ? 'pause_circle' : 'check_circle'}</span>
            <p className="font-body-semibold text-on-surface">
              {perfil.pausado ? 'Tu perfil está pausado.' : 'Tu perfil está activo.'}{' '}
              <span className="font-body-base text-on-surface-variant">
                {perfil.pausado ? 'No estás recibiendo solicitudes de contacto de exalumnos.' : 'Podés pausarlo temporalmente si no querés recibir contactos.'}
              </span>
            </p>
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

        {/* ── Columna central ── */}
        <section className="col-span-12 flex flex-col gap-5 lg:col-span-8">
          <Desplegable titulo="Información Académica" icono="school" resumen={o(perfil.carrera)} defaultOpen>
            <BotonEditar onClick={() => setEditandoAcademico(true)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoLectura label="Carné" valor={o(perfil.carne)} />
              <CampoLectura label="Carrera" valor={o(perfil.carrera)} resaltar />
              <CampoLectura label="Escuela / Facultad" valor={o(perfil.facultad)} />
              <CampoLectura label="Sede" valor={o(perfil.sede)} />
              <CampoLectura label="Año de Ingreso" valor={o(perfil.anioIngreso)} />
              <CampoLectura label="Nivel Académico" valor={o(perfil.nivel)} />
              <CampoLectura label="Promedio Ponderado" valor={o(perfil.promedioPonderado, 'No registrado')} />
            </div>
          </Desplegable>

          <Desplegable titulo="Proyecto de Graduación (TFG)" icono="terminal" tono="primary" resumen={`${perfil.proyectoAvance}% avance`} defaultOpen>
            <BotonEditar onClick={() => setEditandoTFG(true)} />
            <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-on-primary">
              <div className="mb-4 flex items-start justify-between gap-3">
                <p className="font-body-semibold text-lg leading-tight">{o(perfil.proyectoTitulo, 'Aún no registraste tu proyecto de graduación')}</p>
                <span className="shrink-0 rounded bg-white/10 px-2 py-1 text-xs font-bold">{perfil.proyectoFinalizado ? 'FINALIZADO' : (perfil.proyectoTipo || 'TFG')}</span>
              </div>
              {perfil.areaTematica && <p className="mb-3 text-xs text-on-primary/70">Área temática: {perfil.areaTematica}</p>}
              <div className="mb-1 flex justify-between text-xs"><span>Progreso</span><span className="font-bold">{perfil.proyectoAvance}%</span></div>
              <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-primary-container">
                <div className="h-full rounded-full bg-secondary-container shadow-[0_0_12px_rgba(106,207,255,0.6)]" style={{ width: `${perfil.proyectoAvance}%` }} />
              </div>
              <div className="flex flex-wrap gap-1">
                {(perfil.proyectoAreas.length ? perfil.proyectoAreas : ['Sin áreas aún']).map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase">{t}</span>
                ))}
              </div>
            </div>
          </Desplegable>

          <Desplegable titulo="Empleabilidad y Trayectoria" icono="work_history" tono="tertiary" defaultOpen>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 p-4">
                <h3 className="font-body-semibold text-primary">Portal Empleabilidad</h3>
                <p className="text-sm text-on-surface-variant">Vacantes exclusivas para estudiantes y egresados UCR.</p>
                <Link href="/posiciones" data-real className="mt-auto rounded-lg bg-secondary py-2 text-center text-sm font-bold text-on-secondary transition-opacity hover:opacity-90">Ir a la Bolsa de Empleo</Link>
              </div>
              <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 p-4">
                <h3 className="font-body-semibold text-primary">Gestión de Trayectoria</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container"><div className="h-full bg-tertiary" style={{ width: `${porcentajeCarrera}%` }} /></div>
                  <span className="text-xs font-bold text-tertiary">{porcentajeCarrera}%</span>
                </div>
                <button data-real onClick={() => setVerMapaCarrera(true)} className="mt-auto rounded-lg border border-tertiary py-2 text-center text-sm font-bold text-tertiary transition-colors hover:bg-tertiary/5">Ver Mapa de Carrera</button>
              </div>
            </div>
          </Desplegable>

          <Desplegable titulo="Historial Académico y Experiencia" icono="auto_stories" resumen={`${perfil.historialAcademico.length} registro${perfil.historialAcademico.length === 1 ? '' : 's'}`} defaultOpen>
            <div className="mb-4 flex justify-end">
              <button data-real onClick={() => setRegistroEditando({ id: null })} className="flex items-center gap-1.5 rounded-full border border-secondary/40 px-3 py-1.5 text-sm font-bold text-secondary transition-colors hover:bg-secondary/5">
                <span className="material-symbols-outlined text-lg">add_circle</span> Añadir Registro
              </button>
            </div>
            <div className="space-y-3">
              {perfil.historialAcademico.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-outline-variant py-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline">history_edu</span>
                  <p className="text-sm italic text-on-surface-variant">Sin registros aún.</p>
                </div>
              )}
              {perfil.historialAcademico.map((r) => (
                <div key={r.id} className="group/reg flex items-center justify-between gap-3 rounded-xl border border-outline-variant/30 p-3 transition-colors hover:bg-surface-container-low">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                      <span className="material-symbols-outlined">{r.icono}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-body-semibold text-sm">{r.titulo}</p>
                      <p className="truncate text-xs text-on-surface-variant">{r.subtitulo}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button data-real onClick={() => setRegistroEditando({ id: r.id })} aria-label={`Editar ${r.titulo}`} className="p-1.5 text-outline-variant hover:text-secondary"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    <button data-real onClick={() => eliminarRegistro(r.id)} aria-label={`Eliminar ${r.titulo}`} className="p-1.5 text-outline-variant hover:text-error"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          </Desplegable>

          <Desplegable titulo="Historial de Postulaciones" icono="assignment" tono="primary" resumen={`${aplicaciones.length} postulacion${aplicaciones.length === 1 ? '' : 'es'}`} defaultOpen>
            <div className="space-y-3">
              {aplicaciones.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-outline-variant py-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline">work_outline</span>
                  <p className="text-sm italic text-on-surface-variant">Todavía no aplicaste a ninguna posición.</p>
                  <Link href="/posiciones" data-real className="text-sm font-bold text-secondary hover:underline">Explorar posiciones →</Link>
                </div>
              )}
              {aplicaciones.map((p) => {
                const e = ESTADO_APLICACION[p.estado] || ESTADO_APLICACION.enviada;
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-outline-variant/30 p-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary"><span className="material-symbols-outlined">business_center</span></div>
                    <div className="min-w-0">
                      <p className="truncate font-body-semibold text-sm">
                        {p.puestos_empleo?.titulo_puesto || 'Posición'}{p.puestos_empleo?.empresa ? ` — ${p.puestos_empleo.empresa}` : ''}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${e.cls}`}>{e.label}</span>
                        <span className="text-xs text-on-surface-variant">{fmtFecha(p.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Desplegable>
        </section>

        {/* ── Columna derecha ── */}
        <section className="col-span-12 flex flex-col gap-5 lg:col-span-4">
          <Desplegable titulo="Asistente de IA" icono="smart_toy" tono="primary" defaultOpen>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-on-surface-variant">Resolvé dudas sobre tu perfil, CV, matches o tu proyecto con el asistente inteligente de Alumni UCR.</p>
              <button
                type="button"
                data-real
                onClick={() => window.dispatchEvent(new Event('open-global-chatbot'))}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-bold text-on-primary transition-transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined">smart_toy</span> Abrir asistente
              </button>
            </div>
          </Desplegable>

          <Desplegable titulo="Tipo de Beca" icono="workspace_premium" tono="amber" resumen={o(perfil.beca, 'Sin asignar')} defaultOpen>
            <BotonEditar onClick={() => setEditandoBeca(true)} />
            <div className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Asignada</span>
                <span className="text-xl font-bold text-primary">{o(perfil.beca, 'Sin asignar')}</span>
              </div>
              <span className="material-symbols-outlined rounded-full bg-primary/10 p-2 text-primary">workspace_premium</span>
            </div>
          </Desplegable>

          <Desplegable titulo="Apoyo Requerido" icono="volunteer_activism" tono="tertiary" resumen={apoyosActivos.length ? `${apoyosActivos.length} tipo${apoyosActivos.length === 1 ? '' : 's'}` : 'Ninguno'} defaultOpen>
            <div className="flex flex-col gap-2">
              {([
                { clave: 'mentoria', label: 'Mentoría' },
                { clave: 'empleo', label: 'Ofertas de Empleo' },
                { clave: 'pasantia', label: 'Pasantía Académica' },
                { clave: 'financiamiento', label: 'Financiamiento' },
              ] as { clave: keyof PerfilEstudiante['apoyo']; label: string }[]).map((a) => (
                <label key={a.clave} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${perfil.apoyo[a.clave] ? 'border-tertiary/40 bg-tertiary/5' : 'border-outline-variant/30 bg-surface-container-low hover:border-secondary'}`}>
                  <input data-real type="checkbox" checked={perfil.apoyo[a.clave]} onChange={() => toggleApoyo(a.clave)} className="rounded border-outline-variant accent-secondary" />
                  <span className="font-body-semibold text-sm">{a.label}</span>
                </label>
              ))}
            </div>
          </Desplegable>

          <Desplegable titulo="Intereses" icono="interests" resumen={perfil.intereses.length ? `${perfil.intereses.length}` : 'Ninguno'} defaultOpen>
            <div className="flex flex-wrap items-center gap-2">
              {perfil.intereses.length === 0 && <span className="text-xs italic text-on-surface-variant">Sin intereses aún.</span>}
              {perfil.intereses.map((i) => (
                <span key={i} className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-body-semibold text-primary">
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
              <button data-real type="button" onClick={agregarInteres} aria-label="Agregar interés" className="rounded-full border border-dashed border-outline-variant p-1.5 text-on-surface-variant transition-all hover:border-primary hover:text-primary">
                <span className="material-symbols-outlined text-xs">add</span>
              </button>
            </div>
          </Desplegable>

          <Desplegable titulo="Portafolio" icono="folder" tono="primary" resumen={`${perfil.portafolio.length} archivo${perfil.portafolio.length === 1 ? '' : 's'}`} defaultOpen>
            <div className="grid grid-cols-2 gap-2">
              <button data-real onClick={() => setCategoriaPortafolio('educativa')} className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent bg-surface-container p-3 transition-all hover:border-secondary">
                <span className="material-symbols-outlined text-3xl text-secondary">folder</span>
                <span className="text-center text-xs font-bold uppercase">Info Educativa</span>
                <span className="text-[11px] text-on-surface-variant">{perfil.portafolio.filter((a) => a.categoria === 'educativa').length} archivo(s)</span>
              </button>
              <button data-real onClick={() => setCategoriaPortafolio('galeria')} className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent bg-surface-container p-3 transition-all hover:border-secondary">
                <span className="material-symbols-outlined text-3xl text-primary">collections</span>
                <span className="text-center text-xs font-bold uppercase">Galería TFG</span>
                <span className="text-[11px] text-on-surface-variant">{perfil.portafolio.filter((a) => a.categoria === 'galeria').length} archivo(s)</span>
              </button>
            </div>
          </Desplegable>

          <Desplegable titulo="Comunidad" icono="forum" defaultOpen>
            <div className="space-y-3">
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-secondary/10 px-1 text-xs font-bold uppercase text-secondary">NOTICIA</span>
                  <span className="text-xs text-on-surface-variant">Hace 2 días</span>
                </div>
                <p className="line-clamp-2 text-xs font-body-semibold">Nuevos avances en el Sistema de Gestión de Talento IA</p>
              </div>
              <Link href="/comunidad" data-real className="block rounded-lg bg-primary py-2 text-center text-sm font-bold text-on-primary">Ir a Comunidad</Link>
            </div>
          </Desplegable>

          <Desplegable titulo="Seguridad y Reportes" icono="security" tono="error" resumen="Cuenta segura" defaultOpen>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-primary">Estado de Cuenta</span>
                  <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-bold text-green-600">SEGURO</span>
                </div>
                <p className="text-xs text-on-surface-variant">Tu cuenta está activa y en buen estado.</p>
              </div>
              <p className="text-xs italic leading-tight text-on-surface-variant">3 reportes generan una suspensión temporal automática. Los reportes son 100% anónimos.</p>
              <Link href="/reportes" data-real className="flex items-center justify-center gap-2 rounded-lg border border-error py-2 text-center text-sm font-bold text-error transition-colors hover:bg-error/5">
                <span className="material-symbols-outlined text-sm">flag</span> Ir a Reportes
              </Link>
            </div>
          </Desplegable>
        </section>

        {/* ── Modales ── */}
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

        <ModalEditarBeca abierto={editandoBeca} inicial={perfil.beca} onGuardar={(beca) => { actualizar({ beca }); registrarActividad('Actualizaste tu tipo de beca.'); }} onCerrar={() => setEditandoBeca(false)} />

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

        <ModalMapaCarrera abierto={verMapaCarrera} hitos={hitosCarrera} onCerrar={() => setVerMapaCarrera(false)} />

        <ModalPortafolio
          abierto={categoriaPortafolio !== null}
          categoria={categoriaPortafolio}
          archivos={perfil.portafolio}
          onSubir={subirArchivoPortafolio}
          onEliminar={eliminarArchivoPortafolio}
          onCerrar={() => setCategoriaPortafolio(null)}
        />
      </div>
    </StudentShell>
  );
}
