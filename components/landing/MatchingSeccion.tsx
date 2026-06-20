'use client';

// Sección Matching INTERDISCIPLINARIO: grid de tarjetas estudiante ↔ exalumno.
// La afinidad se calcula por 4 conexiones, cada una con su puntaje:
//   misma carrera (30) · áreas de interés (30) · temática de proyecto (20) ·
//   tipo de apoyo (10). El exalumno ofrece: financiamiento, empleo, pasantía
//   o mentoría.
//
// NOTA: los matches son ejemplos realistas e ilustrativos (no de una base real
// todavía). Con un endpoint de matches se reemplaza el array MATCHES.

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from './icons';
import styles from './landing.module.css';

type Apoyo = 'Financiamiento' | 'Empleo' | 'Pasantía' | 'Mentoría';
interface Afin { carrera: boolean; interes: boolean; tematica: boolean; apoyo: boolean; }
interface Match {
  est: string; estCarrera: string;
  ex: string; exRol: string; exEmpresa: string;
  area: string; img: string;
  afin: Afin; ofrece: Apoyo;
}

const PESOS = { carrera: 30, interes: 30, tematica: 20, apoyo: 10 } as const;
const AFIN_META: { key: keyof Afin; label: string; pts: number }[] = [
  { key: 'carrera', label: 'Misma carrera', pts: PESOS.carrera },
  { key: 'interes', label: 'Áreas de interés', pts: PESOS.interes },
  { key: 'tematica', label: 'Temática de proyecto', pts: PESOS.tematica },
  { key: 'apoyo', label: 'Tipo de apoyo', pts: PESOS.apoyo },
];
const score = (a: Afin) =>
  (a.carrera ? PESOS.carrera : 0) + (a.interes ? PESOS.interes : 0) +
  (a.tematica ? PESOS.tematica : 0) + (a.apoyo ? PESOS.apoyo : 0);

const APOYO_COLOR: Record<Apoyo, string> = {
  Financiamiento: '#F34B26', // naranja
  Empleo: '#004C63',         // teal
  'Pasantía': '#007D67',     // esmeralda
  'Mentoría': '#E0A400',     // amarillo (oscurecido para contraste sobre blanco)
};

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const MATCHES: Match[] = [
  { est: 'María Jiménez', estCarrera: 'Computación', ex: 'Roberto Soto', exRol: 'Ing. de Software', exEmpresa: 'TechCR', area: 'Salud Digital', img: IMG('1576091160550-2173dba999ef'), afin: { carrera: true, interes: true, tematica: true, apoyo: true }, ofrece: 'Mentoría' },
  { est: 'Carlos Torres', estCarrera: 'Psicología', ex: 'Esteban Murillo', exRol: 'Psicólogo Org.', exEmpresa: 'Bienestar Digital', area: 'Salud Mental', img: IMG('1573497019940-1c28c88b4f3e'), afin: { carrera: true, interes: true, tematica: false, apoyo: true }, ofrece: 'Empleo' },
  { est: 'Ana Rojas', estCarrera: 'Economía', ex: 'Mariana Castro', exRol: 'Analista Financiera', exEmpresa: 'AgroTech', area: 'Educación Financiera', img: IMG('1554224155-6726b3ff858f'), afin: { carrera: true, interes: false, tematica: true, apoyo: true }, ofrece: 'Financiamiento' },
  { est: 'Laura Vega', estCarrera: 'Ing. Ambiental', ex: 'Andrés León', exRol: 'Ing. Ambiental', exEmpresa: 'AquaCR', area: 'Medio Ambiente', img: IMG('1500375592092-40eb2168fd21'), afin: { carrera: true, interes: true, tematica: true, apoyo: false }, ofrece: 'Pasantía' },
  { est: 'Diego Mora', estCarrera: 'Ing. Eléctrica', ex: 'Sofía Arias', exRol: 'Ing. de Energía', exEmpresa: 'SolarTica', area: 'Energía Renovable', img: IMG('1509391366360-2e959784a276'), afin: { carrera: true, interes: true, tematica: false, apoyo: true }, ofrece: 'Pasantía' },
  { est: 'Sofía Blanco', estCarrera: 'Arquitectura', ex: 'Luis Brenes', exRol: 'Arquitecto', exEmpresa: 'EcoHaus', area: 'Arq. Sostenible', img: IMG('1487958449943-2429e8be8625'), afin: { carrera: true, interes: false, tematica: true, apoyo: true }, ofrece: 'Mentoría' },
  { est: 'Mariana Vargas', estCarrera: 'Agronomía', ex: 'José Quirós', exRol: 'Agrónomo', exEmpresa: 'CaféCoop', area: 'Agrotecnología', img: IMG('1500382017468-9049fed747ef'), afin: { carrera: true, interes: true, tematica: true, apoyo: true }, ofrece: 'Financiamiento' },
  { est: 'Andrés Soto', estCarrera: 'Biología', ex: 'Lucía Méndez', exRol: 'Bióloga Marina', exEmpresa: 'MarViva', area: 'Biología Marina', img: IMG('1532094349884-543bc11b234d'), afin: { carrera: true, interes: true, tematica: false, apoyo: false }, ofrece: 'Empleo' },
  { est: 'Valeria Núñez', estCarrera: 'Comunicación', ex: 'Pedro Ramírez', exRol: 'Productor', exEmpresa: 'Canal UCR', area: 'Comunicación', img: IMG('1504384308090-c894fdcc538d'), afin: { carrera: true, interes: false, tematica: true, apoyo: false }, ofrece: 'Mentoría' },
  { est: 'José Ramírez', estCarrera: 'Ing. Mecánica', ex: 'Karla Solís', exRol: 'Ing. de Robótica', exEmpresa: 'RoboCR', area: 'Robótica Educativa', img: IMG('1485827404703-89b55fcc595e'), afin: { carrera: false, interes: true, tematica: true, apoyo: true }, ofrece: 'Pasantía' },
  { est: 'Daniela Campos', estCarrera: 'Nutrición', ex: 'Marta Vega', exRol: 'Nutricionista', exEmpresa: 'VidaSana', area: 'Nutrición', img: IMG('1490645935967-10de6ba17061'), afin: { carrera: true, interes: true, tematica: true, apoyo: false }, ofrece: 'Mentoría' },
  { est: 'Gabriel Mora', estCarrera: 'Ing. Civil', ex: 'Fernando Rojas', exRol: 'Ing. Civil', exEmpresa: 'Constructora CR', area: 'Infraestructura', img: IMG('1503387762-592deb58ef4e'), afin: { carrera: true, interes: false, tematica: false, apoyo: true }, ofrece: 'Empleo' },
  { est: 'Fernanda Rojas', estCarrera: 'Derecho', ex: 'Carolina Díaz', exRol: 'Abogada', exEmpresa: 'LexCR', area: 'Tecnología Legal', img: IMG('1589829545856-d10d557cf95f'), afin: { carrera: true, interes: true, tematica: false, apoyo: false }, ofrece: 'Mentoría' },
  { est: 'Tomás Herrera', estCarrera: 'Computación', ex: 'Natalia Vargas', exRol: 'CTO', exEmpresa: 'DataCR', area: 'IA & Software', img: IMG('1517694712202-14dd9538aa97'), afin: { carrera: true, interes: true, tematica: true, apoyo: false }, ofrece: 'Empleo' },
  { est: 'Camila Soto', estCarrera: 'Diseño Gráfico', ex: 'Diego Pérez', exRol: 'Director Creativo', exEmpresa: 'Estudio Pixela', area: 'Arte y Diseño', img: IMG('1452860606245-08befc0ff44b'), afin: { carrera: true, interes: false, tematica: true, apoyo: true }, ofrece: 'Pasantía' },
];

