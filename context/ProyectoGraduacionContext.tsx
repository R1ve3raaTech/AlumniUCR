'use client';

// Estado del asistente de Proyecto de Graduación. Mismo patrón que
// PerfilEstudianteContext: persiste en localStorage (clave propia, invalidada
// por __uid si cambia el usuario logueado) y expone actualizar() con merge
// optimista. La sincronización con el backend queda como TODO: la tabla
// proyecto_graduacion actual no tiene columnas para estos campos ampliados
// (introducción, objetivos, marco teórico, metodología, referencias,
// cronograma) — requiere una migración antes de conectar lib/proyectoGraduacionAsistente.ts
// de verdad. Por ahora este contexto es la fuente de verdad solo en el cliente.

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useAuth } from '@/context/AuthContext';

const STORAGE_KEY = 'ct_proyecto_graduacion';

export interface CronogramaItem {
  actividad: string;
  inicio: string;
  fin: string;
}

// Modalidades reales del RF-03 ampliado. El formulario del Paso 2 muestra
// campos adicionales distintos según cuál se elija (ver ModalidadPage).
export const MODALIDADES = ['Tesis', 'Seminario', 'Proyecto de Graduación', 'Práctica Dirigida'] as const;
export type Modalidad = typeof MODALIDADES[number] | '';

export interface ProyectoGraduacion {
  // Paso 1 — Información del proyecto
  titulo: string;
  descripcion: string;
  areaTematica: string;
  porcentajeAvance: number;
  // Paso 2 — Modalidad (+ campos condicionales según cuál se elija)
  modalidad: Modalidad;
  integrantesSeminario: string;   // solo Seminario
  empresaPractica: string;        // solo Práctica Dirigida
  entidadColaboradora: string;    // solo Proyecto de Graduación
  // Paso 3 — Introducción
  introduccion: string;
  planteamientoProblema: string;
  delimitacion: string;
  justificacion: string;
  // Paso 4 — Objetivos
  objetivoGeneral: string;
  objetivosEspecificos: string[];
  // Paso 5 — Marco Teórico
  marcoTeorico: string;
  // Paso 6 — Metodología
  metodologia: string;
  // Paso 7 — Referencias
  referencias: string[];
  // Paso 8 — Cronograma
  cronograma: CronogramaItem[];
}

const VACIO: ProyectoGraduacion = {
  titulo: '',
  descripcion: '',
  areaTematica: '',
  porcentajeAvance: 0,
  modalidad: '',
  integrantesSeminario: '',
  empresaPractica: '',
  entidadColaboradora: '',
  introduccion: '',
  planteamientoProblema: '',
  delimitacion: '',
  justificacion: '',
  objetivoGeneral: '',
  objetivosEspecificos: [],
  marcoTeorico: '',
  metodologia: '',
  referencias: [],
  cronograma: [],
};

interface Almacenado extends ProyectoGraduacion {
  __uid?: string;
}

interface ProyectoGraduacionContextValue {
  proyecto: ProyectoGraduacion;
  cargando: boolean;
  actualizar: (parcial: Partial<ProyectoGraduacion>) => void;
  reiniciar: () => void;
}

// Completitud por paso (1-8) — usada por la barra de progreso y el stepper.
// No depende de porcentajeAvance (que el estudiante llena a mano); es sobre
// si cada sección del documento tiene contenido.
export function calcularCompletitudPasos(p: ProyectoGraduacion): boolean[] {
  return [
    Boolean(p.titulo.trim() && p.descripcion.trim() && p.areaTematica.trim()),
    Boolean(p.modalidad),
    Boolean(p.planteamientoProblema.trim() && p.delimitacion.trim() && p.justificacion.trim()),
    Boolean(p.objetivoGeneral.trim() && p.objetivosEspecificos.some((o) => o.trim())),
    Boolean(p.marcoTeorico.trim()),
    Boolean(p.metodologia.trim()),
    Boolean(p.referencias.some((r) => r.trim())),
    Boolean(p.cronograma.length > 0),
  ];
}

