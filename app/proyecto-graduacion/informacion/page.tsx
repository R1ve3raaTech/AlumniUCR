'use client';

import AsistentePasoLayout from '@/components/proyecto-graduacion/AsistentePasoLayout';
import { CampoTexto, CampoTextarea, inputCls } from '@/components/proyecto-graduacion/Campo';
import { useProyectoGraduacion } from '@/context/ProyectoGraduacionContext';

const AREAS_TEMATICAS = [
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

export default function InformacionProyectoPage() {
  const { proyecto, actualizar } = useProyectoGraduacion();

  return (
    <AsistentePasoLayout paso={1} titulo="Información del proyecto">
      <CampoTexto
        label="Título del proyecto"
        value={proyecto.titulo}
        onChange={(v) => actualizar({ titulo: v })}
        placeholder="Ej. Sistema de monitoreo de calidad del agua con sensores IoT"
      />
      <CampoTextarea
        label="Descripción"
        value={proyecto.descripcion}
        onChange={(v) => actualizar({ descripcion: v })}
        placeholder="Resumen breve de en qué consiste el proyecto…"
      />
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-body-semibold text-on-surface">Área temática</label>
        <select
          className={inputCls}
          value={proyecto.areaTematica}
          onChange={(e) => actualizar({ areaTematica: e.target.value })}
        >
          <option value="" disabled>Selecciona un área…</option>
          {AREAS_TEMATICAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 flex items-center justify-between text-sm font-body-semibold text-on-surface">
          <span>Porcentaje de avance</span>
          <span className="text-secondary">{proyecto.porcentajeAvance}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={proyecto.porcentajeAvance}
          onChange={(e) => actualizar({ porcentajeAvance: Number(e.target.value) })}
          className="w-full accent-secondary"
        />
      </div>
    </AsistentePasoLayout>
  );
}
