'use client';

// Panel admin — Gestión de donaciones (RF-08.2).
// Cola por antigüedad, alerta roja si lleva >24h pendiente, visor de comprobante
// (imagen/PDF), confirmar/rechazar (motivo obligatorio al rechazar) y totales
// CRC/USD por periodo. Mismo molde que app/estudiantes.
//
// Pendiente de BE (pedido a Adri): el email automático al confirmar/rechazar, la
// auditoría persistente (confirmado_por, fecha) y el guardado del motivo. El FE ya
// captura y envía el motivo para que enchufe solo cuando el BE lo acepte.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import {
  obtenerDonaciones,
  actualizarEstadoDonacion,
  obtenerTiposPago,
  obtenerUsuarios,
  obtenerProyectos,
} from '@/lib/donaciones';
import styles from './donaciones.module.css';

interface Donacion {
  id: string;
  id_usuario_exalumno: string;
  id_tipo_pago: number | string;
  monto: number;
  id_proyecto: number | string | null;
  moneda: 'CRC' | 'USD';
  fecha_hora_transferencia: string;
  numero_referencia: string | null;
  comprobante: string | null;
  mensaje: string | null;
  estado: 'pendiente' | 'confirmada' | 'rechazada';
  created_at: string;
}

type Filtro = 'pendiente' | 'confirmada' | 'rechazada' | 'todas';
const FILTROS: { clave: Filtro; label: string }[] = [
  { clave: 'pendiente', label: 'Pendientes' },
  { clave: 'confirmada', label: 'Confirmadas' },
  { clave: 'rechazada', label: 'Rechazadas' },
  { clave: 'todas', label: 'Todas' },
];

const fmtMonto = (m: number, moneda: string) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: moneda || 'CRC' }).format(m || 0);
const fmtFecha = (f: string) => (f ? new Date(f).toLocaleDateString('es-CR') : '—');
const horasDesde = (f: string) => (f ? (Date.now() - new Date(f).getTime()) / 36e5 : 0);
const antiguedadTxt = (h: number) => {
  if (h < 1) return 'hace minutos';
  if (h < 24) return `hace ${Math.floor(h)} h`;
  return `hace ${Math.floor(h / 24)} d`;
};
const esPdf = (url: string) => url.toLowerCase().includes('.pdf');

