import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

const SERVICIOS = [
  {
    icon: 'empleo',
    iconClass: styles.iconEmpleo,
    titulo: 'Bolsa de empleo',
    texto:
      'Vacantes y pasantías publicadas por exalumnos y colaboradores que buscan el sello de calidad de la UCR.',
    svg: (
      <path d="M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
    ),
  },
  {
    icon: 'donacion',
    iconClass: styles.iconDonacion,
    titulo: 'Donaciones',
    texto:
      'Aportes que financian becas, proyectos e investigaciones para impulsar los sueños de los estudiantes.',
    svg: (
      <path d="M12 21s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
    ),
  },
  {
    icon: 'mentoria',
    iconClass: styles.iconMentoria,
    titulo: 'Mentorías',
    texto:
      'Egresados con trayectoria guían a las nuevas generaciones y comparten su experiencia profesional.',
    svg: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 11l2 2 4-4" />
      </>
    ),
  },
];

export default function Servicios() {
  return (
    <section id="servicios" className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Oportunidades y talento</span>
          <h2 className={styles.sectionTitle}>Servicios para impulsar tu carrera</h2>
          <p className={styles.sectionLead}>
            Todo lo que la comunidad UCR pone a tu alcance para conectar con el mundo
            profesional y crecer.
          </p>
        </div>

        <div className={styles.cards} data-anim="reveal">
          {SERVICIOS.map((s) => (
            <article key={s.icon} className={`${styles.card} ${styles.animItem}`}>
              <div className={`${styles.cardIcon} ${s.iconClass}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {s.svg}
                </svg>
              </div>
              <h3 className={styles.cardTitle}>{s.titulo}</h3>
              <p className={styles.cardText}>{s.texto}</p>
            </article>
          ))}

          <article className={`${styles.card} ${styles.cardWide} ${styles.animItem}`}>
            <div className={styles.cardWideText}>
              <h3 className={styles.cardTitle}>¿Eres exalumno o colaborador?</h3>
              <p className={styles.cardText}>
                Publica vacantes, ofrece mentorías o realiza una donación y forma
                parte activa del futuro de la UCR.
              </p>
            </div>
            <Link href="/registro" className={styles.btnPrimary}>
              Quiero colaborar
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
