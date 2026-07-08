'use client';

import AsistentePasoLayout from '@/components/proyecto-graduacion/AsistentePasoLayout';
import { CampoTextarea, inputCls } from '@/components/proyecto-graduacion/Campo';
import SugerirMejora from '@/components/proyecto-graduacion/SugerirMejora';
import EjemploToggle from '@/components/proyecto-graduacion/EjemploToggle';
import { obtenerEjemploPorArea } from '@/components/proyecto-graduacion/ejemplosPorArea';
import { useProyectoGraduacion } from '@/context/ProyectoGraduacionContext';

// Verbos medibles aceptados para redactar objetivos específicos (metodología
// de objetivos SMART). La validación es solo visual (no bloquea guardar ni
// avanzar) para no frustrar al estudiante mientras redacta.
const VERBOS_MEDIBLES = ['analizar', 'diseñar', 'evaluar', 'implementar', 'comparar', 'determinar', 'identificar'];

function empiezaConVerboMedible(texto: string): boolean {
  const primeraPalabra = texto.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  return VERBOS_MEDIBLES.includes(primeraPalabra);
}

export default function ObjetivosProyectoPage() {
  const { proyecto, actualizar } = useProyectoGraduacion();
  const ejemplo = obtenerEjemploPorArea(proyecto.areaTematica);

  function actualizarEspecifico(i: number, valor: string) {
    const copia = [...proyecto.objetivosEspecificos];
    copia[i] = valor;
    actualizar({ objetivosEspecificos: copia });
  }

  function agregarEspecifico() {
    actualizar({ objetivosEspecificos: [...proyecto.objetivosEspecificos, ''] });
  }

  function quitarEspecifico(i: number) {
    actualizar({ objetivosEspecificos: proyecto.objetivosEspecificos.filter((_, j) => j !== i) });
  }

  return (
    <AsistentePasoLayout paso={4} titulo="Objetivos">
      <CampoTextarea
        label="Objetivo general"
        value={proyecto.objetivoGeneral}
        onChange={(v) => actualizar({ objetivoGeneral: v })}
        placeholder="Ej. Desarrollar un sistema para… (un único verbo fuerte en infinitivo)"
        filas={3}
      />
      <SugerirMejora
        campo="objetivoGeneral"
        texto={proyecto.objetivoGeneral}
        onAplicar={(s) => actualizar({ objetivoGeneral: s })}
      />
      <div className="mb-5" />
      <EjemploToggle titulo="objetivos" texto={ejemplo.objetivos} />

      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-body-semibold text-on-surface">Objetivos específicos</label>
        <span className="text-xs text-on-surface-variant">
          Deben iniciar con un verbo medible: {VERBOS_MEDIBLES.map((v) => v[0].toUpperCase() + v.slice(1)).join(', ')}
        </span>
      </div>

      <div className="space-y-4">
        {proyecto.objetivosEspecificos.map((obj, i) => {
          const valido = obj.trim() === '' || empiezaConVerboMedible(obj);
          return (
            <div key={i}>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} ${!valido ? 'border-error focus:border-error focus:ring-error/30' : ''}`}
                  value={obj}
                  onChange={(e) => actualizarEspecifico(i, e.target.value)}
                  placeholder={`Objetivo específico ${i + 1} (ej. Analizar…, Diseñar…, Evaluar…)`}
                />
                <button
                  type="button"
                  onClick={() => quitarEspecifico(i)}
                  aria-label="Quitar objetivo"
                  className="shrink-0 rounded-lg border border-outline-variant/40 px-3 text-on-surface-variant transition hover:border-error hover:text-error"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
              {!valido && (
                <p className="mt-1 text-xs text-error">
                  Debe empezar con un verbo medible (ej. &quot;Analizar…&quot;, &quot;Diseñar…&quot;).
                </p>
              )}
              <SugerirMejora
                campo="objetivoEspecifico"
                texto={obj}
                onAplicar={(s) => actualizarEspecifico(i, s)}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={agregarEspecifico}
        className="mt-4 flex items-center gap-1 rounded-lg border border-dashed border-outline-variant/50 px-4 py-2 text-sm font-body-semibold text-secondary transition hover:bg-secondary-container/20"
      >
        <span className="material-symbols-outlined text-base">add</span>
        Agregar objetivo específico
      </button>
    </AsistentePasoLayout>
  );
}
