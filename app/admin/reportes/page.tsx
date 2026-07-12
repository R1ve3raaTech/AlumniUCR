'use client';

// Panel admin — Dashboard de Impacto (RF-08.3).
// KPIs y gráficos (barras CSS, sin librerías) con filtro por rango de fechas,
// exportación a PDF (impresión) y auto-refresh (≤5 min). Calculado a partir de los
// endpoints existentes de donaciones; las métricas más ricas (por carrera/sede,
// donantes nuevos vs recurrentes) dependen del endpoint de métricas del BE (Adri).

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  obtenerDonaciones,
  obtenerTiposPago,
  obtenerProyectos,
} from '@/lib/donaciones/donaciones';
import styles from './reportes.module.css';

interface Donacion {
  id: string;
  id_usuario_exalumno: string;
  id_tipo_pago: number | string;
  monto: number;
  id_proyecto: number | string | null;
  moneda: 'CRC' | 'USD';
  fecha_hora_transferencia: string;
  estado: 'pendiente' | 'confirmada' | 'rechazada';
}

const REFRESCO_MS = 60_000; // auto-refresh cada 60s (≤ 5 min, RF-08.3)
const fmt = (m: number, moneda: string) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: moneda, maximumFractionDigits: 0 }).format(m || 0);

export default function AdminReportesPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Donacion[]>([]);
  const [metodos, setMetodos] = useState<Record<string, string>>({});
  const [proyectos, setProyectos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [actualizado, setActualizado] = useState<string>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      const [don, tp, pr] = await Promise.all([
        obtenerDonaciones(token),
        obtenerTiposPago(token),
        obtenerProyectos(token),
      ]);
      setLista(don?.data ?? []);
      const mMet: Record<string, string> = {};
      (tp?.data ?? []).forEach((t: { id: string | number; descripcion: string }) => { mMet[String(t.id)] = t.descripcion; });
      setMetodos(mMet);
      const mPro: Record<string, string> = {};
      (pr?.data ?? []).forEach((p: { id: number | string; titulo_proyecto?: string }) => { mPro[String(p.id)] = p.titulo_proyecto || `Proyecto ${p.id}`; });
      setProyectos(mPro);
      setActualizado(new Date().toLocaleTimeString('es-CR'));
    } catch {
      /* se mantiene la última data buena */
    } finally {
      setCargando(false);
    }
  }, [token]);

  // Carga inicial + auto-refresh.
  useEffect(() => {
    cargar();
    const id = setInterval(cargar, REFRESCO_MS);
    return () => clearInterval(id);
  }, [cargar]);

  // Donaciones dentro del rango de fechas seleccionado.
  const enRango = useMemo(() => {
    const d0 = desde ? new Date(desde).getTime() : -Infinity;
    const d1 = hasta ? new Date(hasta).getTime() + 86399999 : Infinity;
    return lista.filter((d) => {
      const t = new Date(d.fecha_hora_transferencia).getTime();
      return t >= d0 && t <= d1;
    });
  }, [lista, desde, hasta]);

  const m = useMemo(() => {
    const conf = enRango.filter((d) => d.estado === 'confirmada');
    const totalCRC = conf.filter((d) => d.moneda === 'CRC').reduce((s, d) => s + Number(d.monto || 0), 0);
    const totalUSD = conf.filter((d) => d.moneda === 'USD').reduce((s, d) => s + Number(d.monto || 0), 0);
    const porEstado = { pendiente: 0, confirmada: 0, rechazada: 0 } as Record<string, number>;
    enRango.forEach((d) => { porEstado[d.estado] = (porEstado[d.estado] || 0) + 1; });
    const porMetodo: Record<string, number> = {};
    enRango.forEach((d) => { const k = metodos[String(d.id_tipo_pago)] || `Método ${d.id_tipo_pago}`; porMetodo[k] = (porMetodo[k] || 0) + 1; });
    // Monto confirmado por proyecto (CRC + USD se cuentan por separado; aquí sumamos CRC).
    const porProyecto: Record<string, number> = {};
    conf.forEach((d) => { const k = proyectos[String(d.id_proyecto)] || 'Fondo general'; porProyecto[k] = (porProyecto[k] || 0) + Number(d.monto || 0); });
    const donantes = new Set(conf.map((d) => d.id_usuario_exalumno)).size;
    const proyectosApoyados = new Set(conf.map((d) => String(d.id_proyecto))).size;
    return { totalCRC, totalUSD, porEstado, porMetodo, porProyecto, donantes, proyectosApoyados, confCount: conf.length };
  }, [enRango, metodos, proyectos]);

  const Barras = ({ datos, prefijo }: { datos: Record<string, number>; prefijo?: string }) => {
    const entradas = Object.entries(datos).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...entradas.map(([, v]) => v));
    if (entradas.length === 0) return <p className={styles.sinDatos}>Sin datos en el periodo.</p>;
    return (
      <div className={styles.barras}>
        {entradas.map(([k, v]) => (
          <div key={k} className={styles.barraRow}>
            <span className={styles.barraLabel} title={k}>{k}</span>
            <span className={styles.barraTrack}>
              <span className={styles.barraFill} style={{ width: `${(v / max) * 100}%` }} />
            </span>
            <span className={styles.barraValor}>{prefijo === '₡' ? fmt(v, 'CRC') : v}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.pageContent}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <h1 className={styles.heroTitle}>Dashboard de Impacto</h1>
            <p className={styles.heroText}>Métricas de donaciones de la comunidad Alumni UCR.</p>
          </div>
          <div className={`${styles.controles} ${styles.noPrint}`}>
            <label>Desde <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
            <label>Hasta <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
            <button className={styles.btnGhost} onClick={cargar}>Actualizar</button>
            <button className={styles.btnPdf} onClick={() => window.print()}>Exportar PDF</button>
          </div>
        </div>
        <span className={styles.actualizado}>
          {cargando ? 'Cargando…' : `Actualizado: ${actualizado} · auto-refresh cada 1 min`}
        </span>
      </section>

      <main className={styles.main}>
        {/* KPIs */}
        <div className={styles.kpis}>
          <article className={styles.kpi}><span className={styles.kpiVal}>{fmt(m.totalCRC, 'CRC')}</span><span className={styles.kpiLab}>Total donado (CRC)</span></article>
          <article className={styles.kpi}><span className={styles.kpiVal}>{fmt(m.totalUSD, 'USD')}</span><span className={styles.kpiLab}>Total donado (USD)</span></article>
          <article className={styles.kpi}><span className={styles.kpiVal}>{m.proyectosApoyados}</span><span className={styles.kpiLab}>Proyectos apoyados</span></article>
          <article className={styles.kpi}><span className={styles.kpiVal}>{m.donantes}</span><span className={styles.kpiLab}>Donantes</span></article>
          <article className={styles.kpi}><span className={styles.kpiVal}>{m.confCount}</span><span className={styles.kpiLab}>Donaciones confirmadas</span></article>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Donaciones por estado</h2>
            <Barras datos={m.porEstado} />
          </section>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Donaciones por método de pago</h2>
            <Barras datos={m.porMetodo} />
          </section>
          <section className={`${styles.card} ${styles.cardWide}`}>
            <h2 className={styles.cardTitle}>Monto confirmado por proyecto (CRC)</h2>
            <Barras datos={m.porProyecto} prefijo="₡" />
          </section>
        </div>

        <p className={styles.notaBE}>
          Nota: las métricas por carrera/sede y donantes nuevos vs. recurrentes se mostrarán
          cuando el backend exponga el endpoint de métricas agregadas (RF-08.3).
        </p>
      </main>
    </div>
  );
}