export default function AdminDonacionesPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Donacion[]>([]);
  const [metodos, setMetodos] = useState<Record<string, string>>({});
  const [donantes, setDonantes] = useState<Record<string, string>>({});
  const [proyectos, setProyectos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('pendiente');
  const [actualizando, setActualizando] = useState<string | null>(null);

  // Rango de fechas para los totales (vacío = todo el histórico).
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Modales
  const [verComprobante, setVerComprobante] = useState<string | null>(null);
  const [rechazando, setRechazando] = useState<Donacion | null>(null);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const [don, tp, us, pr] = await Promise.all([
          obtenerDonaciones(token),
          obtenerTiposPago(token),
          obtenerUsuarios(token),
          obtenerProyectos(token),
        ]);
        if (!activo) return;
        setLista(don?.data ?? []);
        const mMet: Record<string, string> = {};
        (tp?.data ?? []).forEach((t: { id: string | number; descripcion: string }) => {
          mMet[String(t.id)] = t.descripcion;
        });
        setMetodos(mMet);
        const mDon: Record<string, string> = {};
        (us?.data ?? []).forEach((u: { id: string; nombre?: string; correo_electronico?: string }) => {
          mDon[u.id] = u.nombre || u.correo_electronico || u.id.slice(0, 8);
        });
        setDonantes(mDon);
        const mPro: Record<string, string> = {};
        (pr?.data ?? []).forEach((p: { id: number | string; titulo_proyecto?: string }) => {
          mPro[String(p.id)] = p.titulo_proyecto || `Proyecto ${p.id}`;
        });
        setProyectos(mPro);
      } catch {
        if (activo) setLista([]);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  // Cola por antigüedad (más viejas primero) + filtro por estado.
  const visibles = useMemo(() => {
    const arr = filtro === 'todas' ? lista : lista.filter((d) => d.estado === filtro);
    return [...arr].sort(
      (a, b) => new Date(a.fecha_hora_transferencia).getTime() - new Date(b.fecha_hora_transferencia).getTime(),
    );
  }, [lista, filtro]);

  // Totales CRC/USD (confirmadas) dentro del rango de fechas seleccionado.
  const totales = useMemo(() => {
    const d0 = desde ? new Date(desde).getTime() : -Infinity;
    const d1 = hasta ? new Date(hasta).getTime() + 86399999 : Infinity;
    const acc = { CRC: 0, USD: 0, count: 0 };
    lista
      .filter((d) => d.estado === 'confirmada')
      .filter((d) => {
        const t = new Date(d.fecha_hora_transferencia).getTime();
        return t >= d0 && t <= d1;
      })
      .forEach((d) => {
        if (d.moneda === 'USD') acc.USD += Number(d.monto) || 0;
        else acc.CRC += Number(d.monto) || 0;
        acc.count += 1;
      });
    return acc;
  }, [lista, desde, hasta]);

  async function confirmar(d: Donacion) {
    setActualizando(d.id);
    try {
      await actualizarEstadoDonacion(token as string, d.id, 'confirmada');
      setLista((l) => l.map((x) => (x.id === d.id ? { ...x, estado: 'confirmada' } : x)));
    } finally {
      setActualizando(null);
    }
  }

  async function confirmarRechazo() {
    if (!rechazando || !motivo.trim()) return;
    const d = rechazando;
    setActualizando(d.id);
    try {
      await actualizarEstadoDonacion(token as string, d.id, 'rechazada', motivo.trim());
      setLista((l) => l.map((x) => (x.id === d.id ? { ...x, estado: 'rechazada' } : x)));
      setRechazando(null);
      setMotivo('');
    } finally {
      setActualizando(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerLinks}>
          <Link href="/admin/reportes" className={styles.back}>Dashboard de impacto</Link>
          <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Gestión de Donaciones</h1>
        <p className={styles.heroText}>
          Cola de donaciones ordenada por antigüedad. Revisá el comprobante y confirmá o
          rechazá cada una. Las que llevan más de 24 horas pendientes se marcan en rojo.
        </p>

        {/* Totales por periodo (RF-08.2: historial muestra totales CRC y USD) */}
        <div className={styles.totalesBar}>
          <div className={styles.rango}>
            <label>Desde <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
            <label>Hasta <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
          </div>
          <div className={styles.totales}>
            <span className={styles.totalChip}>Confirmado CRC: <strong>{fmtMonto(totales.CRC, 'CRC')}</strong></span>
            <span className={styles.totalChip}>Confirmado USD: <strong>{fmtMonto(totales.USD, 'USD')}</strong></span>
            <span className={styles.totalChipMuted}>{totales.count} donación(es) en el periodo</span>
          </div>
        </div>

        <div className={styles.tabs}>
          {FILTROS.map((f) => (
            <button
              key={f.clave}
              className={`${styles.tab} ${filtro === f.clave ? styles.tabOn : ''}`}
              onClick={() => setFiltro(f.clave)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <main className={styles.main}>
        {cargando ? (
          <p className={styles.vacio}>Cargando donaciones…</p>
        ) : visibles.length === 0 ? (
          <p className={styles.vacio}>No hay donaciones en este estado.</p>
        ) : (
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Fecha</th><th>Donante</th><th>Proyecto</th><th>Monto</th><th>Método</th>
                  <th>Referencia</th><th>Comprobante</th><th>Antigüedad</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((d) => {
                  const h = horasDesde(d.fecha_hora_transferencia);
                  const vencida = d.estado === 'pendiente' && h > 24;
                  return (
                    <tr key={d.id} className={vencida ? styles.filaVencida : ''}>
                      <td>{fmtFecha(d.fecha_hora_transferencia)}</td>
                      <td title={d.id_usuario_exalumno}>{donantes[d.id_usuario_exalumno] ?? '—'}</td>
                      <td title={String(d.id_proyecto ?? '')}>{proyectos[String(d.id_proyecto)] ?? 'Fondo general'}</td>
                      <td className={styles.monto}>{fmtMonto(d.monto, d.moneda)}</td>
                      <td>{metodos[String(d.id_tipo_pago)] ?? d.id_tipo_pago}</td>
                      <td>{d.numero_referencia || '—'}</td>
                      <td>
                        {d.comprobante
                          ? <button className={styles.link} onClick={() => setVerComprobante(d.comprobante!)}>Ver</button>
                          : '—'}
                      </td>
                      <td>
                        <span className={vencida ? styles.vencidaTxt : ''}>
                          {antiguedadTxt(h)}{vencida ? ' ⚠' : ''}
                        </span>
                      </td>
                      <td><span className={`${styles.chip} ${styles[d.estado]}`}>{d.estado}</span></td>
                      <td>
                        {d.estado === 'pendiente' ? (
                          <div className={styles.acciones}>
                            <button className={styles.btnOk} disabled={actualizando === d.id} onClick={() => confirmar(d)}>
                              Confirmar
                            </button>
                            <button className={styles.btnNo} disabled={actualizando === d.id} onClick={() => { setRechazando(d); setMotivo(''); }}>
                              Rechazar
                            </button>
                          </div>
                        ) : <span className={styles.listo}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Visor de comprobante (imagen o PDF) */}
      {verComprobante && (
        <div className={styles.modalBg} onClick={() => setVerComprobante(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span>Comprobante</span>
              <button className={styles.cerrar} onClick={() => setVerComprobante(null)}>✕</button>
            </div>
            {esPdf(verComprobante) ? (
              <iframe src={verComprobante} className={styles.visor} title="Comprobante PDF" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={verComprobante} alt="Comprobante" className={styles.visorImg} />
            )}
            <a href={verComprobante} target="_blank" rel="noreferrer" className={styles.abrirNueva}>
              Abrir en pestaña nueva ↗
            </a>
          </div>
        </div>
      )}

      {/* Modal de rechazo con motivo obligatorio */}
      {rechazando && (
        <div className={styles.modalBg} onClick={() => setRechazando(null)}>
          <div className={styles.modalSm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span>Rechazar donación</span>
              <button className={styles.cerrar} onClick={() => setRechazando(null)}>✕</button>
            </div>
            <p className={styles.modalText}>
              Indicá el motivo del rechazo. Se le notificará al donante (envío de correo pendiente del backend).
            </p>
            <textarea
              className={styles.textarea}
              placeholder="Motivo del rechazo (obligatorio)…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
            />
            <div className={styles.modalAcciones}>
              <button className={styles.btnGhost} onClick={() => setRechazando(null)}>Cancelar</button>
              <button className={styles.btnNo} disabled={!motivo.trim() || actualizando === rechazando.id} onClick={confirmarRechazo}>
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
