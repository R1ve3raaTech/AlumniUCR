'use client';

// Vista imprimible del currículum (RF-11) — exportar a PDF.
// Renderiza un CV profesional listo para imprimir. "Descargar PDF" usa el diálogo
// de impresión del navegador (Guardar como PDF): sin dependencias pesadas y con
// resultado vectorial nítido. El CSS de impresión oculta la barra de acciones.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerMiCurriculum, parseJsonArray } from '@/lib/curriculum';
import { obtenerPerfil } from '@/lib/auth';
import styles from './preview.module.css';

const fmtMes = (f: string) => (f ? new Date(f + 'T00:00:00').toLocaleDateString('es-CR', { month: 'short', year: 'numeric' }) : '');

export default function CurriculumPreviewPage() {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const [cv, setCv] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const [data, perfil] = await Promise.all([
          obtenerMiCurriculum(token),
          obtenerPerfil(token).catch(() => null),
        ]);
        if (!activo) return;
        setCv(data);
        setNombre(perfil?.data?.nombre || user?.email?.split('@')[0] || 'Estudiante');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token, user?.email]);

  const academica = cv?.seccion1_academica;
  const proyecto = cv?.seccion1_proyecto;
  const experiencias = cv?.seccion2_experiencias || [];
  const hab = cv?.seccion3_habilidades || {};
  const tecnicas = parseJsonArray(hab.tecnicas);
  const idiomas = parseJsonArray(hab.idiomas);
  const certificaciones = cv?.seccion4_certificaciones || [];

  return (
    <div className={styles.page}>
      {/* Barra de acciones (no se imprime) */}
      <div className={styles.toolbar}>
        <Link href="/mi-curriculum" className={styles.volver}>← Volver al editor</Link>
        <button className={styles.pdfBtn} onClick={() => window.print()}>Descargar PDF</button>
      </div>

      {cargando ? (
        <p className={styles.cargando}>Preparando tu currículum…</p>
      ) : (
        <article className={styles.cv}>
          {/* Encabezado */}
          <header className={styles.cvHead}>
            <h1 className={styles.cvNombre}>{nombre}</h1>
            <p className={styles.cvContacto}>
              {[user?.email, academica?.carne ? `Carné ${academica.carne}` : ''].filter(Boolean).join('  ·  ')}
            </p>
          </header>

          {/* Perfil académico */}
          {(academica || proyecto) && (
            <section className={styles.cvSeccion}>
              <h2 className={styles.cvTitulo}>Perfil académico</h2>
              <div className={styles.cvAcad}>
                {academica?.ano_ingreso && <span><strong>Ingreso:</strong> {academica.ano_ingreso}</span>}
                {academica?.promedio_ponderado != null && <span><strong>Promedio ponderado:</strong> {academica.promedio_ponderado}</span>}
              </div>
              {academica?.cursos_relevantes && <p className={styles.cvTexto}><strong>Cursos relevantes:</strong> {academica.cursos_relevantes}</p>}
              {proyecto?.titulo_proyecto && (
                <p className={styles.cvTexto}><strong>Proyecto de graduación:</strong> {proyecto.titulo_proyecto}
                  {proyecto.descripcion ? ` — ${proyecto.descripcion}` : ''}</p>
              )}
            </section>
          )}

          {/* Experiencia */}
          {experiencias.length > 0 && (
            <section className={styles.cvSeccion}>
              <h2 className={styles.cvTitulo}>Experiencia y proyectos</h2>
              {experiencias.map((e: any) => {
                const bullets = parseJsonArray(e.bullets);
                return (
                  <div key={e.id} className={styles.cvItem}>
                    <div className={styles.cvItemHead}>
                      <span className={styles.cvItemTitulo}>{e.titulo}{e.organizacion ? ` · ${e.organizacion}` : ''}</span>
                      <span className={styles.cvFechas}>{[fmtMes(e.fecha_inicio), fmtMes(e.fecha_fin) || 'Actual'].filter(Boolean).join(' – ')}</span>
                    </div>
                    {e.descripcion && <p className={styles.cvTexto}>{e.descripcion}</p>}
                    {bullets.length > 0 && <ul className={styles.cvBullets}>{bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}</ul>}
                  </div>
                );
              })}
            </section>
          )}

          {/* Habilidades */}
          {(tecnicas.length > 0 || hab.blandas || idiomas.length > 0) && (
            <section className={styles.cvSeccion}>
              <h2 className={styles.cvTitulo}>Habilidades e idiomas</h2>
              {tecnicas.length > 0 && (
                <p className={styles.cvTexto}><strong>Técnicas:</strong> {tecnicas.map((t: any) => `${t.nombre} (${t.nivel})`).join(', ')}</p>
              )}
              {hab.blandas && <p className={styles.cvTexto}><strong>Blandas:</strong> {hab.blandas}</p>}
              {idiomas.length > 0 && (
                <p className={styles.cvTexto}><strong>Idiomas:</strong> {idiomas.map((i: any) => `${i.idioma} (${i.nivel})`).join(', ')}</p>
              )}
            </section>
          )}

          {/* Certificaciones */}
          {certificaciones.length > 0 && (
            <section className={styles.cvSeccion}>
              <h2 className={styles.cvTitulo}>Certificaciones y logros</h2>
              {certificaciones.map((c: any) => (
                <div key={c.id} className={styles.cvItem}>
                  <div className={styles.cvItemHead}>
                    <span className={styles.cvItemTitulo}>{c.nombre}{c.institucion ? ` · ${c.institucion}` : ''}</span>
                    <span className={styles.cvFechas}>{c.fecha ? fmtMes(c.fecha) : ''}</span>
                  </div>
                </div>
              ))}
            </section>
          )}
        </article>
      )}
    </div>
  );
}
