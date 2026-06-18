'use client';

// Panel admin — Gestión de Matches (RF-08.1).
// Tabla de matches mentor↔estudiante con columnas, filtros (estado, rango de
// fechas, búsqueda), alerta de seguimiento (>6 meses activos), edición de notas
// del admin y exportación a CSV.
//
// Fuente de datos (BE ya listo):
//   GET /api/admin/matches  → incluye el flag `alerta_seguimiento`.
//   PUT /api/matches-mentoria/:id  → actualiza estado y/o notas_admin.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import { obtenerMatchesAdmin, actualizarMatchAdmin } from '@/lib/adminMatches';
import styles from './matches.module.css';

interface Persona { id: string; nombre: string | null; correo_electronico?: string | null }
interface Match {
  id: string;
  score_match: number | null;
  estado: string;
  iniciado_por: string | null;
  resultado: string | null;
  notas_admin: string | null;
  created_at: string;
  updated_at: string;
  exalumno: Persona | null;
  estudiante: Persona | null;
  alerta_seguimiento: boolean;
}

type FiltroEstado = 'todos' | 'sugerido' | 'contactado' | 'activo' | 'cerrado';
const FILTROS_ESTADO: { clave: FiltroEstado; label: string }[] = [
  { clave: 'todos', label: 'Todos' },
  { clave: 'sugerido', label: 'Sugeridos' },
  { clave: 'contactado', label: 'Contactados' },
  { clave: 'activo', label: 'Activos' },
  { clave: 'cerrado', label: 'Cerrados' },
];
const ESTADOS_EDITABLES = ['sugerido', 'contactado', 'activo', 'cerrado'];

const fmtFecha = (f?: string) => (f ? new Date(f).toLocaleDateString('es-CR') : '—');
const nom = (p: Persona | null) => p?.nombre || '—';

