import React from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import styles from './landing.module.css';

const COLUMNAS = [
  {
    titulo: 'Plataforma',
    links: [
      { label: 'Bolsa de empleo', href: '#servicios' },
      { label: 'Donaciones', href: '#servicios' },
      { label: 'Mentorías', href: '#servicios' },
      { label: 'Eventos', href: '#servicios' },
    ],
  },
  {
    titulo: 'Institución',
    links: [
      { label: 'UCR sitio oficial', href: 'https://www.ucr.ac.cr' },
      { label: 'Nuestra historia', href: '#historia' },
      { label: 'Reglamento', href: '#' },
      { label: 'Transparencia', href: '#' },
    ],
  },
  {
    titulo: 'Cuenta',
    links: [
      { label: 'Iniciar sesión', href: '/login' },
      { label: 'Registro', href: '/registro' },
    ],
  },
];

export default function Footer() {
  const anio = 2025;
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div>
            <BrandLogo light />
            <p className={styles.footerAbout}>
              Conectando la excelencia académica con el éxito profesional de los
              egresados de la Universidad de Costa Rica.
            </p>
          </div>

          {COLUMNAS.map((col) => (
            <div key={col.titulo}>
              <h4 className={styles.footerColTitle}>{col.titulo}</h4>
              <ul className={styles.footerList}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith('/') ? (
                      <Link href={l.href}>{l.label}</Link>
                    ) : (
                      <a href={l.href}>{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.footerBottom}>
          <span>© {anio} UCR Connect — Universidad de Costa Rica. Todos los derechos reservados.</span>
          <span>San Pedro de Montes de Oca, Costa Rica</span>
        </div>
      </div>
    </footer>
  );
}
