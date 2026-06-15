'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import AlumniLogo from '@/components/AlumniLogo';
import { useAuth } from '@/context/AuthContext';
import styles from './proyectos.module.css';

// ─── Íconos SVG inline (heredan currentColor) ─────────────────────────────
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const ISearch = () => (<svg {...base}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>);
const IBell = () => (<svg {...base}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>);
const IChevronLeft = () => (<svg {...base}><path d="m15 18-6-6 6-6" /></svg>);
const IChevronRight = () => (<svg {...base}><path d="m9 18 6-6-6-6" /></svg>);
const IGrid = () => (<svg {...base}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>);
const IGroups = () => (<svg {...base}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
const IUser = () => (<svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);

// ─── Datos ────────────────────────────────────────────────────────────────
const AREAS = ['Todas las áreas', 'Ingeniería', 'Artes y Letras', 'Ciencias Sociales', 'Salud'];

type Proyecto = {
  img: string;
  area: string;
  titulo: string;
  afinidad: string;
  autor: { iniciales?: string; img?: string; nombre: string };
  cta: string;
  ctaVariant: 'primary' | 'outline';
} & (
  | { tipo: 'meta'; metaLabel: string; meta: string; progreso: number }
  | { tipo: 'requerimiento'; requerimiento: string }
);

const PROYECTOS: Proyecto[] = [
  {
    img: '/images/ecosistema-ucr.png',
    area: 'Ingeniería Eléctrica',
    titulo: 'Optimización de Redes Inteligentes',
    afinidad: '98% Afinidad',
    autor: { iniciales: 'CM', nombre: 'Carlos Mendoza' },
    tipo: 'meta',
    metaLabel: 'Meta Académica',
    meta: '$2,500',
    progreso: 65,
    cta: 'Apoyar Proyecto',
    ctaVariant: 'primary',
  },
  {
    img: '/images/campus.png',
    area: 'Arquitectura Sostenible',
    titulo: 'Módulos Habitacionales Bio-Climáticos',
    afinidad: '85% Afinidad',
    autor: { img: '/images/descarga-1.jpg', nombre: 'Lucía Torres' },
    tipo: 'requerimiento',
    requerimiento: 'Busca: Mentoría Técnica Especializada',
    cta: 'Conectar con Lucía',
    ctaVariant: 'outline',
  },
  {
    img: '/images/descarga-1.jpg',
    area: 'Biotecnología',
    titulo: 'Nuevos Biomateriales Orgánicos',
    afinidad: '92% Afinidad',
    autor: { iniciales: 'JP', nombre: 'Jorge Palma' },
    tipo: 'meta',
    metaLabel: 'Financiamiento Requerido',
    meta: '$4,200',
    progreso: 30,
    cta: 'Ver Detalles',
    ctaVariant: 'primary',
  },
];

import { useSearchParams } from 'next/navigation';

export default function ProyectosPage() {
  return (
    <React.Suspense fallback={<div className={styles.page}>Cargando...</div>}>
      <ProyectosContent />
    </React.Suspense>
  );
}

function ProyectosContent() {
  const [areaActiva, setAreaActiva] = useState(0);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const areaSeleccionada = AREAS[areaActiva];

  const proyectosFiltrados = PROYECTOS.filter((p) => {
    // Filtrar por área
    if (areaSeleccionada !== 'Todas las áreas' && p.area !== areaSeleccionada) {
      return false;
    }
    // Filtrar por texto de búsqueda
    if (query) {
      const q = query.toLowerCase();
      const matchTitulo = p.titulo.toLowerCase().includes(q);
      const matchArea = p.area.toLowerCase().includes(q);
      const matchAutor = p.autor.nombre.toLowerCase().includes(q);
      if (!matchTitulo && !matchArea && !matchAutor) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero diagonal */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <span className={styles.badge}>
                <span className={styles.badgeLine} aria-hidden /> Innovación Académica
              </span>
              <h1 className={styles.heroTitle}>Explorador de<br />Proyectos</h1>
              <p className={styles.heroText}>
                Vinculación estratégica entre el talento estudiantil y la experiencia de
                nuestra red Alumni. Descubre, apoya y conecta.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.container}>
          {/* Filtros */}
          <section className={styles.filters}>
            <div className={styles.areaBtns}>
              {AREAS.map((a, i) => (
                <button
                  key={a}
                  type="button"
                  className={`${styles.areaBtn} ${i === areaActiva ? styles.areaBtnActive : ''}`}
                  onClick={() => setAreaActiva(i)}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className={styles.sort}>
              <span className={styles.sortLabel}>Ordenar por:</span>
              <select className={styles.sortSelect} aria-label="Ordenar proyectos">
                <option>Recientes</option>
                <option>Afinidad</option>
                <option>Impacto</option>
              </select>
            </div>
          </section>

          {/* Grilla de proyectos */}
          <div className={styles.grid}>
            {proyectosFiltrados.length === 0 ? (
              <div className={styles.noResults}>No se encontraron proyectos.</div>
            ) : (
              proyectosFiltrados.map((p) => (
                <article key={p.titulo} className={styles.card}>
                  <div className={styles.cardMedia}>
                    <img className={styles.cardImg} src={p.img} alt={p.titulo} />
                    <span className={styles.afinidad}>{p.afinidad}</span>
                  </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardArea}>{p.area}</p>
                  <h3 className={styles.cardTitle}>{p.titulo}</h3>

                  <div className={styles.autor}>
                    {p.autor.img ? (
                      <img className={styles.autorImg} src={p.autor.img} alt={p.autor.nombre} />
                    ) : (
                      <span className={styles.autorIniciales}>{p.autor.iniciales}</span>
                    )}
                    <span className={styles.autorNombre}>{p.autor.nombre}</span>
                  </div>

                  <div className={styles.cardFooter}>
                    {p.tipo === 'meta' ? (
                      <>
                        <div className={styles.metaRow}>
                          <span className={styles.metaLabel}>{p.metaLabel}</span>
                          <span className={styles.metaValor}>{p.meta}</span>
                        </div>
                        <div className={styles.barra}>
                          <span className={styles.barraFill} style={{ width: `${p.progreso}%` }} />
                        </div>
                      </>
                    ) : (
                      <div className={styles.requerimiento}>
                        <p className={styles.requerimientoLabel}>Requerimiento</p>
                        <p className={styles.requerimientoTexto}>{p.requerimiento}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      className={p.ctaVariant === 'primary' ? styles.ctaPrimary : styles.ctaOutline}
                    >
                      {p.cta}
                    </button>
                  </div>
                </div>
              </article>
            )))}
          </div>

          {/* Paginación */}
          <div className={styles.pagination}>
            <button type="button" className={styles.pageArrow} aria-label="Anterior"><IChevronLeft /></button>
            <div className={styles.pageNums}>
              <button type="button" className={`${styles.pageNum} ${styles.pageNumActive}`}>1</button>
              <button type="button" className={styles.pageNum}>2</button>
              <button type="button" className={styles.pageNum}>3</button>
            </div>
            <button type="button" className={styles.pageArrow} aria-label="Siguiente"><IChevronRight /></button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrandCol}>
              <AlumniLogo height={44} />
              <p className={styles.footerDesc}>
                Plataforma institucional de vinculación profesional y académica.
                Fortaleciendo el ecosistema de innovación costarricense.
              </p>
            </div>
            <div className={styles.footerCols}>
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Plataforma</span>
                <Link href="/proyectos">Explorar</Link>
                <Link href="/#impacto">Impacto</Link>
                <Link href="/#historias">Historias</Link>
              </div>
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Legal</span>
                <a href="#">Privacidad</a>
                <a href="#">Términos</a>
              </div>
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Soporte</span>
                <Link href="/ayuda">Contacto</Link>
                <Link href="/ayuda">Ayuda</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>© 2025 Fundación Alumni UCR. Diseño estratégico.</p>
          </div>
        </div>
      </footer>

      {/* Navegación inferior (móvil) */}
      <nav className={styles.bottomNav}>
        <Link href="/" className={styles.bottomItem}><IGrid /><span>Inicio</span></Link>
        <span className={`${styles.bottomItem} ${styles.bottomItemActive}`}><ISearch /><span>Proyectos</span></span>
        <Link href="/#impacto" className={styles.bottomItem}><IGroups /><span>Impacto</span></Link>
        <Link href="/dashboard" className={styles.bottomItem}><IUser /><span>Perfil</span></Link>
      </nav>
    </div>
  );
}
