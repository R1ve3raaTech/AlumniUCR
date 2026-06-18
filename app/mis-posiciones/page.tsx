'use client';

// Mis posiciones publicadas (RF-10) — vista del exalumno.
// Lista las posiciones propias con su estado y permite pausar/reactivar/cerrar.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import { obtenerMisPosiciones, actualizarPosicion } from '@/lib/posiciones';
import styles from './mis-posiciones.module.css';

interface Posicion {
  id: number | string;
  titulo_puesto: string;
  tipo: string | null;
  modalidad: string | null;
  empresa: string | null;
  fecha_limite: string | null;
  estado: string | null;
  pausada: boolean;
  eliminada: boolean;
  created_at: string;
}

const fmtFecha = (f: string | null) => (f ? new Date(f).toLocaleDateString('es-CR') : '—');
const cap = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

// Estado visible derivado: cerrada > pausada > activa.
function estadoVisible(p: Posicion): { label: string; clase: string } {
  if (p.estado === 'cerrada') return { label: 'Cerrada', clase: 'cerrada' };
  if (p.pausada) return { label: 'Pausada', clase: 'pausada' };
  return { label: 'Activa', clase: 'activa' };
}

export default function MisPosicionesPage() {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Posicion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [accion, setAccion] = useState<string | number | null>(null);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token || !user?.id) return;
    let activo = true;
    (async () => {
      try {
        const ps = await obtenerMisPosiciones(token, user.id);
        if (activo) setLista(ps.filter((p: Posicion) => !p.eliminada));
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar tus posiciones.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token, user?.id]);

  const ordenadas = useMemo(
    () => [...lista].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [lista],
  );

  async function aplicar(p: Posicion, cambios: Partial<Posicion>) {
    setAccion(p.id);
    setError('');
    try {
      await actualizarPosicion(token as string, p.id, cambios);
      setLista((l) => l.map((x) => (x.id === p.id ? { ...x, ...cambios } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar la posición.');
    } finally {
      setAccion(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerLinks}>
          <Link href="/posiciones/nueva" className={styles.back}>Publicar posición</Link>
          <Link href="/posiciones" className={styles.back}>Directorio</Link>
          <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Mis posiciones</h1>
        <p className={styles.heroText}>
          Las posiciones que has publicado. Podés pausarlas, reactivarlas o cerrarlas.
          Las posiciones vencidas se cierran solas.
        </p>
      </section>

      <main className={styles.main}>
        {error && <p className={styles.error}>{error}</p>}
        {cargando ? (
          <p className={styles.vacio}>Cargando tus posiciones…</p>
        ) : ordenadas.length === 0 ? (
          <div className={styles.vacioBox}>
            <p>Todavía no has publicado posiciones.</p>
            <Link href="/posiciones/nueva" className={styles.btnPrimary}>Publicar mi primera posición</Link>
          </div>
        ) : (
          <div className={styles.lista}>
            {ordenadas.map((p) => {
              const ev = estadoVisible(p);
              const enProceso = accion === p.id;
              const cerrada = p.estado === 'cerrada';
              return (
                <article key={p.id} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardHead}>
                      <h3 className={styles.titulo}>{p.titulo_puesto}</h3>
                      <span className={`${styles.chip} ${styles[ev.clase]}`}>{ev.label}</span>
                    </div>
                    <p className={styles.meta}>
                      {[p.empresa, cap(p.tipo), cap(p.modalidad)].filter((x) => x && x !== '—').join(' · ')}
                    </p>
                    <p className={styles.fecha}>Fecha límite: <strong>{fmtFecha(p.fecha_limite)}</strong></p>
                  </div>
                  <div className={styles.acciones}>
                    {!cerrada && !p.pausada && (
                      <button className={styles.btnWarn} disabled={enProceso} onClick={() => aplicar(p, { pausada: true })}>Pausar</button>
                    )}
                    {!cerrada && p.pausada && (
                      <button className={styles.btnOk} disabled={enProceso} onClick={() => aplicar(p, { pausada: false })}>Reactivar</button>
                    )}
                    {!cerrada && (
                      <button className={styles.btnNo} disabled={enProceso} onClick={() => aplicar(p, { estado: 'cerrada' })}>Cerrar</button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
