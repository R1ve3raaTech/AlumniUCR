'use client';

// Fuente única de verdad del estudiante (MVP en navegador). Se llena una vez en
// el onboarding y persiste en localStorage; todas las pantallas del estudiante
// (dashboard, perfil, CV+IA, matches, etc.) leen de aquí y prellenan sus campos.
// Más adelante se respalda en la base de datos sin cambiar las pantallas.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfilOnboarding, guardarPerfilOnboarding } from '@/lib/perfilOnboarding';

export interface Experiencia {
  puesto: string;
  empresa: string;
  periodo: string;
  descripcion: string;
}

export interface PerfilEstudiante {
  // Identidad
  nombre: string;
  apellidos: string;
  telefono: string;
  linkedin: string;
  foto: string; // data URL (imagen recortada) o URL; pertenece a la persona
  // CV (editor)
  cargoDeseado: string;
  ubicacion: string;
  resumen: string;
  experiencias: Experiencia[];
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
  proyectoTipo: string; // TFG | TCU | Proyecto de Curso
  // Adjunto del proyecto: foto (recortada), documento PDF o un enlace.
  proyectoAdjunto: string; // data URL (imagen/pdf) o URL (link)
  proyectoAdjuntoTipo: string; // '' | 'imagen' | 'pdf' | 'link'
  proyectoAdjuntoNombre: string;
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
  foto: '',
  cargoDeseado: '',
  ubicacion: '',
  resumen: '',
  experiencias: [],
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
  proyectoTipo: 'TFG (Trabajo Final de Graduación)',
  proyectoAdjunto: '',
  proyectoAdjuntoTipo: '',
  proyectoAdjuntoNombre: '',
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
  const { token } = useAuth();
  const [perfil, setPerfil] = useState<PerfilEstudiante>(PERFIL_VACIO);
  const [cargado, setCargado] = useState(false);

  // 1) Carga inmediata desde localStorage (caché).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) setPerfil({ ...PERFIL_VACIO, ...JSON.parse(raw) });
    } catch {
      /* almacenamiento no disponible */
    }
    setCargado(true);
  }, []);

  // 2) Al haber sesión, la BD (Supabase) es la fuente autoritativa: si hay un
  //    perfil guardado, se usa ese y se refresca la caché local.
  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      const datos = await obtenerPerfilOnboarding(token);
      if (activo && datos) {
        const completo = { ...PERFIL_VACIO, ...datos } as PerfilEstudiante;
        setPerfil(completo);
        try { localStorage.setItem(CLAVE, JSON.stringify(completo)); } catch { /* ignora */ }
      }
    })();
    return () => { activo = false; };
  }, [token]);

  const actualizar = (parcial: Partial<PerfilEstudiante>) =>
    setPerfil((p) => {
      const next = { ...p, ...parcial };
      try {
        localStorage.setItem(CLAVE, JSON.stringify(next));
      } catch {
        /* ignora */
      }
      // Respaldo en la BD (no bloquea la UI; si falla, queda en localStorage).
      if (token) guardarPerfilOnboarding(token, next);
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
