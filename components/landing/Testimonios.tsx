'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from './icons';
import styles from './landing.module.css';

const TESTIMONIOS = [
  {
    nombre: 'Dra. Rodríguez',
    rol: 'Mentora en Medicina',
    avatar: '/images/TANIA_RODRIGUEZ01-pq2.png',
    texto:
      'Poder retribuir a mi alma máter guiando a la nueva generación de médicos ha sido una de las experiencias más gratificantes de mi carrera. UCR Connect facilita este puente de manera excepcional.',
  },
  {
    nombre: 'Mateo Rivera',
    rol: 'Emprendedor Tech',
    avatar: '/images/image.png',
    texto:
      'Gracias al algoritmo de matching encontré al inversor perfecto para mi startup. No solo compartimos la misma carrera, sino la misma visión de impacto social para el país.',
  },
];

export default function Testimonios() {
  return (
    <section id="historias" className={`${styles.section} ${styles.sectionDark} ${styles.testiSection}`}>
      <div className={styles.container}>
        <motion.h2
          className={`${styles.testiTitle} ${styles.headlineLg}`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Historias de <span style={{ color: 'var(--ucr-celeste)' }}>Éxito</span>
        </motion.h2>

        <div className={styles.testiGrid} data-anim="reveal">
          {TESTIMONIOS.map((t, i) => (
            <motion.article
              key={t.nombre}
              className={`${styles.testiCard} ${styles.animItem}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: 'easeOut' }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
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
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
