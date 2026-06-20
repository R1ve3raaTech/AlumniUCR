import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

// Sección "Misión de la Fundación": explica lo simple y confiable que es
// participar (mentor, padrino, patrocinador o voluntario), el acompañamiento
// del equipo, el chat 24/7 y la seguridad/discreción de los datos.
// Imágenes de alta calidad (Unsplash) por tema. Va debajo del CTA final.

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;

const Check = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" />
  </svg>
);

const FEATURES = [
  {
    titulo: 'Conectar es simple, sin complicaciones',
    texto: 'Creá tu perfil en minutos y encontrá tu match por afinidad. Estudiantes y exalumnos se conectan con unos pocos clics, sin trámites engorrosos ni pasos de más.',
    img: IMG('1522071820081-009f0129c71c'), badge: 'Listo en minutos',
  },
  {
    titulo: 'Sé mentor, padrino, patrocinador o voluntario',
    texto: 'El apoyo de cada exalumno transforma una carrera. Elegí cómo aportar —mentoría, apadrinamiento, patrocinio o voluntariado— con un proceso claro, confiable y guiado paso a paso.',
    img: IMG('1531482615713-2afd69097998'), badge: 'Proceso confiable',
  },
  {
    titulo: 'Te acompañamos en todo el proceso',
    texto: 'Nuestro equipo está atento a tus consultas y te acompaña en cada paso. Contamos con un chat 24/7 con tiempos de respuesta efectivos para resolver lo que necesités, cuando lo necesités.',
    img: IMG('1600880292089-90a7e086ee0c'), badge: 'Chat 24/7',
  },
  {
    titulo: 'Seguridad y discreción con tu información',
    texto: 'Manejamos tus datos con la máxima discreción y seguridad interna. Amplia capacidad de almacenamiento y protección de la información para que tu experiencia sea siempre confiable.',
    img: IMG('1510511459019-5dda7724fd87'), badge: 'Datos protegidos',
  },
];

const TEAM = [
  IMG('1560250097-0b93528c311a'),
  IMG('1519345182560-3f2917c472ef'),
  IMG('1568602471122-7832951cc4c5'),
];

export default function MisionFundacion() {
  return (
    <section id="mision" className={styles.mfSection}>
      <div className={styles.container}>
        <div className={styles.mfHead}>
          <h2>La misión de <em>Fundación Alumni-UCR</em></h2>
          <p>
            Impulsamos el talento de la UCR conectando a estudiantes con exalumnos que brindan
            mentoría, patrocinio, apadrinamiento o voluntariado. Hacerlo es simple, transparente
            y siempre con nuestro acompañamiento.
          </p>
        </div>

        {FEATURES.map((f, i) => (
          <div key={f.titulo} className={`${styles.mfRow} ${i % 2 === 1 ? styles.mfRowRev : ''}`}>
            <div className={styles.mfText}>
              <h3>{f.titulo}</h3>
              <p>{f.texto}</p>
            </div>
            <div className={styles.mfMedia}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.img} alt={f.titulo} loading="lazy" />
              <span className={styles.mfBadge}>{Check} {f.badge}</span>
            </div>
          </div>
        ))}

        {/* Equipo / soporte */}
        <div className={styles.mfSupport}>
          <div className={styles.mfText}>
            <h3>Un equipo dedicado a vos</h3>
            <p>
              El personal de Fundación Alumni-UCR está siempre disponible. Visitá nuestro Centro
              de Ayuda o escribinos por el chat 24/7: respuestas efectivas y acompañamiento real
              durante todo tu proceso como estudiante o exalumno.
            </p>
            <Link href="/ayuda" className={styles.mfBtn}>Centro de Ayuda</Link>
          </div>
          <div className={styles.mfTeam}>
            {TEAM.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`Equipo de soporte ${i + 1}`} loading="lazy" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