export function calcularPorcentajeCompletitud(p: ProyectoGraduacion): number {
  const pasos = calcularCompletitudPasos(p);
  return Math.round((pasos.filter(Boolean).length / pasos.length) * 100);
}

// Los 6 apartados obligatorios del Reglamento para poder finalizar la
// propuesta (Información y Modalidad quedan fuera de este chequeo: son datos
// de encabezado, no "apartados" del documento en sí).
export const APARTADOS_REGLAMENTO = [
  { key: 'introduccion', label: 'Introducción' },
  { key: 'objetivos', label: 'Objetivos' },
  { key: 'marcoTeorico', label: 'Marco Teórico' },
  { key: 'metodologia', label: 'Metodología' },
  { key: 'referencias', label: 'Referencias' },
  { key: 'cronograma', label: 'Cronograma' },
] as const;

export function calcularChecklistReglamento(p: ProyectoGraduacion): { key: string; label: string; completo: boolean }[] {
  const pasos = calcularCompletitudPasos(p);
  // pasos[2..7] corresponden exactamente a los 6 apartados de APARTADOS_REGLAMENTO,
  // en el mismo orden (ver calcularCompletitudPasos).
  const completitudApartados = pasos.slice(2);
  return APARTADOS_REGLAMENTO.map((a, i) => ({ ...a, completo: completitudApartados[i] }));
}

// Apartados faltantes para poder finalizar la propuesta — usado para bloquear
// el botón "Finalizar propuesta" en la Vista Previa / Revisión Final.
export function calcularApartadosFaltantes(p: ProyectoGraduacion): string[] {
  return calcularChecklistReglamento(p)
    .filter((a) => !a.completo)
    .map((a) => a.label);
}

const ProyectoGraduacionContext = createContext<ProyectoGraduacionContextValue | undefined>(undefined);

export function ProyectoGraduacionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [proyecto, setProyecto] = useState<ProyectoGraduacion>(VACIO);
  const [cargando, setCargando] = useState(true);

  // Carga inicial desde localStorage; invalida si el __uid guardado no
  // coincide con el usuario logueado actual (evita mezclar datos entre cuentas
  // en la misma computadora).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const datos: Almacenado = JSON.parse(raw);
        if (!user?.id || datos.__uid === user.id) {
          const { __uid, ...resto } = datos;
          setProyecto({ ...VACIO, ...resto });
        }
      }
    } catch {
      // localStorage corrupto: se ignora y arranca vacío.
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // TODO: cuando exista la migración de BD, cargar acá desde el backend
  // (lib/proyectoGraduacionAsistente.ts) como fuente autoritativa, igual que
  // PerfilEstudianteContext hace con perfilOnboarding.

  const persistir = useCallback((datos: ProyectoGraduacion) => {
    if (typeof window === 'undefined') return;
    const almacenado: Almacenado = { ...datos, __uid: user?.id };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(almacenado));
  }, [user?.id]);

  const actualizar = useCallback((parcial: Partial<ProyectoGraduacion>) => {
    setProyecto((actual) => {
      const nuevo = { ...actual, ...parcial };
      persistir(nuevo);
      return nuevo;
    });
    // TODO: fire-and-forget al backend una vez exista el endpoint ampliado.
  }, [persistir]);

  const reiniciar = useCallback(() => {
    setProyecto(VACIO);
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ProyectoGraduacionContext.Provider value={{ proyecto, cargando, actualizar, reiniciar }}>
      {children}
    </ProyectoGraduacionContext.Provider>
  );
}

export function useProyectoGraduacion() {
  const ctx = useContext(ProyectoGraduacionContext);
  if (!ctx) {
    throw new Error('useProyectoGraduacion debe usarse dentro de un <ProyectoGraduacionProvider>.');
  }
  return ctx;
}
