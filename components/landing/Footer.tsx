import React from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { Mail, Phone, Linkedin, Instagram, Facebook } from './icons';
import styles from './landing.module.css';

// Privacidad y Términos viven en /terminos (la sección de privacidad tiene
// ancla propia). Directorio apunta al directorio público real (/directorio),
// no a la sección de proyectos del landing.
const ENLACES = [
  { label: 'Políticas de Privacidad', href: '/terminos#privacidad' },
  { label: 'Términos de Servicio', href: '/terminos' },
  { label: 'Contacto', href: '#contacto' },
  { label: 'Directorio', href: '/directorio' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div>
            <BrandLogo light />
            <p className={styles.footerAbout}>
              Potenciando la red de profesionales más grande de Costa Rica a través de
              la colaboración y el intercambio de conocimientos.
            </p>
            <div className={styles.footerSocial}>
              <a href="#" aria-label="LinkedIn"><Linkedin /></a>
              <a href="#" aria-label="Instagram"><Instagram /></a>
              <a href="#" aria-label="Facebook"><Facebook /></a>
            </div>
          </div>

          <div>
            <h5 className={styles.footerColTitle}>Enlaces</h5>
            <ul className={styles.footerList}>
              {ENLACES.map((e) => (
                <li key={e.label}>
                  {/* Rutas internas con Link (navegación cliente); anclas con <a>. */}
                  {e.href.startsWith('/') ? (
                    <Link href={e.href}>{e.label}</Link>
                  ) : (
                    <a href={e.href}>{e.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className={styles.footerColTitle}>Contacto</h5>
            <p className={styles.footerContactItem}>
              <Mail /> alumni@ucr.ac.cr
            </p>
            <p className={styles.footerContactItem}>
              <Phone /> +506 2511-0000
            </p>
            <Link href="/registro" className={styles.navCta}>
              Unirse
            </Link>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.footerCopy}>
            © 2026 Fundación Alumni UCR. Todos los derechos reservados.
          </p>
          <div className={styles.footerStatus}>
            <span className={styles.footerStatusDot} />
            <span className={styles.footerStatusText}>System Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
