'use client';

// Átomo 3D de la sección Impacto. Cada órbita es una métrica (Conexiones, Éxito
// de Match, Mentores, Proyectos) y se entrelazan girando en 3D. Render en canvas
// con requestAnimationFrame. Config definida en MAQUETA-IMPACTO-ATOMO.html.
// Perspectiva: 1400.

import React, { useEffect, useRef } from 'react';
import styles from './landing.module.css';

const PERSP = 1400;
const CFG = { vel: 0.8, esize: 1.9, glow: 0.05, trail: 14, linkO: 0.35, nuc: 1.65, rad: 1.1 };

interface Orbita {
  label: string; valor: string; color: string;
  radius: number; speed: number; tiltX: number; tiltZ: number;
  phase: number; trail: { x: number; y: number }[];
}

const ORBITAS: Orbita[] = [
  { label: 'Conexiones', valor: '+1200', color: '#54BCEB', radius: 150, speed: 1.0, tiltX: 18, tiltZ: 0, phase: 0, trail: [] },
  { label: 'Éxito de Match', valor: '85%', color: '#007D67', radius: 120, speed: 1.35, tiltX: 70, tiltZ: 35, phase: 1.2, trail: [] },
  { label: 'Mentores', valor: '450', color: '#FFC72C', radius: 190, speed: 0.8, tiltX: 115, tiltZ: -25, phase: 2.4, trail: [] },
  { label: 'Proyectos Activos', valor: '+50', color: '#F34B26', radius: 165, speed: 1.1, tiltX: 50, tiltZ: 75, phase: 3.6, trail: [] },
];

type P3 = { x: number; y: number; z: number };
const rad = (d: number) => (d * Math.PI) / 180;
const rotX = (p: P3, a: number): P3 => { const c = Math.cos(a), s = Math.sin(a); return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c }; };
const rotZ = (p: P3, a: number): P3 => { const c = Math.cos(a), s = Math.sin(a); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z }; };
const hexA = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

export default function AtomoImpacto() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let cx = 0, cy = 0, raf = 0, t = 0;
    const orbs = ORBITAS.map((o) => ({ ...o, trail: [] as { x: number; y: number }[] }));

    const resize = () => {
      const r = cv.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = r.width / 2; cy = r.height / 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const punto = (o: Orbita, th: number) => {
      let p: P3 = { x: Math.cos(th) * o.radius * CFG.rad, y: Math.sin(th) * o.radius * CFG.rad, z: 0 };
      p = rotX(p, rad(o.tiltX)); p = rotZ(p, rad(o.tiltZ));
      const sc = PERSP / (PERSP + p.z);
      return { sx: cx + p.x * sc, sy: cy + p.y * sc, z: p.z, sc };
    };
    const depthA = (z: number) => Math.max(0.12, Math.min(1, (PERSP - z) / (PERSP * 1.4)));

    const frame = () => {
      t += 0.016;
      const w = cv.width, h = cv.height;
      ctx.clearRect(0, 0, w, h);

      // glow central
      const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, 230);
      ng.addColorStop(0, 'rgba(0,76,99,0.30)'); ng.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ng; ctx.fillRect(0, 0, w, h);

      // anillos (órbitas) con profundidad
      orbs.forEach((o) => {
        ctx.lineWidth = 1.4;
        const steps = 90;
        for (let i = 0; i < steps; i++) {
          const p0 = punto(o, (i / steps) * Math.PI * 2);
          const p1 = punto(o, ((i + 1) / steps) * Math.PI * 2);
          ctx.strokeStyle = hexA(o.color, depthA((p0.z + p1.z) / 2) * 0.5);
          ctx.beginPath(); ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy); ctx.stroke();
        }
      });

      // electrones
      const elec = orbs.map((o) => {
        o.phase += 0.016 * CFG.vel * o.speed;
        const p = punto(o, o.phase);
        o.trail.push({ x: p.sx, y: p.sy }); if (o.trail.length > CFG.trail) o.trail.shift();
        return { ...p, o };
      });

      // líneas de entrelazado (todas con todas)
      ctx.lineWidth = 1.1;
      for (let i = 0; i < elec.length; i++) for (let j = i + 1; j < elec.length; j++) {
        const g = ctx.createLinearGradient(elec[i].sx, elec[i].sy, elec[j].sx, elec[j].sy);
        g.addColorStop(0, hexA(elec[i].o.color, CFG.linkO)); g.addColorStop(1, hexA(elec[j].o.color, CFG.linkO));
        ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(elec[i].sx, elec[i].sy); ctx.lineTo(elec[j].sx, elec[j].sy); ctx.stroke();
      }

      // núcleo pulsante
      const nr = 26 * CFG.nuc * (1 + Math.sin(t * 2) * 0.08);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, nr * 2.2);
      cg.addColorStop(0, 'rgba(255,255,255,0.95)'); cg.addColorStop(0.4, 'rgba(84,188,235,0.8)'); cg.addColorStop(1, 'rgba(0,76,99,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, nr * 2.2, 0, 7); ctx.fill();
      ctx.fillStyle = '#eaf7fb'; ctx.beginPath(); ctx.arc(cx, cy, nr * 0.5, 0, 7); ctx.fill();

      // electrones (orden por profundidad)
      elec.sort((a, b) => b.z - a.z).forEach((e) => {
        if (CFG.trail > 0) {
          ctx.strokeStyle = hexA(e.o.color, 0.22); ctx.lineWidth = 2;
          ctx.beginPath(); e.o.trail.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
        }
        const r = (7 * CFG.esize) * e.sc;
        const a = depthA(e.z);
        if (CFG.glow > 0) {
          const gg = ctx.createRadialGradient(e.sx, e.sy, 0, e.sx, e.sy, r * 4);
          gg.addColorStop(0, hexA(e.o.color, 0.55 * CFG.glow * a)); gg.addColorStop(1, hexA(e.o.color, 0));
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(e.sx, e.sy, r * 4, 0, 7); ctx.fill();
        }
        ctx.fillStyle = hexA(e.o.color, a); ctx.beginPath(); ctx.arc(e.sx, e.sy, r, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`; ctx.beginPath(); ctx.arc(e.sx - r * 0.3, e.sy - r * 0.3, r * 0.3, 0, 7); ctx.fill();
        ctx.font = '700 12px "Segoe UI",sans-serif'; ctx.fillStyle = hexA('#ffffff', a); ctx.textAlign = 'center';
        ctx.fillText(e.o.valor, e.sx, e.sy - r - 7);
      });

      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className={styles.atomoCanvas} aria-hidden />;
}