const ini = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function MatchingSeccion() {
  return (
    <section id="matching" className={`${styles.section} ${styles.matchTapiz}`}>
      <div className={styles.container}>
        <motion.div
          className={styles.matchHeader}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className={`${styles.sectionTitle} ${styles.headlineLg}`}>
            Matching <em>Inteligente</em>
          </h2>
          <div className={styles.accentBar} />
          <p className={styles.matchSubtitle}>
            Conectamos a cada estudiante con el exalumno ideal por afinidad: misma carrera (30),
            áreas de interés (30), temática de proyecto (20) y tipo de apoyo (10). El puntaje total
            mide qué tan fuerte es el match.
          </p>
        </motion.div>

        <div className={styles.imGrid}>
          {MATCHES.map((m) => {
            const total = score(m.afin);
            return (
              <motion.article
                key={`${m.est}-${m.ex}`}
                className={styles.imCard}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <div className={styles.imImgWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.imImg} src={m.img} alt={m.area} loading="lazy" />
                  <span className={styles.imArea}>{m.area}</span>
                  <span className={styles.imScore}>{total}<small>pts</small></span>
                  <span className={styles.imOfrece} style={{ ['--ap']: APOYO_COLOR[m.ofrece] } as React.CSSProperties}>
                    Ofrece: {m.ofrece}
                  </span>
                </div>

                <div className={styles.imBody}>
                  <div className={styles.imPeople}>
                    <div className={styles.imPerson}>
                      <span className={`${styles.imAvatar} ${styles.imAvEst}`}>{ini(m.est)}</span>
                      <span className={styles.imInfo}>
                        <b>{m.est}</b>
                        <small>{m.estCarrera}</small>
                        <span className={`${styles.imRol} ${styles.imRolEst}`}>Estudiante</span>
                      </span>
                    </div>
                    <span className={styles.imLink} aria-hidden>↔</span>
                    <div className={styles.imPerson}>
                      <span className={`${styles.imAvatar} ${styles.imAvEx}`}>{ini(m.ex)}</span>
                      <span className={styles.imInfo}>
                        <b>{m.ex}</b>
                        <small>{m.exRol} · {m.exEmpresa}</small>
                        <span className={`${styles.imRol} ${styles.imRolEx}`}>Exalumno</span>
                      </span>
                    </div>
                  </div>

                  <div className={styles.imAfin}>
                    {AFIN_META.map((a) => {
                      const on = m.afin[a.key];
                      return (
                        <span key={a.key} className={`${styles.imChip} ${on ? styles.imChipOn : styles.imChipOff}`}>
                          {a.label}{on && <b>+{a.pts}</b>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          className={styles.matchCtaWrap}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Link href="/registro" className={styles.matchCta}>
            Encontrá tu match <ArrowRight />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