export default function AdminMatchesPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Match[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [editando, setEditando] = useState<Match | null>(null);
  const [notaDraft, setNotaDraft] = useState('');
  const [estadoDraft, setEstadoDraft] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const ms = await obtenerMatchesAdmin(token);
        if (activo) setLista(ms);
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar los matches.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const d0 = desde ? new Date(desde).getTime() : -Infinity;
    const d1 = hasta ? new Date(hasta).getTime() + 86399999 : Infinity;
    return lista.filter((m) => {
      if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false;
      const t = new Date(m.created_at).getTime();
      if (t < d0 || t > d1) return false;
      if (q && ![nom(m.estudiante), nom(m.exalumno)].join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [lista, filtroEstado, desde, hasta, busqueda]);

  const alertas = useMemo(() => lista.filter((m) => m.alerta_seguimiento).length, [lista]);

  function abrirEdicion(m: Match) {
    setEditando(m);
    setNotaDraft(m.notas_admin || '');
    setEstadoDraft(m.estado);
  }

  async function guardarEdicion() {
    if (!editando) return;
    setGuardando(true);
    setError('');
    try {
      const datos: { notas_admin: string; estado?: string } = { notas_admin: notaDraft.trim() };
      if (estadoDraft && estadoDraft !== editando.estado) datos.estado = estadoDraft;
      await actualizarMatchAdmin(token as string, editando.id, datos);
      setLista((l) => l.map((x) =>
        x.id === editando.id ? { ...x, notas_admin: datos.notas_admin, estado: datos.estado ?? x.estado } : x));
      setEditando(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el match.');
    } finally {
      setGuardando(false);
    }
  }

  function exportarCSV() {
    const cols = ['Estudiante', 'Exalumno', 'Score', 'Estado', 'Creado', 'Última actividad', 'Alerta 6m', 'Notas'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const filas = visibles.map((m) => [
      nom(m.estudiante), nom(m.exalumno), m.score_match ?? '', m.estado,
      fmtFecha(m.created_at), fmtFecha(m.updated_at), m.alerta_seguimiento ? 'Sí' : 'No', m.notas_admin || '',
    ].map(esc).join(','));
    const csv = [cols.map(esc).join(','), ...filas].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matches-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerLinks}>
          <Link href="/admin/usuarios" className={styles.back}>Usuarios</Link>
          <Link href="/admin/donaciones" className={styles.back}>Donaciones</Link>
          <Link href="/admin/reportes" className={styles.back}>Impacto</Link>
          <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Gestión de Matches</h1>
        <p className={styles.heroText}>
          Coincidencias entre estudiantes y mentores. Revisá su estado, agregá notas de
          seguimiento y exportá la lista. Los matches activos por más de 6 meses se marcan
          para dar seguimiento.
        </p>

        <div className={styles.resumen}>
          <span className={styles.resChip}>Total: <strong>{lista.length}</strong></span>
          <span className={styles.resChip}>Activos: <strong>{lista.filter((m) => m.estado === 'activo').length}</strong></span>
          {alertas > 0 && <span className={styles.resChipAlerta}>⚠ {alertas} con seguimiento &gt; 6 meses</span>}
        </div>

        <div className={styles.controles}>
          <input
            className={styles.search}
            type="text"
            placeholder="Buscar por estudiante o mentor…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <label className={styles.fecha}>Desde <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
          <label className={styles.fecha}>Hasta <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
          <button type="button" className={styles.btnCsv} onClick={exportarCSV} disabled={visibles.length === 0}>
            Exportar CSV
          </button>
        </div>

        <div className={styles.tabs}>
          {FILTROS_ESTADO.map((f) => (
            <button
              key={f.clave}
              className={`${styles.tab} ${filtroEstado === f.clave ? styles.tabOn : ''}`}
              onClick={() => setFiltroEstado(f.clave)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <main className={styles.main}>
        {error && <p className={styles.error}>{error}</p>}
        {cargando ? (
          <p className={styles.vacio}>Cargando matches…</p>
        ) : visibles.length === 0 ? (
          <p className={styles.vacio}>No hay matches que coincidan con los filtros.</p>
        ) : (
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Estudiante</th><th>Mentor (exalumno)</th><th>Score</th><th>Estado</th>
                  <th>Creado</th><th>Última actividad</th><th>Notas</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((m) => (
                  <tr key={m.id} className={m.alerta_seguimiento ? styles.filaAlerta : ''}>
                    <td>{nom(m.estudiante)}</td>
                    <td>{nom(m.exalumno)}</td>
                    <td className={styles.score}>{m.score_match ?? '—'}</td>
                    <td>
                      <span className={`${styles.chip} ${styles[m.estado] || ''}`}>{m.estado}</span>
                      {m.alerta_seguimiento && <span className={styles.alertaBadge} title="Activo > 6 meses">⚠ 6m</span>}
                    </td>
                    <td>{fmtFecha(m.created_at)}</td>
                    <td>{fmtFecha(m.updated_at)}</td>
                    <td className={styles.notasCell} title={m.notas_admin || ''}>
                      {m.notas_admin ? (m.notas_admin.length > 30 ? `${m.notas_admin.slice(0, 30)}…` : m.notas_admin) : '—'}
                    </td>
                    <td>
                      <button className={styles.btnEdit} onClick={() => abrirEdicion(m)}>Notas / estado</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal de edición de notas y estado */}
      {editando && (
        <div className={styles.modalBg} onClick={() => setEditando(null)}>
          <div className={styles.modalSm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span>Match · {nom(editando.estudiante)} ↔ {nom(editando.exalumno)}</span>
              <button className={styles.cerrar} onClick={() => setEditando(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.campo}>
                Estado
                <select value={estadoDraft} onChange={(e) => setEstadoDraft(e.target.value)}>
                  {ESTADOS_EDITABLES.map((es) => <option key={es} value={es}>{es}</option>)}
                </select>
              </label>
              <label className={styles.campo}>
                Notas de seguimiento
                <textarea
                  rows={5}
                  placeholder="Notas internas del admin sobre este match…"
                  value={notaDraft}
                  onChange={(e) => setNotaDraft(e.target.value)}
                />
              </label>
            </div>
            <div className={styles.modalAcciones}>
              <button className={styles.btnGhost} onClick={() => setEditando(null)}>Cancelar</button>
              <button className={styles.btnOk} disabled={guardando} onClick={guardarEdicion}>
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
