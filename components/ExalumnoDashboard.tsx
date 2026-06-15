'use client';

// Panel del exalumno. Reutiliza la identidad visual de la plataforma (paleta
// --ucr-/--brand-, tipografía condensada y textura tech-grid) y enlaza a las
// secciones reales (proyectos, mentorías). Se construye sobre el perfil real
// del exalumno autenticado.

import React from 'react';
import Link from 'next/link';
import AlumniLogo from './AlumniLogo';
import styles from './ExalumnoDashboard.module.css';

interface Perfil {
  nombre?: string;
  correo_electronico?: string;
  estado?: string;
  roles?: { nombre?: string } | null;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const IHub = () => (<svg {...base}><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" /><path d="M12 7.5v4m0 0-5 5m5-5 5 5" /></svg>);
const IHeart = () => (<svg {...base}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>);
const IUsers = () => (<svg {...base}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
const ILink = () => (<svg {...base}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>);
const IArrowRight = () => (<svg {...base}><path d="M5 12h14m-7-7 7 7-7 7" /></svg>);
const ILogout = () => (<svg {...base}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>);
const IEdit = () => (<svg {...base}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>);

const STATS = [
  { icon: <IHeart />, valor: '0', label: 'Proyectos apoyados' },
  { icon: <IHub />, valor: '0', label: 'Donaciones realizadas' },
  { icon: <IUsers />, valor: '0', label: 'Mentorías activas' },
  { icon: <ILink />, valor: '0', label: 'Conexiones' },
];

const ACCIONES = [
  { icon: <IHeart />, titulo: 'Explorar proyectos', desc: 'Apoya iniciativas estudiantiles con tu experiencia o aporte.', href: '/proyectos' },
  { icon: <IUsers />, titulo: 'Ofrecer mentoría', desc: 'Guía a la próxima generación de profesionales de la UCR.', href: '/mentorias' },
  { icon: <IHeart />, titulo: 'Hacer una donación', desc: 'Impulsa proyectos con metas académicas activas.', href: '/proyectos' },
  { icon: <IHub />, titulo: 'Centro de ayuda', desc: '¿Dudas? Encuentra respuestas y contacto de soporte.', href: '/ayuda' },
];

export default function ExalumnoDashboard({
  perfil,
  correo,
  onSignOut,
}: {
  perfil: Perfil | null;
  correo: string;
  onSignOut: () => void;
}) {
  const nombre = perfil?.nombre || correo.split('@')[0] || 'Exalumno';
  const rol = perfil?.roles?.nombre || 'Exalumno';
  const estado = perfil?.estado || 'activo';
  const primerNombre = nombre.split(' ')[0];

  return (
    <div className={styles.page}>
      {/* Cabecera */}
      <header className={styles.header}>
        <div className={styles.nav}>
          <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
          <nav className={styles.navLinks}>
            <Link href="/proyectos" className={styles.navLink}>Proyectos</Link>
            <Link href="/mentorias" className={styles.navLink}>Mentorías</Link>
            <Link href="/ayuda" className={styles.navLink}>Ayuda</Link>
          </nav>
          <button type="button" className={styles.logout} onClick={onSignOut}>
            <ILogout /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Bienvenida */}
        <section className={styles.welcome}>
          <span className={styles.welcomeTexture} aria-hidden />
          <div className={styles.welcomeContent}>
            <span className={styles.badge}>{rol}</span>
            <h1 className={styles.welcomeTitle}>Hola de nuevo, {primerNombre}</h1>
            <p className={styles.welcomeText}>
              Este es tu espacio para conectar con la UCR: apoya proyectos, comparte tu
              experiencia como mentor y haz crecer la red Alumni.
            </p>
          </div>
        </section>

        <div className={styles.container}>
          {/* Estadísticas */}
          <section className={styles.stats}>
            {STATS.map((s) => (
              <article key={s.label} className={styles.statCard}>
                <span className={styles.statIcon}>{s.icon}</span>
                <div>
                  <span className={styles.statValor}>{s.valor}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              </article>
            ))}
          </section>

          {/* Acciones rápidas */}
          <section className={styles.bloque}>
            <h2 className={styles.bloqueTitulo}>Acciones rápidas</h2>
            <div className={styles.acciones}>
              {ACCIONES.map((a) => (
                <Link key={a.titulo} href={a.href} className={styles.accionCard}>
                  <span className={styles.accionIcon}>{a.icon}</span>
                  <h3 className={styles.accionTitulo}>{a.titulo}</h3>
                  <p className={styles.accionDesc}>{a.desc}</p>
                  <span className={styles.accionArrow}><IArrowRight /></span>
                </Link>
              ))}
            </div>
          </section>

          {/* Tu cuenta */}
          <section className={styles.bloque}>
            <h2 className={styles.bloqueTitulo}>Tu cuenta</h2>
            <div className={styles.cuenta}>
              <div className={styles.cuentaInfo}>
                <div className={styles.dato}>
                  <span className={styles.datoKey}>Nombre</span>
                  <span className={styles.datoValor}>{nombre}</span>
                </div>
                <div className={styles.dato}>
                  <span className={styles.datoKey}>Correo</span>
                  <span className={styles.datoValor}>{correo}</span>
                </div>
                <div className={styles.dato}>
                  <span className={styles.datoKey}>Rol</span>
                  <span className={styles.datoValor}>{rol}</span>
                </div>
                <div className={styles.dato}>
                  <span className={styles.datoKey}>Estado</span>
                  <span className={`${styles.estado} ${styles[`estado_${estado}`] ?? ''}`}>{estado}</span>
                </div>
              </div>
              <button type="button" className={styles.editar}>
                <IEdit /> Editar perfil
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <AlumniLogo height={30} />
        <span className={styles.footerCopy}>© 2025 Alumni UCR. Universidad de Costa Rica.</span>
      </footer>
    </div>
  );
}
