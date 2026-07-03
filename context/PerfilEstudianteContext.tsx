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

export interface RegistroAcademico {
  id: string;
  icono: string;
  titulo: string;
  subtitulo: string;
}

export interface ArchivoPortafolio {
  id: string;
  categoria: 'educativa' | 'galeria';
  nombre: string;
  dataUrl: string;
}

export interface ActividadItem {
  id: string;
  texto: string;
  fecha: string; // ISO
}

export interface PerfilEstudiante {
  // Identidad
  nombre: string;
  apellidos: string;
  telefono: string;
  direccion: string;
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
  facultad: string;
  sede: string;
  anioIngreso: string;
  nivel: string; // Bachillerato | Licenciatura | Maestría | Doctorado
  promedioPonderado: string; // opcional, privado (RF-03 Sección 1)
  // Situación socioeconómica
  beca: string; // Sin beca | Nivel 1..5
  // Proyecto de graduación (TFG)
  proyectoTitulo: string;
  proyectoDescripcion: string;
  proyectoAvance: number;
  areaTematica: string; // Sección 3: 1 sola área del catálogo de 14
  proyectoAreas: string[]; // Sección 4 "Áreas de interés del proyecto": mín. 1, del catálogo de 14
  proyectoTipo: string; // TFG | Tesis | Práctica Dirigida | Seminario
  necesidadesProyecto: {
    financiamiento: boolean;
    mentoriaTecnica: boolean;
    accesoDatos: boolean;
    infraestructura: boolean;
    validacionEmpresarial: boolean;
    empleoParalelo: boolean;
  };
  proyectoFinalizado: boolean;
  // Apoyo requerido
  apoyo: { mentoria: boolean; empleo: boolean; pasantia: boolean; financiamiento: boolean };
  // Pausar perfil: no recibir contactos temporalmente (RF-03, criterio de aceptación)
  pausado: boolean;
  // Portafolio (documentos/imágenes); igual que la foto de perfil, se guarda como data URL.
  portafolio: ArchivoPortafolio[];
  // Bitácora de actividad propia ("Ver toda mi actividad"), más reciente primero.
  actividad: ActividadItem[];
  // Historial académico y experiencia (cursos, pasantías, etc.)
  historialAcademico: RegistroAcademico[];
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
  direccion: '',
  linkedin: '',
  foto: '',
  cargoDeseado: '',
  ubicacion: '',
  resumen: '',
  experiencias: [],
  carne: '',
  carrera: '',
  facultad: '',
  sede: '',
  anioIngreso: '',
  nivel: '',
  promedioPonderado: '',
  beca: 'Sin beca',
  proyectoTitulo: '',
  proyectoDescripcion: '',
  proyectoAvance: 0,
  areaTematica: '',
  proyectoAreas: [],
  proyectoTipo: 'TFG',
  necesidadesProyecto: {
    financiamiento: false,
    mentoriaTecnica: false,
    accesoDatos: false,
    infraestructura: false,
    validacionEmpresarial: false,
    empleoParalelo: false,
  },
  proyectoFinalizado: false,
  apoyo: { mentoria: false, empleo: false, pasantia: false, financiamiento: false },
  pausado: false,
  portafolio: [],
  actividad: [],
  historialAcademico: [],
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
