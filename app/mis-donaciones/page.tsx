'use client';

// Historial de donaciones del exalumno (RF-07). Lista las donaciones propias con
// su estado (pendiente/confirmada/rechazada), proyecto, monto y comprobante.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRequireRole } from '@/lib/useRequireRole';
import AlumniLogo from '@/components/AlumniLogo';
import { obtenerMisDonaciones, obtenerTiposPago, obtenerProyectos, obtenerUrlComprobante } from '@/lib/donaciones';
import styles from './mis-donaciones.module.css';

interface Donacion {
  id: string;
  id_tipo_pago: number | string;
  monto: number;
  id_proyecto: number | string | null;
  moneda: string;
  fecha_hora_transferencia: string;
  numero_referencia: string | null;
  comprobante: string | null;
  mensaje: string | null;
  estado: string;
  created_at: string;
}

const arr = (res: unknown) => (Array.isArray(res) ? res : (res as { data?: unknown[] })?.data ?? []);
const fmtMonto = (m: number, moneda: string) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: moneda || 'CRC' }).format(m || 0);
const fmtFecha = (f: string) => (f ? new Date(f).toLocaleDateString('es-CR') : '—');
const esPdf = (url: string) => url.toLowerCase().includes('.pdf');

export default function MisDonacionesPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { verificando, autorizado } = useRequireRole(['exalumno']);
  const [lista, setLista] = useState<Donacion[]>([]);
  const [metodos, setMetodos] = useState<Record<string, string>>({});
  const [proyectos, setProyectos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !user?.id || !autorizado) return;
    let activo = true;
    (async () => {
      try {
        const [don, tp, pr] = await Promise.all([
          obtenerMisDonaciones(token, user.id),
          obtenerTiposPago(token),
          obtenerProyectos(token),
        ]);
        if (!activo) return;
        setLista(arr(don) as Donacion[]);
        const mMet: Record<string, string> = {};
        arr(tp).forEach((t: { id: number | string; descripcion?: string }) => { mMet[String(t.id)] = t.descripcion || `Método ${t.id}`; });
        setMetodos(mMet);
        const mPro: Record<string, string> = {};
        arr(pr).forEach((p: { id: number | string; titulo_proyecto?: string }) => { mPro[String(p.id)] = p.titulo_proyecto || `Proyecto ${p.id}`; });
        setProyectos(mPro);
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar tus donaciones.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token, user?.id, autorizado]);

  // Abre el comprobante: rutas de Storage → signed URL; URLs antiguas tal cual.
  async function verComprobante(comprobante: string) {
    let url = comprobante;
    if (!/^https?:\/\//i.test(comprobante)) {
      try { url = (await obtenerUrlComprobante(token as string, comprobante)) || comprobante; } catch { /* usa la ruta */ }
    }
    window.open(url, '_blank', 'noopener');
  }

  const ordenadas = useMemo(
    () => [...lista].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [lista],
  );

  const totalConfirmado = useMemo(() => {
    const acc = { CRC: 0, USD: 0 };
    lista.filter((d) => d.estado === 'confirmada').forEach((d) => {
      if (d.moneda === 'USD') acc.USD += Number(d.monto) || 0; else acc.CRC += Number(d.monto) || 0;
    });
    return acc;
  }, [lista]);

  if (verificando || !autorizado) {
    return <div className="flex min-h-screen items-center justify-center bg-ucr-surface font-brand-body text-ucr-on-surface">Cargando…</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerLinks}>
          <Link href="/donaciones" className={styles.back}>Nueva donación</Link>
          <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Mis donaciones</h1>
        <p className={styles.heroText}>
          Historial de tus aportes y su estado de revisión. Las confirmadas ya fueron
          validadas por la administración.
        </p>
        {!cargando && lista.length > 0 && (
          <div className={styles.totales}>
            <span className={styles.totalChip}>Confirmado CRC: <strong>{fmtMonto(totalConfirmado.CRC, 'CRC')}</strong></span>
            <span className={styles.totalChip}>Confirmado USD: <strong>{fmtMonto(totalConfirmado.USD, 'USD')}</strong></span>
          </div>
        )}
      </section>

      <main className={styles.main}>
        {error && <p className={styles.error}>{error}</p>}
        {cargando ? (
          <p className={styles.vacio}>Cargando tus donaciones…</p>
        ) : ordenadas.length === 0 ? (
          <div className={styles.vacioBox}>
            <p>Todavía no has registrado donaciones.</p>
            <Link href="/donaciones" className={styles.btnPrimary}>Registrar mi primera donación</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {ordenadas.map((d) => (
              <article key={d.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.monto}>{fmtMonto(d.monto, d.moneda)}</span>
                  <span className={`${styles.chip} ${styles[d.estado] || ''}`}>{d.estado}</span>
                </div>
                <p className={styles.proyecto}>{d.id_proyecto ? (proyectos[String(d.id_proyecto)] ?? 'Proyecto') : 'Fondo general'}</p>
                <dl className={styles.detalle}>
                  <div><dt>Fecha</dt><dd>{fmtFecha(d.fecha_hora_transferencia)}</dd></div>
                  <div><dt>Método</dt><dd>{metodos[String(d.id_tipo_pago)] ?? '—'}</dd></div>
                  <div><dt>Referencia</dt><dd>{d.numero_referencia || '—'}</dd></div>
                </dl>
                {d.mensaje && <p className={styles.mensaje}>“{d.mensaje}”</p>}
                {d.comprobante && (
                  <button type="button" onClick={() => verComprobante(d.comprobante!)} className={styles.comprobante}>
                    {esPdf(d.comprobante) ? 'Ver comprobante (PDF) ↗' : 'Ver comprobante ↗'}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
