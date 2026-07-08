'use client';

import AsistentePasoLayout from '@/components/proyecto-graduacion/AsistentePasoLayout';
import { CampoTextarea } from '@/components/proyecto-graduacion/Campo';
import EjemploToggle from '@/components/proyecto-graduacion/EjemploToggle';
import { obtenerEjemploPorArea } from '@/components/proyecto-graduacion/ejemplosPorArea';
import { useProyectoGraduacion } from '@/context/ProyectoGraduacionContext';

export default function MetodologiaProyectoPage() {
  const { proyecto, actualizar } = useProyectoGraduacion();
  const ejemplo = obtenerEjemploPorArea(proyecto.areaTematica);

  return (
    <AsistentePasoLayout paso={6} titulo="Metodología">
      <EjemploToggle titulo="metodología" texto={ejemplo.metodologia} />
      <CampoTextarea
        label="Metodología"
        value={proyecto.metodologia}
        onChange={(v) => actualizar({ metodologia: v })}
        placeholder="Describe el enfoque, técnicas, herramientas y pasos metodológicos que vas a seguir…"
        filas={10}
      />
    </AsistentePasoLayout>
  );
}
