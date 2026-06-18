'use client';

// Directorio de posiciones de empleo/pasantía (RF-10). Visible para estudiantes
// y exalumnos. Lista las posiciones activas (no pausadas, no vencidas) con filtros
// por tipo, modalidad y búsqueda. El cierre automático por fecha lo hace el BE.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import { obtenerPosicionesActivas } from '@/lib/posiciones';
import styles from './posiciones.module.css';

interface Posicion {
  id: number | string;
  titulo_puesto: string;
  tipo: string | null;
  modalidad: string | null;
  jornada: string | null;
  lugar_trabajo: string | null;
  empresa: string | null;
  fecha_limite: string | null;
  habilidades: string | null;
  descripcion: string | null;
}

const fmtFecha = (f: string | null) => (f ? new Date(f).toLocaleDateString('es-CR') : 'Sin fecha límite');
const cap = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export default function PosicionesPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Posicion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('');
  const [modalidad, setModalidad] = useState('');

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const ps = await obtenerPosicionesActivas(token);
        if (activo) setLista(ps);
      } catch {
        if (activo) setLista([]);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  const tipos = useMemo(() => Array.from(new Set(lista.map((p) => p.tipo).filter(Boolean))) as string[], [lista]);
  const modalidades = useMemo(() => Array.from(new Set(lista.map((p) => p.modalidad).filter(Boolean))) as string[], [lista]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return lista.filter((p) => {
      if (tipo && p.tipo !== tipo) return false;
      if (modalidad && p.modalidad !== modalidad) return false;
      if (q && ![p.titulo_puesto, p.empresa, p.habilidades].filter(Boolean).join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [lista, busqueda, tipo, modalidad]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>Mi panel</Link>
          <Link href="/estudiantes" className={styles.navLink}>Estudiantes</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Posiciones y pasantías</h1>
          <p className={styles.heroText}>
            Oportunidades publicadas por exalumnos de la UCR. Explorá empleos y pasantías
            según tu área de interés.
          </p>
          <input
            className={styles.search}
            type="text"
            placeholder="Buscar por puesto, empresa o habilidad…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </section>

      <section className={styles.filtros}>
        <div className={styles.filtrosInner}>
          <select className={styles.filtro} value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Filtrar por tipo">
            <option value="">Todos los tipos</option>
            {tipos.map((t) => <option key={t} value={t}>{cap(t)}</option>)}
          </select>
          <select className={styles.filtro} value={modalidad} onChange={(e) => setModalidad(e.target.value)} aria-label="Filtrar por modalidad">
            <option value="">Todas las modalidades</option>
            {modalidades.map((m) => <option key={m} value={m}>{cap(m)}</option>)}
          </select>
          {(tipo || modalidad || busqueda) && (
            <button type="button" className={styles.limpiar} onClick={() => { setTipo(''); setModalidad(''); setBusqueda(''); }}>
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      <main className={styles.main}>
        {!cargando && <p className={styles.contador}>{visibles.length} {visibles.length === 1 ? 'posición' : 'posiciones'}</p>}
        {cargando ? (
          <p className={styles.vacio}>Cargando posiciones…</p>
        ) : visibles.length === 0 ? (
          <p className={styles.vacio}>No hay posiciones que coincidan. Volvé pronto: se publican nuevas seguido.</p>
        ) : (
          <div className={styles.grid}>
            {visibles.map((p) => (
              <article key={p.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <h3 className={styles.titulo}>{p.titulo_puesto}</h3>
                  {p.tipo && <span className={styles.tipoChip}>{cap(p.tipo)}</span>}
                </div>
                <p className={styles.empresa}>{p.empresa || 'Empresa confidencial'}{p.lugar_trabajo ? ` · ${p.lugar_trabajo}` : ''}</p>

                <div className={styles.chips}>
                  {p.modalidad && <span className={styles.chip}>{cap(p.modalidad)}</span>}
                  {p.jornada && <span className={styles.chip}>{cap(p.jornada)}</span>}
                </div>

                {p.descripcion && <p className={styles.desc}>{p.descripcion.length > 140 ? `${p.descripcion.slice(0, 140)}…` : p.descripcion}</p>}
                {p.habilidades && <p className={styles.habilidades}><strong>Habilidades:</strong> {p.habilidades}</p>}

                <div className={styles.cardFoot}>
                  <span className={styles.fecha}>Aplicar antes de: <strong>{fmtFecha(p.fecha_limite)}</strong></span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
