'use client';

import AsistentePasoLayout from '@/components/proyecto-graduacion/AsistentePasoLayout';
import { CampoTextarea } from '@/components/proyecto-graduacion/Campo';
import SugerirMejora from '@/components/proyecto-graduacion/SugerirMejora';
import EjemploToggle from '@/components/proyecto-graduacion/EjemploToggle';
import { obtenerEjemploPorArea } from '@/components/proyecto-graduacion/ejemplosPorArea';
import { useProyectoGraduacion } from '@/context/ProyectoGraduacionContext';

export default function IntroduccionProyectoPage() {
  const { proyecto, actualizar } = useProyectoGraduacion();
  const ejemplo = obtenerEjemploPorArea(proyecto.areaTematica);

  return (
    <AsistentePasoLayout paso={3} titulo="Introducción">
      <CampoTextarea
        label="Planteamiento del problema"
        value={proyecto.planteamientoProblema}
        onChange={(v) => actualizar({ planteamientoProblema: v })}
        placeholder="¿Cuál es el problema que aborda tu proyecto?"
        filas={5}
      />
      <SugerirMejora
        campo="planteamientoProblema"
        texto={proyecto.planteamientoProblema}
        onAplicar={(s) => actualizar({ planteamientoProblema: s })}
      />
      <div className="mb-5" />
      <EjemploToggle titulo="planteamiento del problema" texto={ejemplo.planteamiento} />

      <CampoTextarea
        label="Delimitación"
        value={proyecto.delimitacion}
        onChange={(v) => actualizar({ delimitacion: v })}
        placeholder="Alcance y límites del proyecto (qué sí y qué no cubre)"
        filas={4}
      />

      <CampoTextarea
        label="Justificación"
        value={proyecto.justificacion}
        onChange={(v) => actualizar({ justificacion: v })}
        placeholder="¿Por qué es importante desarrollar este proyecto?"
        filas={4}
      />
      <SugerirMejora
        campo="justificacion"
        texto={proyecto.justificacion}
        onAplicar={(s) => actualizar({ justificacion: s })}
      />
    </AsistentePasoLayout>
  );
}
