'use client';

// Aplicantes de una posición (RF-13) — vista del exalumno dueño.
// Lista los estudiantes que aplicaron, con su mensaje y score de compatibilidad,
// y permite marcar en revisión, descartar o seleccionar al candidato (el BE
// notifica por correo a todos los aplicantes al seleccionar).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/common/AlumniLogo';
import { obtenerPosicion } from '@/lib/matching/posiciones';
import { obtenerAplicantesPorPosicion, actualizarEstadoAplicante, seleccionarCandidato } from '@/lib/matching/aplicaciones';
import styles from './aplicantes.module.css';

interface Estudiante { id: string; nombre: string | null; correo_electronico: string | null }
interface Aplicante {
  id: number | string;
  estado: string;
  mensaje_presentacion: string | null;
  created_at: string;
  usuarios: Estudiante | null;
  score_match?: number | null;
}

const fmtFecha = (f: string) => (f ? new Date(f).toLocaleDateString('es-CR') : '—');
const ini = (n: string | null) => (n || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
const ESTADO: Record<string, { label: string; clase: string }> = {
  enviada: { label: 'Enviada', clase: 'enviada' },
  en_revision: { label: 'En revisión', clase: 'revision' },
  seleccionado: { label: 'Seleccionado', clase: 'seleccionado' },
  descartado: { label: 'Descartado', clase: 'descartado' },
};

export default function AplicantesPage() {
  const router = useRouter();
  const params = useParams();
  const idPosicion = String(params.id);
  const { token, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Aplicante[]>([]);
  const [tituloPos, setTituloPos] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [accion, setAccion] = useState<string | number | null>(null);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const [aps, pos] = await Promise.all([
          obtenerAplicantesPorPosicion(token, idPosicion),
          obtenerPosicion(token, idPosicion).catch(() => null),
        ]);
        if (!activo) return;
        setLista(aps);
        setTituloPos(pos?.titulo_puesto || '');
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar los aplicantes.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token, idPosicion]);

  async function cambiarEstado(a: Aplicante, estado: string) {
    setAccion(a.id);
    setError('');
    try {
      await actualizarEstadoAplicante(token as string, a.id, estado);
      setLista((l) => l.map((x) => (x.id === a.id ? { ...x, estado } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el aplicante.');
    } finally {
      setAccion(null);
    }
  }

  async function seleccionar(a: Aplicante) {
    setAccion(a.id);
    setError('');
    try {
      await seleccionarCandidato(token as string, a.id);
      // El seleccionado queda 'seleccionado'; el resto, 'descartado'.
      setLista((l) => l.map((x) => ({ ...x, estado: x.id === a.id ? 'seleccionado' : (x.estado === 'seleccionado' ? 'descartado' : x.estado) })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo seleccionar al candidato.');
    } finally {
      setAccion(null);
    }
  }

  const haySeleccionado = lista.some((a) => a.estado === 'seleccionado');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerLinks}>
          <Link href="/mis-posiciones" className={styles.back}>← Mis posiciones</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Aplicantes</h1>
        <p className={styles.heroText}>{tituloPos ? `Posición: ${tituloPos}` : 'Estudiantes que aplicaron a esta posición.'}</p>
      </section>

      <main className={styles.main}>
        {error && <p className={styles.error}>{error}</p>}
        {cargando ? (
          <p className={styles.vacio}>Cargando aplicantes…</p>
        ) : lista.length === 0 ? (
          <p className={styles.vacio}>Todavía no hay aplicantes para esta posición.</p>
        ) : (
          <div className={styles.lista}>
            {lista.map((a) => {
              const ev = ESTADO[a.estado] || { label: a.estado, clase: 'enviada' };
              const enProceso = accion === a.id;
              const cerrado = a.estado === 'seleccionado' || a.estado === 'descartado';
              return (
                <article key={a.id} className={styles.card}>
                  <div className={styles.persona}>
                    <span className={styles.avatar}>{ini(a.usuarios?.nombre ?? null)}</span>
                    <div>
                      <h3 className={styles.nombre}>{a.usuarios?.nombre || 'Estudiante'}</h3>
                      <p className={styles.correo}>{a.usuarios?.correo_electronico || '—'}</p>
                      <p className={styles.fecha}>Aplicó el {fmtFecha(a.created_at)}</p>
                    </div>
                    <div className={styles.estadoCol}>
                      {typeof a.score_match === 'number' && <span className={styles.score}>{a.score_match}<small>/100</small></span>}
                      <span className={`${styles.chip} ${styles[ev.clase]}`}>{ev.label}</span>
                    </div>
                  </div>

                  {a.mensaje_presentacion && <p className={styles.mensaje}>“{a.mensaje_presentacion}”</p>}

                  {!cerrado && (
                    <div className={styles.acciones}>
                      {a.estado !== 'en_revision' && (
                        <button className={styles.btnGhost} disabled={enProceso} onClick={() => cambiarEstado(a, 'en_revision')}>Marcar en revisión</button>
                      )}
                      <button className={styles.btnNo} disabled={enProceso} onClick={() => cambiarEstado(a, 'descartado')}>Descartar</button>
                      <button className={styles.btnOk} disabled={enProceso || haySeleccionado} onClick={() => seleccionar(a)}>Seleccionar</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
