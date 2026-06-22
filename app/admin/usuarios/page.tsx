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
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
  const [orden, setOrden] = useState<'fechaDesc' | 'fechaAsc' | 'nombreAsc' | 'nombreDesc'>('fechaDesc');
  const [filas, setFilas] = useState(1);
  const [accion, setAccion] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<Usuario | null>(null);
  const [verUsuario, setVerUsuario] = useState<Usuario | null>(null);
  const [resumenIA, setResumenIA] = useState<string>('');
  const [cargandoResumen, setCargandoResumen] = useState(false);

  async function abrirDetalle(u: Usuario) {
    setVerUsuario(u);
    setResumenIA('');
    setCargandoResumen(true);
    try {
      const res = await fetch('/api/resumen-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: {
            nombre: u.nombre,
            correo_electronico: u.correo_electronico,
            rol: u.roles?.nombre || '—',
            estado: u.estado,
            created_at: u.created_at,
          },
        }),
      });
      const data = await res.json();
      setResumenIA(data.resumen || data.error || 'No se pudo generar el resumen.');
    } catch {
      setResumenIA('Error al conectar con el servicio de IA.');
    } finally {
      setCargandoResumen(false);
    }
  }

  // Refs GSAP
  const heroTitleRef = React.useRef<HTMLHeadingElement>(null);
  const heroTextRef = React.useRef<HTMLParagraphElement>(null);
  const heroBgRef = React.useRef<HTMLElement>(null);
  const controlsRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.1 });
    if (heroTitleRef.current) {
      tl.fromTo(heroTitleRef.current,
        { opacity: 0, y: 30, skewY: 1.5 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.6 }, '-=0.25');
    }
    if (heroTextRef.current) {
      tl.fromTo(heroTextRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5 }, '-=0.35');
    }
    if (controlsRef.current) {
      tl.fromTo(controlsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
    }

    if (heroBgRef.current) {
      const blobs = heroBgRef.current.querySelectorAll('.blob-anim');
      gsap.to(blobs, {
        x: 'random(-50, 50)',
        y: 'random(-30, 30)',
        rotation: 'random(-15, 15)',
        scale: 'random(0.85, 1.15)',
        duration: 'random(5, 8)',
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.5
      });
    }
  }, []);

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
    let res = lista.filter((u) => {
      if (filtroEstado !== 'todos' && u.estado !== filtroEstado) return false;
      if (filtroRol && rolDe(u) !== filtroRol) return false;
      if (q && ![u.nombre, u.correo_electronico].filter(Boolean).join(' ').toLowerCase().includes(q)) return false;
      return true;
    });

    res.sort((a, b) => {
      if (orden === 'fechaDesc') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      } else if (orden === 'fechaAsc') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      } else if (orden === 'nombreAsc') {
        return (a.nombre || '').localeCompare(b.nombre || '');
      } else if (orden === 'nombreDesc') {
        return (b.nombre || '').localeCompare(a.nombre || '');
      }
      return 0;
    });

    return res;
  }, [lista, busqueda, filtroEstado, filtroRol, orden]);

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
          <Link href="/" className={styles.back}>Inicio</Link>
          <Link href="/admin/matches" className={styles.back}>Matches</Link>
          <Link href="/admin/usuarios" className={styles.back}>Usuarios</Link>
          <Link href="/admin/donaciones" className={styles.back}>Donaciones</Link>
          <Link href="/admin/reportes" className={styles.back}>Impacto</Link>
          <Link href="/dashboard" className={styles.back}>Panel Principal ✨</Link>
        </div>
      </header>

      {/* ── HERO CON VIDEO UCR ───────────────────────────── */}
      <section className={styles.heroClean} ref={heroBgRef}>
        <video
          className={styles.heroBgVideo}
          src="/images/video-ucr.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={styles.heroOverlay} />

        <div className={styles.heroBlobs}>
          <div className={`${styles.blob} ${styles.blobOrange} blob-anim`}></div>
          <div className={`${styles.blob} ${styles.blobBlue} blob-anim`}></div>
          <div className={`${styles.blob} ${styles.blobCyan} blob-anim`}></div>
        </div>

        <div className={styles.heroInnerCenter}>
          <div className={styles.heroGlassPanel}>
            <h1 className={styles.titleMassive} ref={heroTitleRef}>
              Gestión de <span className={styles.textGradientMassive}>Usuarios</span>
            </h1>
            <p className={styles.textElevated} ref={heroTextRef}>
              Administrá las cuentas de la plataforma: suspendé el acceso, reactivá o eliminá
              usuarios. Un usuario suspendido no puede iniciar sesión.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.controlsSection} ref={controlsRef}>
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
          <select className={styles.filtro} value={orden} onChange={(e) => setOrden(e.target.value as any)} aria-label="Ordenar por">
            <option value="fechaDesc">Más recientes primero</option>
            <option value="fechaAsc">Más antiguos primero</option>
            <option value="nombreAsc">Nombre (A-Z)</option>
            <option value="nombreDesc">Nombre (Z-A)</option>
          </select>
          <div className={styles.filasControl}>
            <span>Filas del carrusel:</span>
            <button className={styles.btnFila} onClick={() => setFilas(f => Math.max(1, f - 1))}>-</button>
            <span className={styles.filasVal}>{filas}</span>
            <button className={styles.btnFila} onClick={() => setFilas(f => Math.min(4, f + 1))}>+</button>
          </div>
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
      </div>

      <main className={styles.main}>
        {error && <p className={styles.error}>{error}</p>}
        {cargando ? (
          <p className={styles.vacio}>Cargando usuarios…</p>
        ) : visibles.length === 0 ? (
          <p className={styles.vacio}>No hay usuarios que coincidan con los filtros.</p>
        ) : (
          <div className={styles.carouselContainer}>
            <div 
              className={styles.userCarousel} 
              style={{ gridTemplateRows: `repeat(${filas}, auto)` }}
            >
              {visibles.map((u) => {
              const enProceso = accion === u.id;
              const yo = esYo(u);
              return (
                <article key={u.id} className={styles.userCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.avatar}>{iniciales(u.nombre)}</div>
                    <div className={styles.userInfo}>
                      <h3 className={styles.userName}>
                        {u.nombre || '—'} {yo && <span className={styles.yoTag}>tú</span>}
                      </h3>
                      <span className={styles.userEmail}>{u.correo_electronico || '—'}</span>
                    </div>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.cardProp}>
                      <span className={styles.propLabel}>Rol</span>
                      <span className={styles.rolChip}>{rolDe(u)}</span>
                    </div>
                    <div className={styles.cardProp}>
                      <span className={styles.propLabel}>Registro</span>
                      <span className={styles.propVal}>{fmtFecha(u.created_at)}</span>
                    </div>
                    <div className={styles.cardProp}>
                      <span className={styles.propLabel}>Estado</span>
                      <span className={`${styles.chip} ${styles[u.estado] || ''}`}>{u.estado}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.btnInfo}
                      onClick={() => abrirDetalle(u)}
                    >
                      Ver info
                    </button>
                    {yo ? (
                      <span className={styles.listo} title="No podés administrar tu propia cuenta">—</span>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </article>
              );
            })}
            </div>
          </div>
        )}
      </main>

      {/* Modal eliminar */}
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

      {/* Modal ver informacion completa */}
      {verUsuario && (
        <div className={styles.modalBg} onClick={() => setVerUsuario(null)}>
          <div className={styles.modalDetalle} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span>Información del usuario</span>
              <button className={styles.cerrar} onClick={() => setVerUsuario(null)}>✕</button>
            </div>
            <div className={styles.detalleBody}>
              <div className={styles.detalleAvatar}>
                {iniciales(verUsuario.nombre)}
              </div>
              <h2 className={styles.detalleNombre}>
                {verUsuario.nombre || '—'}
                {esYo(verUsuario) && <span className={styles.yoTag}>tú</span>}
              </h2>
              <div className={styles.detalleGrid}>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>📧 Correo electrónico</span>
                  <span className={styles.detalleVal}>{verUsuario.correo_electronico || '—'}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>🎫 Rol</span>
                  <span className={styles.rolChip}>{rolDe(verUsuario)}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>📅 Registro</span>
                  <span className={styles.detalleVal}>{fmtFecha(verUsuario.created_at)}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>🔴 Estado</span>
                  <span className={`${styles.chip} ${styles[verUsuario.estado] || ''}`}>{verUsuario.estado}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>🔑 ID</span>
                  <span className={styles.detalleValMono}>{verUsuario.id}</span>
                </div>
              </div>

              {/* Resumen IA */}
              <div className={styles.resumenIA}>
                <div className={styles.resumenIAHeader}>
                  <span className={styles.resumenIAIcon}>✦</span>
                  <span>Resumen generado por IA</span>
                </div>
                {cargandoResumen ? (
                  <div className={styles.resumenLoading}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.resumenLoadingText}>Analizando perfil…</span>
                  </div>
                ) : (
                  <p className={styles.resumenTexto}>{resumenIA}</p>
                )}
              </div>
            </div>
            {!esYo(verUsuario) && (
              <div className={styles.modalAcciones}>
                <button className={styles.btnGhost} onClick={() => setVerUsuario(null)}>Cerrar</button>
                {verUsuario.estado === 'activo' ? (
                  <button className={styles.btnWarn} disabled={accion === verUsuario.id}
                    onClick={() => { cambiarEstado(verUsuario, 'suspendido'); setVerUsuario(null); }}>
                    Suspender
                  </button>
                ) : (
                  <button className={styles.btnOk} disabled={accion === verUsuario.id}
                    onClick={() => { cambiarEstado(verUsuario, 'activo'); setVerUsuario(null); }}>
                    Activar
                  </button>
                )}
                <button className={styles.btnNo} disabled={accion === verUsuario.id}
                  onClick={() => { setVerUsuario(null); setEliminando(verUsuario); }}>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
