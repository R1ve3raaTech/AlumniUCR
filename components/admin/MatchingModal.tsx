'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './MatchingModal.module.css';

interface Mentor {
  id: string;
  nombre: string;
  empresa?: string;
  cargo?: string;
  facultad?: string | null;
  carrera?: string | null;
  areasComunes: string[];
  interdisciplinario: boolean;
  score: number;
}

interface Proyecto {
  id: number;
  titulo: string;
  descripcion?: string;
  avance: number;
  estudiante: { nombre: string; carrera?: string | null; facultad?: string | null };
  areas: string[];
  mentores: Mentor[];
}

interface Props {
  proyecto: Proyecto | null;
  onClose: () => void;
}

export default function MatchingModal({ proyecto, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Animación de entrada
  useEffect(() => {
    if (!proyecto || !backdropRef.current || !panelRef.current) return;

    const tl = gsap.timeline();
    tl.fromTo(backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' }
    ).fromTo(panelRef.current,
      { opacity: 0, y: 60, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' },
      '-=0.1'
    );

    return () => { tl.kill(); };
  }, [proyecto]);

  function handleClose() {
    if (!backdropRef.current || !panelRef.current) { onClose(); return; }
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panelRef.current, { opacity: 0, y: 40, scale: 0.96, duration: 0.25, ease: 'power2.in' })
      .to(backdropRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');
  }

  if (!proyecto) return null;

  const interdisciplinares = proyecto.mentores.filter((m) => m.interdisciplinario).length;

  return (
    <div className={styles.backdrop} ref={backdropRef} onClick={handleClose}>
      <div
        className={styles.panel}
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.badge}>Matching Interdisciplinario</span>
            <h2 id="modal-titulo" className={styles.titulo}>{proyecto.titulo}</h2>
            <div className={styles.estudiante}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
                <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
              </svg>
              <strong>{proyecto.estudiante.nombre}</strong>
              {proyecto.estudiante.facultad && <span>· {proyecto.estudiante.facultad}</span>}
              {proyecto.estudiante.carrera && <span>· {proyecto.estudiante.carrera}</span>}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Progreso */}
        <div className={styles.progresoSection}>
          <div className={styles.progresoInfo}>
            <span className={styles.progresoLabel}>Avance del proyecto</span>
            <span className={styles.progresoValor}>{proyecto.avance}%</span>
          </div>
          <div className={styles.barra}>
            <div className={styles.barraFill} style={{ width: `${proyecto.avance}%` }} />
          </div>
        </div>

        {/* Áreas temáticas */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Áreas temáticas</h3>
          <div className={styles.chips}>
            {proyecto.areas.map((a) => (
              <span key={a} className={styles.areaChip}>{a}</span>
            ))}
          </div>
        </div>

        {/* Stats rápidos */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statN}>{proyecto.mentores.length}</span>
            <span className={styles.statL}>Mentores</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statN}>{interdisciplinares}</span>
            <span className={styles.statL}>Interdisciplinares</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statN}>{proyecto.areas.length}</span>
            <span className={styles.statL}>Áreas</span>
          </div>
        </div>

        {/* Lista de mentores */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Mentores recomendados ({proyecto.mentores.length})</h3>
          {proyecto.mentores.length === 0 ? (
            <p className={styles.vacio}>Sin coincidencias por ahora.</p>
          ) : (
            <div className={styles.mentoresList}>
              {proyecto.mentores.map((m, i) => (
                <div key={m.id} className={styles.mentorCard} style={{ '--delay': `${i * 0.06}s` } as React.CSSProperties}>
                  <div className={styles.mentorTop}>
                    <div className={styles.mentorAvatar}>{m.nombre.charAt(0).toUpperCase()}</div>
                    <div className={styles.mentorInfo}>
                      <div className={styles.mentorName}>
                        <strong>{m.nombre}</strong>
                        {m.interdisciplinario && <span className={styles.interBadge}>Interdisciplinario</span>}
                      </div>
                      {(m.cargo || m.empresa) && (
                        <span className={styles.mentorCargo}>
                          {m.cargo}{m.empresa ? ` @ ${m.empresa}` : ''}
                        </span>
                      )}
                      {m.facultad && <span className={styles.mentorFacultad}>{m.facultad}</span>}
                    </div>
                    <div className={styles.scoreChip}>
                      <span className={styles.scoreN}>{Math.round(m.score * 100) || '—'}</span>
                      <span className={styles.scoreL}>score</span>
                    </div>
                  </div>
                  {m.areasComunes.length > 0 && (
                    <div className={styles.areasComunes}>
                      {m.areasComunes.map((a) => (
                        <span key={a} className={styles.comunChip}>{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
