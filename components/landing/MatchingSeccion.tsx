'use client';

// Sección Matching: layout "info + showcase". A la izquierda la información y la
// leyenda de puntajes; a la derecha 2 columnas de tarjetas-perfil que bajan en
// marquee escalonado (con máscara circular difuminada para el efecto de
// aparición). Cada tarjeta-perfil (estilo "carta de match") muestra foto,
// nombre/edad, carrera, qué busca, una cita, su proyecto destacado, hashtags y
// acciones (descartar / conectar / guardar).
//
// NOTA: los perfiles son ejemplos realistas e ilustrativos (no de base real).

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './landing.module.css';

type Busca = 'Empleo' | 'Mentoría' | 'Pasantía' | 'Financiamiento';
interface Perfil {
  nombre: string; edad: number; carrera: string; busca: Busca;
  cita: string; proyecto: string; tags: string[];
  foto: string; proyImg: string;
}

const BUSCA_COLOR: Record<Busca, { bg: string; tx: string }> = {
  Empleo: { bg: '#FFC72C', tx: '#5a4600' },
  'Mentoría': { bg: '#54BCEB', tx: '#00303f' },
  'Pasantía': { bg: '#007D67', tx: '#ffffff' },
  Financiamiento: { bg: '#F34B26', tx: '#ffffff' },
};

const F = (id: string) => `/images/unsplash/${id}.jpg`;

const COL_A: Perfil[] = [
  { nombre: 'Carlos', edad: 24, carrera: 'Computación', busca: 'Empleo',
    cita: 'Desarrollador enfocado en Big Data y visualización. Mi TFG optimiza el análisis de datos universitarios. Busco mi primera oportunidad en tech.',
    proyecto: 'Data Analytics Dashboard', tags: ['BigData', 'Python', 'UCR'],
    foto: F('1507003211169-0a1dd7228f2d'), proyImg: F('1517694712202-14dd9538aa97') },
  { nombre: 'Valeria', edad: 23, carrera: 'Psicología', busca: 'Mentoría',
    cita: 'Investigo bienestar y salud mental digital. Busco una mentora que me guíe hacia la psicología organizacional.',
    proyecto: 'App Bienestar UCR', tags: ['SaludMental', 'UX', 'Investigación'],
    foto: F('1494790108377-be9c29b29330'), proyImg: F('1573497019940-1c28c88b4f3e') },
  { nombre: 'Diego', edad: 25, carrera: 'Ing. Eléctrica', busca: 'Pasantía',
    cita: 'Apasionado por la energía renovable. Diseñé micro-redes solares para comunidades rurales sin acceso a la red.',
    proyecto: 'SolarComunidad', tags: ['Energía', 'IoT', 'Sostenibilidad'],
    foto: F('1500648767791-00dcc994a43e'), proyImg: F('1509391366360-2e959784a276') },
  { nombre: 'Ana', edad: 22, carrera: 'Economía', busca: 'Financiamiento',
    cita: 'Creé una app de educación financiera gamificada para jóvenes. Busco inversión para llevarla al mercado.',
    proyecto: 'Fin-Connect', tags: ['Fintech', 'Edtech', 'Startup'],
    foto: F('1438761681033-6461ffad8d80'), proyImg: F('1554224155-6726b3ff858f') },
  { nombre: 'Laura', edad: 24, carrera: 'Ing. Ambiental', busca: 'Pasantía',
    cita: 'Monitoreo de calidad del agua con sensores de bajo costo. Quiero aplicar mi TFG en campo con una organización.',
    proyecto: 'AquaMonitor', tags: ['MedioAmbiente', 'Datos', 'Comunidad'],
    foto: F('1544005313-94ddf0286df2'), proyImg: F('1500375592092-40eb2168fd21') },
  { nombre: 'Mariana', edad: 23, carrera: 'Agronomía', busca: 'Mentoría',
    cita: 'Sensores IoT para cafetales. Busco mentoría de agrónomos con experiencia en cooperativas.',
    proyecto: 'AgroSensor Café', tags: ['Agrotech', 'Café', 'IoT'],
    foto: F('1534528741775-53994a69daeb'), proyImg: F('1500382017468-9049fed747ef') },
];

