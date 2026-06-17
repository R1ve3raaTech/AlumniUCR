'use client';

// Directorio de estudiantes (RF-03) para exalumnos: solo perfiles completos,
// sin exponer la beca. El exalumno solicita contacto; cuando el estudiante la
// acepta, se revelan la beca y el correo.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import ReportarPerfil from '@/components/ReportarPerfil';
import { obtenerDirectorioEstudiantes, solicitarContacto } from '@/lib/directorioEstudiantes';
import styles from './estudiantes.module.css';

interface Estudiante {
  id: string;
  nombre: string;
  carreras: string[];
  facultades: string[];
  proyecto: { titulo: string; avance: number };
  areas: string[];
  habilidades: string;
  busca: { financiamiento: boolean; mentoria: boolean; empleo: boolean; pasantia: boolean };
  solicitud: null | 'pendiente' | 'aceptada' | 'rechazada';
  beca: string | null;
  correo: string | null;
}

const BUSCA_LABEL: { clave: keyof Estudiante['busca']; label: string }[] = [
  { clave: 'financiamiento', label: 'Financiamiento' },
  { clave: 'mentoria', label: 'Mentoría' },
  { clave: 'empleo', label: 'Empleo' },
  { clave: 'pasantia', label: 'Pasantía' },
];

export default function EstudiantesPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [lista, setLista] = useState<Estudiante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [enviando, setEnviando] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const res = await obtenerDirectorioEstudiantes(token);
        if (activo) setLista(res?.data ?? []);
      } catch {
        if (activo) setLista([]);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  const filtrada = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((e) =>
      [e.nombre, e.proyecto.titulo, ...e.carreras, ...e.areas].join(' ').toLowerCase().includes(q),
    );
  }, [lista, busqueda]);

  async function pedirContacto(id: string) {
    setEnviando(id);
    try {
      await solicitarContacto(token as string, id);
      setLista((l) => l.map((e) => (e.id === id ? { ...e, solicitud: 'pendiente' } : e)));
    } catch {
      /* el error se mantiene simple */
    } finally {
      setEnviando(null);
    }
  }

  const iniciales = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Directorio de Estudiantes</h1>
          <p className={styles.heroText}>
            Conoce los proyectos de graduación y apoya con mentoría, empleo, pasantías o
            financiamiento. El nivel de beca solo se revela cuando el estudiante acepta tu
            solicitud de contacto.
          </p>
          <input
            className={styles.search}
            type="text"
            placeholder="Buscar por nombre, proyecto, carrera o área…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </section>

      <main className={styles.main}>
        {cargando ? (
          <p className={styles.vacio}>Cargando directorio…</p>
        ) : filtrada.length === 0 ? (
          <p className={styles.vacio}>Aún no hay estudiantes con perfil completo en el directorio.</p>
        ) : (
          <div className={styles.grid}>
            {filtrada.map((e) => (
              <article key={e.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.ini}>{iniciales(e.nombre)}</span>
                  <div>
                    <h3 className={styles.nombre}>{e.nombre}</h3>
                    <p className={styles.carrera}>{e.carreras[0] || '—'}{e.facultades[0] ? ` · ${e.facultades[0]}` : ''}</p>
                  </div>
                </div>

                <p className={styles.proyecto}><strong>Proyecto:</strong> {e.proyecto.titulo}</p>
                <div className={styles.barra}><span className={styles.barraFill} style={{ width: `${e.proyecto.avance}%` }} /></div>
                <span className={styles.avance}>{e.proyecto.avance}% de avance</span>

                {e.areas.length > 0 && (
                  <div className={styles.areas}>{e.areas.map((a) => <span key={a} className={styles.areaChip}>{a}</span>)}</div>
                )}

                <div className={styles.busca}>
                  <span className={styles.buscaLabel}>Busca:</span>
                  {BUSCA_LABEL.filter((b) => e.busca[b.clave]).map((b) => (
                    <span key={b.clave} className={styles.buscaChip}>{b.label}</span>
                  ))}
                </div>

                {/* Acción de contacto / revelado condicional */}
                <div className={styles.contacto}>
                  {e.solicitud === 'aceptada' ? (
                    <div className={styles.revelado}>
                      <p><strong>Beca:</strong> {e.beca}</p>
                      <p><strong>Contacto:</strong> <a href={`mailto:${e.correo}`}>{e.correo}</a></p>
                    </div>
                  ) : e.solicitud === 'pendiente' ? (
                    <span className={styles.estadoPend}>Solicitud enviada · pendiente de respuesta</span>
                  ) : e.solicitud === 'rechazada' ? (
                    <span className={styles.estadoRech}>Solicitud no aceptada</span>
                  ) : (
                    <button type="button" className={styles.btn} onClick={() => pedirContacto(e.id)} disabled={enviando === e.id}>
                      {enviando === e.id ? 'Enviando…' : 'Solicitar contacto'}
                    </button>
                  )}
                </div>

                <div className={styles.reportarRow}><ReportarPerfil idReportado={e.id} nombre={e.nombre} /></div>
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
