'use client';

// Panel admin — Gestión de usuarios (RF-08).
// Listar usuarios con su rol y estado, buscar por nombre/correo, filtrar por
// estado y rol, y administrar el ciclo de cuenta: suspender (reversible),
// reactivar y eliminar (permanente, con confirmación).
//
// El BE ya soporta todo: GET /users, PUT /users/:id (estado) y DELETE /users/:id,
// y el middleware de auth bloquea el login de los 'suspendido'. No requiere
// cambios de backend.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import { obtenerUsuarios, cambiarEstadoUsuario, eliminarUsuario } from '@/lib/usuarios';
import styles from './usuarios.module.css';

interface Usuario {
  id: string;
  nombre: string | null;
  correo_electronico: string | null;
  estado: string;
  id_rol: number | string | null;
  roles: { nombre?: string } | null;
  created_at?: string;
}

type FiltroEstado = 'todos' | 'activo' | 'suspendido' | 'pendiente' | 'rechazado';
const FILTROS_ESTADO: { clave: FiltroEstado; label: string }[] = [
  { clave: 'todos', label: 'Todos' },
  { clave: 'activo', label: 'Activos' },
  { clave: 'suspendido', label: 'Suspendidos' },
  { clave: 'pendiente', label: 'Pendientes' },
  { clave: 'rechazado', label: 'Rechazados' },
];

const fmtFecha = (f?: string) => (f ? new Date(f).toLocaleDateString('es-CR') : '—');
const rolDe = (u: Usuario) => u.roles?.nombre?.toLowerCase().trim() || '—';
const iniciales = (n: string | null) =>
  (n || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [filtroRol, setFiltroRol] = useState('');
  const [accion, setAccion] = useState<string | null>(null); // id en proceso
  const [eliminando, setEliminando] = useState<Usuario | null>(null);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const us = await obtenerUsuarios(token);
        if (activo) setLista(us);
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudo cargar la lista de usuarios.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  const roles = useMemo(() => {
    const set = new Set<string>();
    for (const u of lista) { const r = rolDe(u); if (r !== '—') set.add(r); }
    return Array.from(set).sort();
  }, [lista]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return lista.filter((u) => {
      if (filtroEstado !== 'todos' && u.estado !== filtroEstado) return false;
      if (filtroRol && rolDe(u) !== filtroRol) return false;
      if (q && ![u.nombre, u.correo_electronico].filter(Boolean).join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [lista, busqueda, filtroEstado, filtroRol]);

  const conteo = useMemo(() => {
    const c = { activo: 0, suspendido: 0, pendiente: 0, rechazado: 0 } as Record<string, number>;
    for (const u of lista) if (c[u.estado] !== undefined) c[u.estado] += 1;
    return c;
  }, [lista]);

  const esYo = (u: Usuario) => user?.id && u.id === user.id;

  async function cambiarEstado(u: Usuario, estado: string) {
    setAccion(u.id);
    setError('');
    try {
      await cambiarEstadoUsuario(token as string, u.id, estado);
      setLista((l) => l.map((x) => (x.id === u.id ? { ...x, estado } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el usuario.');
    } finally {
      setAccion(null);
    }
  }

  async function confirmarEliminar() {
    if (!eliminando) return;
    const u = eliminando;
    setAccion(u.id);
    setError('');
    try {
      await eliminarUsuario(token as string, u.id);
      setLista((l) => l.filter((x) => x.id !== u.id));
      setEliminando(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el usuario.');
    } finally {
      setAccion(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerLinks}>
          <Link href="/admin/donaciones" className={styles.back}>Donaciones</Link>
          <Link href="/admin/reportes" className={styles.back}>Dashboard de impacto</Link>
          <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Gestión de Usuarios</h1>
        <p className={styles.heroText}>
          Administrá las cuentas de la plataforma: suspendé el acceso, reactivá o eliminá
          usuarios. Un usuario suspendido no puede iniciar sesión.
        </p>

        <div className={styles.resumen}>
          <span className={styles.resChip}>Activos: <strong>{conteo.activo}</strong></span>
          <span className={styles.resChip}>Suspendidos: <strong>{conteo.suspendido}</strong></span>
          <span className={styles.resChip}>Pendientes: <strong>{conteo.pendiente}</strong></span>
          <span className={styles.resChipMuted}>Total: {lista.length}</span>
        </div>

        <div className={styles.controles}>
          <input
            className={styles.search}
            type="text"
            placeholder="Buscar por nombre o correo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select className={styles.filtro} value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} aria-label="Filtrar por rol">
            <option value="">Todos los roles</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
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
          <p className={styles.vacio}>Cargando usuarios…</p>
        ) : visibles.length === 0 ? (
          <p className={styles.vacio}>No hay usuarios que coincidan con los filtros.</p>
        ) : (
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Usuario</th><th>Correo</th><th>Rol</th><th>Registro</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => {
                  const enProceso = accion === u.id;
                  const yo = esYo(u);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.usuario}>
                          <span className={styles.avatar}>{iniciales(u.nombre)}</span>
                          <span className={styles.nombre}>
                            {u.nombre || '—'}{yo && <span className={styles.yoTag}>tú</span>}
                          </span>
                        </div>
                      </td>
                      <td>{u.correo_electronico || '—'}</td>
                      <td><span className={styles.rolChip}>{rolDe(u)}</span></td>
                      <td>{fmtFecha(u.created_at)}</td>
                      <td><span className={`${styles.chip} ${styles[u.estado] || ''}`}>{u.estado}</span></td>
                      <td>
                        {yo ? (
                          <span className={styles.listo} title="No podés administrar tu propia cuenta">—</span>
                        ) : (
                          <div className={styles.acciones}>
                            {u.estado === 'activo' ? (
                              <button className={styles.btnWarn} disabled={enProceso} onClick={() => cambiarEstado(u, 'suspendido')}>
                                Suspender
                              </button>
                            ) : (
                              <button className={styles.btnOk} disabled={enProceso} onClick={() => cambiarEstado(u, 'activo')}>
                                Activar
                              </button>
                            )}
                            <button className={styles.btnNo} disabled={enProceso} onClick={() => setEliminando(u)}>
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Confirmación de borrado permanente (acción destructiva) */}
      {eliminando && (
        <div className={styles.modalBg} onClick={() => setEliminando(null)}>
          <div className={styles.modalSm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span>Eliminar usuario</span>
              <button className={styles.cerrar} onClick={() => setEliminando(null)}>✕</button>
            </div>
            <p className={styles.modalText}>
              Vas a eliminar de forma <strong>permanente</strong> a{' '}
              <strong>{eliminando.nombre || eliminando.correo_electronico}</strong>. Esta acción no
              se puede deshacer. Si solo querés impedirle el acceso, usá <strong>Suspender</strong>.
            </p>
            <div className={styles.modalAcciones}>
              <button className={styles.btnGhost} onClick={() => setEliminando(null)}>Cancelar</button>
              <button className={styles.btnNo} disabled={accion === eliminando.id} onClick={confirmarEliminar}>
                Eliminar permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
