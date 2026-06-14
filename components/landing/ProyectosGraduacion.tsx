import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

const PROYECTOS = [
  {
    categoria: 'Tecnología',
    titulo: 'Sistema Eco-Data',
    texto: 'Optimización de recursos energéticos mediante IA para pymes locales.',
    tags: ['IA', 'Sostenibilidad'],
    img: '/images/ecosistema-ucr.png',
  },
  {
    categoria: 'Salud',
    titulo: 'Med-Link UCR',
    texto: 'Plataforma de telemedicina para comunidades rurales de difícil acceso.',
    tags: ['Salud', 'Social'],
    img: '/images/campus.png',
  },
  {
    categoria: 'Finanzas',
    titulo: 'Fin-Connect',
    texto: 'Herramienta de educación financiera gamificada para jóvenes adultos.',
    tags: ['Fintech', 'Edtech'],
    img: '/images/descarga-1.jpg',
  },
];

export default function ProyectosGraduacion() {
  return (
    <section id="graduacion" className={`${styles.section} ${styles.sectionLight}`}>
      <div className={styles.container}>
        <div className={styles.gradFrame}>
          <span className={styles.gradCornerTL} aria-hidden />
          <span className={styles.gradCornerBR} aria-hidden />

          <div className={styles.sectionHeader}>
            <div>
              <h2 className={`${styles.sectionTitle} ${styles.headlineLg}`}>
                Proyectos de Graduación
              </h2>
              <div className={styles.accentBar} />
            </div>
            <p className={styles.sectionIntro}>
              Explora las iniciativas más brillantes de nuestros recién graduados que
              buscan mentoría o inversión.
            </p>
          </div>

          <div className={styles.gradGrid} data-anim="reveal">
            {PROYECTOS.map((p) => (
              <article key={p.titulo} className={`${styles.gradCard} ${styles.animItem}`}>
                <div className={styles.gradImageWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.gradImage} src={p.img} alt={p.titulo} loading="lazy" />
                  <span className={styles.gradCat}>{p.categoria}</span>
                </div>
                <div className={styles.gradBody}>
                  <h3 className={`${styles.gradTitle} ${styles.headlineMd}`}>{p.titulo}</h3>
                  <p className={styles.gradText}>{p.texto}</p>
                  <div className={styles.gradTags}>
                    {p.tags.map((t) => (
                      <span key={t} className={styles.gradTag}>
                        {t.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <Link href="/registro" className={styles.gradBtn}>
                    Conectar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
