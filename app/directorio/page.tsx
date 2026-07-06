'use client';

// Directorio público de exalumnos (RF-02). Muestra solo perfiles al 100% y los
// campos públicos: foto, nombre, carrera UCR, sector, áreas y tipos de apoyo.
// El monto de donación NO se expone (privado).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AlumniLogo from '@/components/AlumniLogo';
import ReportarPerfil from '@/components/ReportarPerfil';
import DirectorioExalumnos from '@/components/student/DirectorioExalumnos';
import { useAuth } from '@/context/AuthContext';
import { obtenerPerfil } from '@/lib/auth';
import { obtenerDirectorio } from '@/lib/perfilExalumno';
import styles from './directorio.module.css';

interface Exalumno {
  id: string;
  nombre: string;
  foto_perfil: string | null;
  pais: string;
  ciudad: string;
  anio_graduacion: number | null;
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

/** Filtros del directorio (RF-04). Vacío = "todas/todos". */
interface Filtros {
  carrera: string;
  facultad: string;
  sector: string;
  area: string;
  pais: string;
  apoyo: Set<keyof Exalumno['apoyo']>;
}

const FILTROS_VACIOS: Filtros = { carrera: '', facultad: '', sector: '', area: '', pais: '', apoyo: new Set() };

/** Opciones únicas y ordenadas a partir de un selector de listas por exalumno. */
function opcionesUnicas(lista: Exalumno[], selector: (e: Exalumno) => string[]): string[] {
  const set = new Set<string>();
  for (const e of lista) for (const v of selector(e)) if (v) set.add(v);
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}

export default function DirectorioPage() {
  const { token, loading: authLoading } = useAuth();
  const [rol, setRol] = useState<string | null>(null);
  const [rolCargando, setRolCargando] = useState(true);
  const [lista, setLista] = useState<Exalumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
  // Fotos que fallaron al cargar → mostrar iniciales en lugar de ícono roto.
  const [fotosRotas, setFotosRotas] = useState<Set<string>>(new Set());

  // El estudiante gestiona su Directorio de Talento; el resto ve el directorio
  // de exalumnos (público = exalumnos). Se espera a conocer el rol antes de
  // pintar para evitar el "flash" de una pantalla y luego la otra.
  useEffect(() => {
    if (authLoading) return;             // esperar hidratación de la sesión
    if (!token) { setRolCargando(false); return; } // visitante → exalumnos
    let activo = true;
    obtenerPerfil(token)
      .then((r) => { if (activo) setRol(r?.data?.roles?.nombre?.toLowerCase().trim() ?? null); })
      .catch(() => {})
      .finally(() => { if (activo) setRolCargando(false); });
    return () => { activo = false; };
  }, [token, authLoading]);

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

  // Opciones de cada filtro, derivadas de los datos reales cargados.
  const opciones = useMemo(() => ({
    carreras: opcionesUnicas(lista, (e) => e.carreras),
    facultades: opcionesUnicas(lista, (e) => e.facultades),
    sectores: opcionesUnicas(lista, (e) => e.sectores),
    areas: opcionesUnicas(lista, (e) => e.areas),
    paises: opcionesUnicas(lista, (e) => (e.pais ? [e.pais] : [])),
  }), [lista]);

  const hayFiltros =
    !!(filtros.carrera || filtros.facultad || filtros.sector || filtros.area || filtros.pais) ||
    filtros.apoyo.size > 0 ||
    busqueda.trim().length > 0;

  // RF-04: búsqueda parcial + filtros combinables con lógica AND (debe cumplir todos).
  const filtrada = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return lista.filter((e) => {
      if (q && ![e.nombre, ...e.carreras, ...e.facultades, ...e.sectores, ...e.areas]
        .join(' ').toLowerCase().includes(q)) return false;
      if (filtros.carrera && !e.carreras.includes(filtros.carrera)) return false;
      if (filtros.facultad && !e.facultades.includes(filtros.facultad)) return false;
      if (filtros.sector && !e.sectores.includes(filtros.sector)) return false;
      if (filtros.area && !e.areas.includes(filtros.area)) return false;
      if (filtros.pais && e.pais !== filtros.pais) return false;
      let cumpleApoyo = true;
      filtros.apoyo.forEach((clave) => { if (!e.apoyo[clave]) cumpleApoyo = false; });
      if (!cumpleApoyo) return false;
      return true;
    });
  }, [lista, busqueda, filtros]);

  const setCampo = (campo: 'carrera' | 'facultad' | 'sector' | 'area' | 'pais', valor: string) =>
    setFiltros((f) => ({ ...f, [campo]: valor }));

  const toggleApoyo = (clave: keyof Exalumno['apoyo']) =>
    setFiltros((f) => {
      const apoyo = new Set(f.apoyo);
      apoyo.has(clave) ? apoyo.delete(clave) : apoyo.add(clave);
      return { ...f, apoyo };
    });

  const limpiar = () => { setFiltros({ ...FILTROS_VACIOS, apoyo: new Set() }); setBusqueda(''); };

  const iniciales = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  // Mientras no se sepa el rol, no se pinta ninguna de las dos pantallas (evita
  // el parpadeo: directorio de exalumnos → ficha del estudiante).
  if (authLoading || rolCargando) {
    return (
      <div className="grid min-h-screen place-items-center bg-background font-body-base text-on-surface-variant">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-secondary">progress_activity</span>
          Cargando directorio…
        </div>
      </div>
    );
  }

  // El estudiante ve el Directorio de Exalumnos (RF-04); el exalumno, el de estudiantes.
  if (rol === 'estudiante') return <DirectorioExalumnos />;

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

      {/* RF-04: barra de filtros combinables (lógica AND) */}
      <section className={styles.filtros}>
        <div className={styles.filtrosInner}>
          <select className={styles.filtro} value={filtros.carrera}
            onChange={(e) => setCampo('carrera', e.target.value)} aria-label="Filtrar por carrera">
            <option value="">Todas las carreras</option>
            {opciones.carreras.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className={styles.filtro} value={filtros.facultad}
            onChange={(e) => setCampo('facultad', e.target.value)} aria-label="Filtrar por facultad">
            <option value="">Todas las facultades</option>
            {opciones.facultades.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          <select className={styles.filtro} value={filtros.sector}
            onChange={(e) => setCampo('sector', e.target.value)} aria-label="Filtrar por sector">
            <option value="">Todos los sectores</option>
            {opciones.sectores.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className={styles.filtro} value={filtros.area}
            onChange={(e) => setCampo('area', e.target.value)} aria-label="Filtrar por área temática">
            <option value="">Todas las áreas</option>
            {opciones.areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          {opciones.paises.length > 0 && (
            <select className={styles.filtro} value={filtros.pais}
              onChange={(e) => setCampo('pais', e.target.value)} aria-label="Filtrar por país">
              <option value="">Todos los países</option>
              {opciones.paises.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          )}

          <div className={styles.apoyoFiltros}>
            {APOYO_LABEL.map((a) => (
              <button key={a.clave} type="button"
                className={`${styles.apoyoToggle} ${filtros.apoyo.has(a.clave) ? styles.apoyoToggleOn : ''}`}
                aria-pressed={filtros.apoyo.has(a.clave)}
                onClick={() => toggleApoyo(a.clave)}>
                {a.label}
              </button>
            ))}
          </div>

          {hayFiltros && (
            <button type="button" className={styles.limpiar} onClick={limpiar}>
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      <main className={styles.main}>
        {!cargando && (
          <p className={styles.contador}>
            {filtrada.length} {filtrada.length === 1 ? 'exalumno' : 'exalumnos'}
            {hayFiltros ? ' (filtrados)' : ''}
          </p>
        )}
        {cargando ? (
          <p className={styles.vacio}>Cargando directorio…</p>
        ) : filtrada.length === 0 ? (
          <p className={styles.vacio}>
            {hayFiltros
              ? 'Ningún exalumno coincide con los filtros seleccionados.'
              : 'Aún no hay exalumnos con perfil completo en el directorio.'}
          </p>
        ) : (
          <div className={styles.grid}>
            {filtrada.map((e) => (
              <article key={e.id} className={styles.card}>
                <div className={styles.cardHead}>
                  {e.foto_perfil && !fotosRotas.has(e.id)
                    ? <img src={e.foto_perfil} alt={e.nombre} className={styles.foto} onError={() => setFotosRotas((s) => new Set(s).add(e.id))} />
                    : <span className={styles.fotoIni}>{iniciales(e.nombre)}</span>}
                  <div>
                    <h3 className={styles.nombre}>{e.nombre}</h3>
                    <p className={styles.carrera}>
                      {e.carreras[0] || '—'}{e.facultades[0] ? ` · ${e.facultades[0]}` : ''}
                    </p>
                    {(e.ciudad || e.pais || e.anio_graduacion) && (
                      <p className={styles.meta}>
                        {[e.ciudad, e.pais].filter(Boolean).join(', ')}
                        {e.anio_graduacion ? `${e.ciudad || e.pais ? ' · ' : ''}Egreso ${e.anio_graduacion}` : ''}
                      </p>
                    )}
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

                <div className={styles.reportarRow}><ReportarPerfil idReportado={e.id} nombre={e.nombre} /></div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <AlumniLogo height={30} />
        <span className={styles.footerCopy}>© 2026 Alumni UCR. Universidad de Costa Rica.</span>
      </footer>
    </div>
  );
}
