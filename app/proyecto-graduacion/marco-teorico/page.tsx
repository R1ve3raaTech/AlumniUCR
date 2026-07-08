'use client';

import AsistentePasoLayout from '@/components/proyecto-graduacion/AsistentePasoLayout';
import { CampoTextarea } from '@/components/proyecto-graduacion/Campo';
import { useProyectoGraduacion } from '@/context/ProyectoGraduacionContext';

export default function MarcoTeoricoProyectoPage() {
  const { proyecto, actualizar } = useProyectoGraduacion();

  return (
    <AsistentePasoLayout paso={5} titulo="Marco Teórico">
      <CampoTextarea
        label="Marco teórico"
        value={proyecto.marcoTeorico}
        onChange={(v) => actualizar({ marcoTeorico: v })}
        placeholder="Desarrolla los conceptos, teorías y antecedentes que sustentan tu proyecto…"
        filas={10}
      />
    </AsistentePasoLayout>
  );
}
