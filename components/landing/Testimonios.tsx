import React from 'react';
import { Quote } from './icons';
import styles from './landing.module.css';

const TESTIMONIOS = [
  {
    nombre: 'Dra. Rodríguez',
    rol: 'Mentora en Medicina',
    avatar: '/images/descarga-1.jpg',
    texto:
      'Poder retribuir a mi alma máter guiando a la nueva generación de médicos ha sido una de las experiencias más gratificantes de mi carrera. UCR Connect facilita este puente de manera excepcional.',
  },
  {
    nombre: 'Mateo Rivera',
    rol: 'Emprendedor Tech',
    avatar: '/images/campus.png',
    texto:
      'Gracias al algoritmo de matching encontré al inversor perfecto para mi startup. No solo compartimos la misma carrera, sino la misma visión de impacto social para el país.',
  },
];

export default function Testimonios() {
  return (
    <section id="historias" className={`${styles.section} ${styles.sectionDark}`}>
      <div className={styles.container}>
        <h2 className={`${styles.testiTitle} ${styles.headlineLg}`}>
          Historias de <span style={{ color: 'var(--ucr-celeste)' }}>Éxito</span>
        </h2>

        <div className={styles.testiGrid} data-anim="reveal">
          {TESTIMONIOS.map((t) => (
            <article key={t.nombre} className={`${styles.testiCard} ${styles.animItem}`}>
              <Quote className={styles.testiQuote} />
              <div className={styles.testiHead}>
                <div className={styles.testiAvatarWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.testiAvatar} src={t.avatar} alt={t.nombre} loading="lazy" />
                </div>
                <div>
                  <h4 className={styles.testiName}>{t.nombre}</h4>
                  <p className={styles.testiRole}>{t.rol}</p>
                </div>
              </div>
              <p className={styles.testiText}>&ldquo;{t.texto}&rdquo;</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
