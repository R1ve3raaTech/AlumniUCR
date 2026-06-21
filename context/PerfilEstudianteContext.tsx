'use client';

// Fuente única de verdad del estudiante (MVP en navegador). Se llena una vez en
// el onboarding y persiste en localStorage; todas las pantallas del estudiante
// (dashboard, perfil, CV+IA, matches, etc.) leen de aquí y prellenan sus campos.
// Más adelante se respalda en la base de datos sin cambiar las pantallas.

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface PerfilEstudiante {
  // Identidad
  nombre: string;
  apellidos: string;
  telefono: string;
  linkedin: string;
  // Académica
  carne: string;
  carrera: string;
  sede: string;
  anioIngreso: string;
  nivel: string;
  // Situación socioeconómica
  beca: string; // 'Tipo 4' | 'Tipo 5' | ''
  // Proyecto de graduación (TFG)
  proyectoTitulo: string;
  proyectoDescripcion: string;
  proyectoAvance: number;
  proyectoAreas: string[];
  // Apoyo requerido
  apoyo: { mentoria: boolean; empleo: boolean; pasantia: boolean; financiamiento: boolean };
  // Intereses
  intereses: string[];
  // Habilidades
  habilidadesTecnicas: string;
  habilidadesBlandas: string;
  idiomas: string;
  // meta
  completado: boolean;
}

export const PERFIL_VACIO: PerfilEstudiante = {
  nombre: '',
  apellidos: '',
  telefono: '',
  linkedin: '',
  carne: '',
  carrera: '',
  sede: '',
  anioIngreso: '',
  nivel: '',
  beca: '',
  proyectoTitulo: '',
  proyectoDescripcion: '',
  proyectoAvance: 0,
  proyectoAreas: [],
  apoyo: { mentoria: false, empleo: false, pasantia: false, financiamiento: false },
  intereses: [],
  habilidadesTecnicas: '',
  habilidadesBlandas: '',
  idiomas: '',
  completado: false,
};

interface Ctx {
  perfil: PerfilEstudiante;
  actualizar: (parcial: Partial<PerfilEstudiante>) => void;
  reiniciar: () => void;
  cargado: boolean;
}

const PerfilEstudianteContext = createContext<Ctx | null>(null);
const CLAVE = 'ct_perfil_estudiante';

export function PerfilEstudianteProvider({ children }: { children: React.ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilEstudiante>(PERFIL_VACIO);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) setPerfil({ ...PERFIL_VACIO, ...JSON.parse(raw) });
    } catch {
      /* almacenamiento no disponible */
    }
    setCargado(true);
  }, []);

  const actualizar = (parcial: Partial<PerfilEstudiante>) =>
    setPerfil((p) => {
      const next = { ...p, ...parcial };
      try {
        localStorage.setItem(CLAVE, JSON.stringify(next));
      } catch {
        /* ignora */
      }
      return next;
    });

  const reiniciar = () => {
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      /* ignora */
    }
    setPerfil(PERFIL_VACIO);
  };

  return (
    <PerfilEstudianteContext.Provider value={{ perfil, actualizar, reiniciar, cargado }}>
      {children}
    </PerfilEstudianteContext.Provider>
  );
}

export function usePerfilEstudiante() {
  const ctx = useContext(PerfilEstudianteContext);
  if (!ctx) throw new Error('usePerfilEstudiante debe usarse dentro de PerfilEstudianteProvider');
  return ctx;
}