const COL_B: Perfil[] = [
  { nombre: 'Andrés', edad: 26, carrera: 'Biología', busca: 'Empleo',
    cita: 'Restauración de arrecifes en el Pacífico. Quiero sumarme a un equipo de conservación marina.',
    proyecto: 'BioReef', tags: ['BiologíaMarina', 'Conservación', 'Buceo'],
    foto: F('1506794778202-cad84cf45f1d'), proyImg: F('1532094349884-543bc11b234d') },
  { nombre: 'Sofía', edad: 24, carrera: 'Arquitectura', busca: 'Mentoría',
    cita: 'Diseño bioclimático para el trópico húmedo. Busco aprender de arquitectos en práctica sostenible.',
    proyecto: 'Casa Trópico', tags: ['Arquitectura', 'Sostenible', 'Diseño'],
    foto: F('1573496359142-b8d87734a5a2'), proyImg: F('1487958449943-2429e8be8625') },
  { nombre: 'José', edad: 25, carrera: 'Ing. Mecánica', busca: 'Pasantía',
    cita: 'Kits de robótica educativa para escuelas rurales. Busco una empresa aliada para escalar.',
    proyecto: 'EduRobótica', tags: ['Robótica', 'Educación', 'Maker'],
    foto: F('1519085360753-af0119f7cbe7'), proyImg: F('1485827404703-89b55fcc595e') },
  { nombre: 'Daniela', edad: 23, carrera: 'Comunicación', busca: 'Empleo',
    cita: 'Periodismo comunitario basado en datos. Busco mi primer puesto en medios digitales.',
    proyecto: 'Voces UCR', tags: ['Periodismo', 'Datos', 'Comunidad'],
    foto: F('1607746882042-944635dfe10e'), proyImg: F('1504384308090-c894fdcc538d') },
  { nombre: 'Tomás', edad: 24, carrera: 'Computación', busca: 'Empleo',
    cita: 'Backend e IA. Mi TFG es un asistente de matching. Busco trabajo en una startup de tecnología.',
    proyecto: 'MatchAI', tags: ['IA', 'Backend', 'Node'],
    foto: F('1492562080023-ab3db95bfbce'), proyImg: F('1518770660439-4636190af475') },
  { nombre: 'Camila', edad: 22, carrera: 'Diseño Gráfico', busca: 'Pasantía',
    cita: 'Branding e identidad visual. Busco una pasantía en un estudio creativo para crecer.',
    proyecto: 'Marca Viva', tags: ['Branding', 'UI', 'Ilustración'],
    foto: F('1517841905240-472988babdf9'), proyImg: F('1452860606245-08befc0ff44b') },
];

const ICns = {
  ext: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 5h5v5M19 5l-8 8M19 13v6H5V5h6" /></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>,
  heart: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.6-9.5-9C1 9 2.4 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.6 0 5 3.5 3.5 6.5C19 16.4 12 21 12 21z" /></svg>,
  save: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v16l-6-4-6 4z" /></svg>,
};

function Card({ p }: { p: Perfil }) {
  const bc = BUSCA_COLOR[p.busca];
  return (
    <div className={styles.imProfile}>
      <div className={styles.imPhoto}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.foto} alt={p.nombre} loading="lazy" />
        <span className={styles.imBusca} style={{ ['--bc']: bc.bg, ['--btc']: bc.tx } as React.CSSProperties}>
          Busca {p.busca}
        </span>
        <div className={styles.imPhotoName}>
          <b>{p.nombre}, {p.edad}</b>
          <small>{p.carrera}</small>
        </div>
      </div>
      <div className={styles.imProfBody}>
        <p className={styles.imQuote}>“{p.cita}”</p>
        <div className={styles.imProyecto}>
          <p className={styles.imProyTit}>Proyecto destacado</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.imProyImg} src={p.proyImg} alt={p.proyecto} loading="lazy" />
          <div className={styles.imProyName}>{p.proyecto} {ICns.ext}</div>
        </div>
        <div className={styles.imTags}>
          {p.tags.map((t) => <span key={t} className={styles.imTag}>#{t}</span>)}
        </div>
        <div className={styles.imActions}>
          <button type="button" className={styles.imAct} aria-label="Descartar">{ICns.x}</button>
          <button type="button" className={`${styles.imAct} ${styles.imActLike}`} aria-label="Conectar">{ICns.heart}</button>
          <button type="button" className={styles.imAct} aria-label="Guardar">{ICns.save}</button>
        </div>
      </div>
    </div>
  );
}

export default function MatchingSeccion() {
  const showcaseRef = React.useRef<HTMLDivElement>(null);
  const [enPantalla, setEnPantalla] = React.useState(true);

  // El marquee solo se anima mientras el showcase está en pantalla: componer
  // 2 columnas de tarjetas bajo la máscara difuminada durante todo el scroll
  // era una de las causas de que la landing se sintiera trabada.
  React.useEffect(() => {
    const el = showcaseRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setEnPantalla(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="matching" className={`${styles.section} ${styles.matchTapiz}`}>
      <div className={styles.container}>
        <div className={styles.imLayout}>
          {/* Info a la izquierda */}
          <motion.div
            className={styles.imInfo}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className={styles.matchHeader}>
              <h2 className={`${styles.sectionTitle} ${styles.headlineLg}`}>Matching <em>Inteligente</em></h2>
              <div className={styles.accentBar} />
              <p className={styles.matchSubtitle}>
                Estudiantes y Exalumnos ahora conectarán más rápido. Mientras más coincidencias,
                mayor será el puntaje del MATCH.
              </p>
            </div>
            <ul className={styles.imScoreLegend}>
              <li><span className={styles.imLegendDot} /> Misma carrera</li>
              <li><span className={styles.imLegendDot} /> Áreas de interés común</li>
              <li><span className={styles.imLegendDot} /> Temática de proyecto</li>
              <li><span className={styles.imLegendDot} /> Tipo de apoyo ofrecido</li>
            </ul>
            <Link href="/registro" className={styles.matchCta}>Encontrá tu match</Link>
          </motion.div>

          {/* Showcase: 2 columnas en marquee escalonado */}
          <div ref={showcaseRef} className={`${styles.imShowcase} ${enPantalla ? '' : styles.imQuieto}`} aria-hidden>
            <div className={`${styles.imColumn} ${styles.imColA}`}>
              {[...COL_A, ...COL_A].map((p, i) => <Card key={`a-${p.nombre}-${i}`} p={p} />)}
            </div>
            <div className={`${styles.imColumn} ${styles.imColB}`}>
              {[...COL_B, ...COL_B].map((p, i) => <Card key={`b-${p.nombre}-${i}`} p={p} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
