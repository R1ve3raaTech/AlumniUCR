'use client';

// Directorio público de exalumnos (RF-02). Muestra solo perfiles al 100% y los
// campos públicos: foto, nombre, carrera UCR, sector, áreas y tipos de apoyo.
// El monto de donación NO se expone (privado).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AlumniLogo from '@/components/AlumniLogo';
import { obtenerDirectorio } from '@/lib/perfilExalumno';
import styles from './directorio.module.css';

interface Exalumno {
  id: string;
  nombre: string;
  foto_perfil: string | null;
  carreras: string[];
  facultades: string[];
  sectores: string[];
  areas: string[];
  apoyo: { mentoria: boolean; empleo: boolean; pasantia: boolean; colaboracion: boolean; donacion: boolean };
}

const APOYO_LABEL: { clave: keyof Exalumno['apoyo']; label: string }[] = [
  { clave: 'mentoria', label: 'Mentoría' },
  { clave: 'empleo', label: 'Empleo' },
  { clave: 'pasantia', label: 'Pasantía' },
  { clave: 'colaboracion', label: 'Colaboración' },
  { clave: 'donacion', label: 'Donación' },
];

export default function DirectorioPage() {
  const [lista, setLista] = useState<Exalumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await obtenerDirectorio();
        if (activo) setLista(res?.data ?? []);
      } catch {
        if (activo) setLista([]);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  const filtrada = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((e) =>
      [e.nombre, ...e.carreras, ...e.sectores, ...e.areas].join(' ').toLowerCase().includes(q),
    );
  }, [lista, busqueda]);

  const iniciales = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <nav className={styles.nav}>
          <Link href="/proyectos" className={styles.navLink}>Proyectos</Link>
          <Link href="/mentorias" className={styles.navLink}>Mentorías</Link>
          <Link href="/login" className={styles.navLink}>Ingresar</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Directorio de Exalumnos</h1>
          <p className={styles.heroText}>
            Conecta con egresados de la UCR dispuestos a aportar: mentoría, empleo,
            pasantías, colaboración y más.
          </p>
          <input
            className={styles.search}
            type="text"
            placeholder="Buscar por nombre, carrera, sector o área…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </section>

      <main className={styles.main}>
        {cargando ? (
          <p className={styles.vacio}>Cargando directorio…</p>
        ) : filtrada.length === 0 ? (
          <p className={styles.vacio}>
            Aún no hay exalumnos con perfil completo en el directorio.
          </p>
        ) : (
          <div className={styles.grid}>
            {filtrada.map((e) => (
              <article key={e.id} className={styles.card}>
                <div className={styles.cardHead}>
                  {e.foto_perfil
                    ? <img src={e.foto_perfil} alt={e.nombre} className={styles.foto} />
                    : <span className={styles.fotoIni}>{iniciales(e.nombre)}</span>}
                  <div>
                    <h3 className={styles.nombre}>{e.nombre}</h3>
                    <p className={styles.carrera}>
                      {e.carreras[0] || '—'}{e.facultades[0] ? ` · ${e.facultades[0]}` : ''}
                    </p>
                  </div>
                </div>

                {e.sectores.length > 0 && (
                  <p className={styles.sector}><strong>Sector:</strong> {e.sectores.join(', ')}</p>
                )}

                {e.areas.length > 0 && (
                  <div className={styles.areas}>
                    {e.areas.map((a) => <span key={a} className={styles.areaChip}>{a}</span>)}
                  </div>
                )}

                <div className={styles.apoyo}>
                  {APOYO_LABEL.filter((a) => e.apoyo[a.clave]).map((a) => (
                    <span key={a.clave} className={styles.apoyoChip}>{a.label}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <AlumniLogo height={30} />
        <span className={styles.footerCopy}>© 2025 Alumni UCR. Universidad de Costa Rica.</span>
      </footer>
    </div>
  );
}
