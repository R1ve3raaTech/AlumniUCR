'use client';

import React from 'react';
import Link from 'next/link';
import styles from './mentorias.module.css';

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
const IUser = () => (<svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
const IChevronDown = ({ className }: { className?: string }) => (<svg className={className} {...base}><path d="m6 9 6 6 6-6" /></svg>);
const IArrowLeft = () => (<svg {...base}><path d="M19 12H5m7 7-7-7 7-7" /></svg>);
const IArrowRight = () => (<svg {...base}><path d="M5 12h14m-7-7 7 7-7 7" /></svg>);

// ─── Datos ────────────────────────────────────────────────────────────────
const FILTROS = [
  { label: 'Facultad', opciones: ['Facultad', 'Ingeniería', 'Ciencias Sociales', 'Artes y Letras', 'Ciencias Básicas'] },
  { label: 'Experticia', opciones: ['Experticia', 'Liderazgo', 'Software', 'Finanzas', 'Marketing'] },
  { label: 'Experiencia', opciones: ['Experiencia', '1-5 años', '6-10 años', '10+ años'] },
];

type Mentor = {
  img: string;
  nombre: string;
  cargo: string;
  afinidad: string;
  tags: string[];
};

const MENTORES: Mentor[] = [
  {
    img: '/images/ecosistema-ucr.png',
    nombre: 'Ing. Carlos Rodríguez',
    cargo: 'Senior Project Manager @ TechGlobal',
    afinidad: '98% Afinidad',
    tags: ['Gestión', 'Liderazgo', 'Software'],
  },
  {
    img: '/images/campus.png',
    nombre: 'Dra. Elena Mora',
    cargo: 'Directora de Estrategia @ InnovaCR',
    afinidad: '92% Afinidad',
    tags: ['Negocios', 'Economía', 'Startups'],
  },
  {
    img: '/images/descarga-1.jpg',
    nombre: 'MSc. Javier Soto',
    cargo: 'UX/UI Design Lead @ GlobalPixels',
    afinidad: '89% Afinidad',
    tags: ['Diseño', 'Tecnología', 'Artes'],
  },
];

export default function MentoriasPage() {
  return (
    <div className={styles.page}>
      {/* Cabecera */}
      <header className={styles.header}>
        <div className={styles.nav}>
          <Link href="/" className={styles.brand}>Alumni UCR Connect</Link>
          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Inicio</Link>
            <Link href="/proyectos" className={styles.navLink}>Proyectos</Link>
            <span className={`${styles.navLink} ${styles.navLinkActive}`}>Mentorías</span>
            <Link href="/#impacto" className={styles.navLink}>Impacto</Link>
          </nav>
          <div className={styles.navRight}>
            <Link href="/ayuda" className={styles.iconBtn} aria-label="Notificaciones"><IBell /></Link>
            <Link href="/dashboard" className={styles.iconBtn} aria-label="Mi perfil"><IUser /></Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Hero diagonal */}
        <section className={styles.hero}>
          <div className={styles.heroTexture} aria-hidden />
          <span className={styles.heroBlock} aria-hidden />
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Explorador de <span className={styles.heroAccent}>Mentorías</span>
              </h1>
              <p className={styles.heroText}>
                Conecte con graduados experimentados de la Universidad de Costa Rica.
                Encuentre el guía perfecto para acelerar su carrera profesional, compartir
                conocimientos y fortalecer la red de excelencia académica.
              </p>
              <div className={styles.heroActions}>
                <a href="#mentores" className={styles.btnPrimary}>Empieza Ahora</a>
                <a href="#postular" className={styles.btnGhost}>Ver Beneficios</a>
              </div>
            </div>
            <div className={styles.heroFrame}>
              <span className={styles.frameTL} aria-hidden />
              <span className={styles.frameBR} aria-hidden />
              <img className={styles.heroImg} src="/images/campus.png" alt="Sesión de mentoría" />
            </div>
          </div>
        </section>

        {/* Barra de filtros */}
        <section className={styles.filterBar}>
          <div className={styles.filterInner}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}><ISearch /></span>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Buscar mentor por nombre, especialidad..."
                aria-label="Buscar mentor"
              />
            </div>
            <div className={styles.selects}>
              {FILTROS.map((f) => (
                <div key={f.label} className={styles.selectWrap}>
                  <select className={styles.select} aria-label={f.label}>
                    {f.opciones.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <IChevronDown className={styles.selectIcon} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grilla de mentores */}
        <section id="mentores" className={styles.mentores}>
          <div className={styles.container}>
            <div className={styles.mentoresHead}>
              <div>
                <h2 className={styles.mentoresTitle}>Mentores Recomendados</h2>
                <p className={styles.mentoresSub}>Basado en su perfil y red de contactos.</p>
              </div>
              <div className={styles.carouselNav}>
                <button type="button" className={styles.carouselBtn} aria-label="Anterior"><IArrowLeft /></button>
                <button type="button" className={styles.carouselBtn} aria-label="Siguiente"><IArrowRight /></button>
              </div>
            </div>

            <div className={styles.grid}>
              {MENTORES.map((m) => (
                <article key={m.nombre} className={styles.card}>
                  <div className={styles.cardMedia}>
                    <img className={styles.cardImg} src={m.img} alt={m.nombre} />
                    <span className={styles.afinidad}>{m.afinidad}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{m.nombre}</h3>
                    <p className={styles.cardRole}>{m.cargo}</p>
                    <div className={styles.tags}>
                      {m.tags.map((t) => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.ctaPrimary}>Ver Perfil</button>
                      <button type="button" className={styles.ctaOutline}>Conectar</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.loadMore}>
              <button type="button" className={styles.loadBtn}>
                Ver más mentores <IChevronDown className={styles.loadIcon} />
              </button>
              <span className={styles.loadRule} aria-hidden />
            </div>
          </div>
        </section>

        {/* CTA: ser mentor */}
        <section id="postular" className={styles.cta}>
          <div className={styles.ctaTexture} aria-hidden />
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>¿Listo para ser un mentor?</h2>
            <p className={styles.ctaText}>
              Comparta su experiencia con la próxima generación de líderes de la UCR.
              Regístrese como mentor y deje su huella.
            </p>
            <Link href="/registro" className={styles.ctaBtn}>Postularme como Mentor</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerBrand}>Alumni UCR</span>
          <nav className={styles.footerLinks}>
            <Link href="/ayuda">Contacto</Link>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="https://www.ucr.ac.cr" target="_blank" rel="noopener noreferrer">UCR.ac.cr</a>
          </nav>
          <p className={styles.footerCopy}>
            © 2025 Alumni UCR. Universidad de Costa Rica.<br />Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
