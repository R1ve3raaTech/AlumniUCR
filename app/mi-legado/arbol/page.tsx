'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerMiPerfilExalumno } from '@/lib/perfilExalumno';
import { obtenerMiLegado } from '@/lib/fidelizacion';
import ArbolImpactoCibernetico from '@/components/ArbolImpactoCibernetico';

interface Perfil {
  nombre?: string;
  correo_electronico?: string;
  estado?: string;
  roles?: { nombre?: string } | null;
  metadata?: { carreras?: string[]; escuela_facultad?: string; anio_graduacion?: number | string } | null;
}

export default function ArbolImpactoFullscreenPage() {
  const router = useRouter();
  const { token, loading } = useAuth();
  
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [legado, setLegado] = useState<any | null>(null);
  const [cargando, setCargando] = useState(true);

  // Redireccionar si no hay sesión
  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  // Cargar datos del perfil y legado
  useEffect(() => {
    if (!token) return;
    let activo = true;

    obtenerMiPerfilExalumno(token)
      .then((p) => {
        if (activo) setPerfil(p?.data?.usuario ?? null);
      })
      .catch((err) => console.error("Error al cargar perfil:", err));

    setCargando(true);
    obtenerMiLegado(token)
      .then((res) => {
        if (activo) setLegado(res?.data ?? res ?? null);
      })
      .catch((err) => console.error("Error al cargar legado:", err))
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [token]);

  const nombre = perfil?.nombre || '';
  const escuelaFacultad = perfil?.metadata?.escuela_facultad || '';
  const anioGraduacion = perfil?.metadata?.anio_graduacion || '';

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-brand-body text-[#004857]">
        <div className="flex flex-col items-center gap-3">
          <span className="h-10 w-10 border-4 border-[#005B70] border-t-transparent rounded-full animate-spin"></span>
          <p className="text-sm font-bold uppercase tracking-wider">Cargando red de impacto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] overflow-hidden flex flex-col p-4 sm:p-6 relative select-none">
      
      {/* Botón flotante superior izquierdo para retornar */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/mi-legado" 
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 hover:bg-[#005B70]/5 px-4 py-2.5 text-xs font-bold text-[#005B70] shadow-md transition-all active:scale-[0.98] backdrop-blur-md"
        >
          <span className="material-symbols-outlined text-[15px] font-bold">arrow_back</span>
          <span>Volver a Mi Legado</span>
        </Link>
      </div>

      {/* Árbol de Impacto en Pantalla Completa Nivel Padre */}
      <div className="flex-1 w-full h-full min-h-0 relative">
        <ArbolImpactoCibernetico
          legado={legado}
          nombre={nombre}
          facultad={escuelaFacultad}
          anio={anioGraduacion}
        />
      </div>
    </div>
  );
}
