'use client';

// Mis aplicaciones (RF-13) — vista del estudiante.
// Historial de aplicaciones con el estado de cada una y opción de retirar
// (solo mientras esté en estado 'enviada').

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StudentNav from '@/components/StudentNav';
import { obtenerMisAplicaciones, retirarAplicacion } from '@/lib/aplicaciones';
import styles from './mis-aplicaciones.module.css';

interface Puesto {
  id: number | string;
  titulo_puesto: string;
  tipo: string | null;
  modalidad: string | null;
  empresa: string | null;
  fecha_limite: string | null;
  estado: string | null;
}
interface Aplicacion {
  id: number | string;
  estado: string;
  mensaje_presentacion: string | null;
  created_at: string;
  puestos_empleo: Puesto | null;
}

const fmtFecha = (f: string | null) => (f ? new Date(f).toLocaleDateString('es-CR') : '—');
const cap = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const ESTADO_LABEL: Record<string, { label: string; clase: string }> = {
  enviada: { label: 'Enviada', clase: 'enviada' },
  en_revision: { label: 'En revisión', clase: 'revision' },
  seleccionado: { label: 'Seleccionado', clase: 'seleccionado' },
  descartado: { label: 'No seleccionado', clase: 'descartado' },
};

export default function MisAplicacionesPage() {
  const router = useRouter();
  const { token, loading: authLoading, signOut } = useAuth();
  const [lista, setLista] = useState<Aplicacion[]>([]);
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
        const apps = await obtenerMisAplicaciones(token);
        if (activo) setLista(apps);
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar tus aplicaciones.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  const ordenadas = useMemo(
    () => [...lista].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [lista],
  );

  function handleSignOut() { signOut(); router.replace('/login'); }

  async function retirar(a: Aplicacion) {
    setAccion(a.id);
    setError('');
    try {
      await retirarAplicacion(token as string, a.id);
      setLista((l) => l.filter((x) => x.id !== a.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo retirar la aplicación.');
    } finally {
      setAccion(null);
    }
  }

  return (
    <div className={styles.page}>
      <StudentNav onSignOut={handleSignOut} />

      <main className={styles.main}>
        <div className={styles.head}>
          <h1 className={styles.titulo}>Mis aplicaciones</h1>
          <Link href="/posiciones" className={styles.cta}>Explorar posiciones</Link>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {cargando ? (
          <p className={styles.vacio}>Cargando tus aplicaciones…</p>
        ) : ordenadas.length === 0 ? (
          <div className={styles.vacioBox}>
            <p>Todavía no has aplicado a ninguna posición.</p>
            <Link href="/posiciones" className={styles.cta}>Ver posiciones disponibles</Link>
          </div>
        ) : (
          <div className={styles.lista}>
            {ordenadas.map((a) => {
              const ev = ESTADO_LABEL[a.estado] || { label: cap(a.estado), clase: 'enviada' };
              const p = a.puestos_empleo;
              return (
                <article key={a.id} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardHead}>
                      <h3 className={styles.puesto}>{p?.titulo_puesto || 'Posición'}</h3>
                      <span className={`${styles.chip} ${styles[ev.clase]}`}>{ev.label}</span>
                    </div>
                    <p className={styles.meta}>
                      {[p?.empresa, cap(p?.tipo ?? null), cap(p?.modalidad ?? null)].filter((x) => x && x !== '—').join(' · ')}
                    </p>
                    <p className={styles.fecha}>Aplicaste el {fmtFecha(a.created_at)}</p>
                    {a.mensaje_presentacion && <p className={styles.mensaje}>“{a.mensaje_presentacion}”</p>}
                  </div>
                  {a.estado === 'enviada' && (
                    <button className={styles.btnNo} disabled={accion === a.id} onClick={() => retirar(a)}>Retirar</button>
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
