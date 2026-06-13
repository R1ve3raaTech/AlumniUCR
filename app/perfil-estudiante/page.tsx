'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import InformacionAcademicaForm from '@/components/perfil/InformacionAcademicaForm';
import ProyectoGraduacionForm from '@/components/perfil/ProyectoGraduacionForm';
import { obtenerInformacionEstudiante } from '@/lib/perfilAcademico';
import dashboardStyles from '../dashboard/dashboard.module.css';
import perfilStyles from '@/components/perfil/perfil.module.css';

// Página del perfil de estudiante (RF-03). Incluye la Sección 1 (Información
// Académica / Situación Socioeconómica) y la Sección 3 (Proyecto de
// Graduación). La Sección 3 depende de que exista informacion_estudiante
// (FK proyecto_graduacion_id_estudiante_fkey), por lo que se oculta hasta que
// la Sección 1 esté completa.
export default function PerfilEstudiantePage() {
  const router = useRouter();
  const { token, user, loading } = useAuth();

  const [verificandoPerfil, setVerificandoPerfil] = useState(true);
  const [perfilAcademicoListo, setPerfilAcademicoListo] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token || !user?.id) return;
    let activo = true;

    obtenerInformacionEstudiante(token, user.id).then((informacion) => {
      if (!activo) return;
      setPerfilAcademicoListo(Boolean(informacion));
      setVerificandoPerfil(false);
    });

    return () => {
      activo = false;
    };
  }, [token, user?.id]);

  if (loading || !token) {
    return <div className={dashboardStyles.loading}>Cargando…</div>;
  }

  return (
    <div className={dashboardStyles.page}>
      <header className={`glass-card ${dashboardStyles.topbar}`}>
        <div className={dashboardStyles.brand}>
          <span className={dashboardStyles.logo}>CT</span>
          Conectando Talento UCR
        </div>
      </header>

      <main className={dashboardStyles.content}>
        <section className={`glass-card ${dashboardStyles.panel}`}>
          <h1 className={dashboardStyles.welcomeTitle}>Información académica</h1>
          <p className={dashboardStyles.welcomeText}>
            Completa tu información académica y socioeconómica para que el resto de tu perfil
            pueda guardarse correctamente.
          </p>
        </section>

        <section className={`glass-card ${dashboardStyles.panel}`}>
          <InformacionAcademicaForm onGuardado={() => setPerfilAcademicoListo(true)} />
        </section>

        <section className={`glass-card ${dashboardStyles.panel}`}>
          <h1 className={dashboardStyles.welcomeTitle}>Proyecto de graduación</h1>
          <p className={dashboardStyles.welcomeText}>
            Completa la información de tu proyecto de graduación para que aparezca en tu perfil.
          </p>
        </section>

        <section className={`glass-card ${dashboardStyles.panel}`}>
          {verificandoPerfil ? (
            <p className={perfilStyles.cargando}>Cargando…</p>
          ) : perfilAcademicoListo ? (
            <ProyectoGraduacionForm />
          ) : (
            <p className={perfilStyles.aviso}>
              Primero completa y guarda tu información académica para poder registrar tu proyecto
              de graduación.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
