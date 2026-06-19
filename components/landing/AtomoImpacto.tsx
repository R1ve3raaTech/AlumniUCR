'use client';

// Átomo 3D de la sección Impacto. Cada órbita es una métrica (Conexiones, Éxito
// de Match, Mentores, Proyectos) y se entrelazan girando en 3D. Render en canvas.
// Perspectiva 1400. Rotación lenta + sombra de contacto para que se sienta como
// un objeto 3D real dentro del div.

import React, { useEffect, useRef } from 'react';
import styles from './landing.module.css';

const PERSP = 1400;
const SPIN = 0.16; // rotación lenta del átomo (sensación de objeto 3D)
const CFG = { vel: 0.8, esize: 2.1, glow: 0.38, trail: 18, linkO: 0.5, nuc: 1.7, rad: 1.2 };

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

// Radio máximo proyectado (la órbita más grande con la perspectiva al frente),
// para autoajustar el átomo al canvas y que ninguna órbita se corte.
const MAXR = Math.max(...ORBITAS.map((o) => o.radius)) * 1.2;
const MARGEN = 44; // espacio para electrón + etiqueta

type P3 = { x: number; y: number; z: number };
const rad = (d: number) => (d * Math.PI) / 180;
const rotX = (p: P3, a: number): P3 => { const c = Math.cos(a), s = Math.sin(a); return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c }; };
const rotY = (p: P3, a: number): P3 => { const c = Math.cos(a), s = Math.sin(a); return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c }; };
const rotZ = (p: P3, a: number): P3 => { const c = Math.cos(a), s = Math.sin(a); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z }; };
const hexA = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

export default function AtomoImpacto() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let cx = 0, cy = 0, raf = 0, t = 0, spin = 0, fit = 1;
    const orbs = ORBITAS.map((o) => ({ ...o, trail: [] as { x: number; y: number }[] }));

    // Logo Alumni UCR como núcleo central
    const logo = new Image();
    let logoReady = false;
    logo.onload = () => { logoReady = true; };
    logo.src = '/images/alumni_mejor-removebg-preview.png';

    const resize = () => {
      const r = cv.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = r.width / 2; cy = r.height / 2;
      // autoajuste: que la órbita más grande (proyectada) quepa con margen
      const half = Math.min(r.width, r.height) / 2;
      const frontScale = PERSP / (PERSP - MAXR);
      // crece hasta llenar el espacio (cap 1.6) -> en un canvas grande el átomo
      // y el logo central se ven más grandes; nunca se corta.
      fit = Math.max(0.4, Math.min(1.6, (half - MARGEN) / (MAXR * frontScale)));
    };
    resize();
    window.addEventListener('resize', resize);

    const punto = (o: Orbita, th: number) => {
      const rr = o.radius * CFG.rad * fit;
      let p: P3 = { x: Math.cos(th) * rr, y: Math.sin(th) * rr, z: 0 };
      p = rotX(p, rad(o.tiltX)); p = rotZ(p, rad(o.tiltZ));
      p = rotY(p, spin);
      const sc = PERSP / (PERSP + p.z);
      return { sx: cx + p.x * sc, sy: cy + p.y * sc, z: p.z, sc };
    };
    const depthA = (z: number) => Math.max(0.14, Math.min(1, (PERSP - z) / (PERSP * 1.3)));

    const frame = () => {
      t += 0.016; spin += 0.016 * SPIN;
      const w = cv.width, h = cv.height;
      ctx.clearRect(0, 0, w, h);

      // sombra de contacto (ancla el átomo, suave sobre fondo claro)
      const shY = cy + 150 * fit, shR = 210 * fit;
      const sh = ctx.createRadialGradient(cx, shY, 0, cx, shY, shR);
      sh.addColorStop(0, 'rgba(0,42,55,0.22)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save(); ctx.translate(cx, shY); ctx.scale(1, 0.26); ctx.fillStyle = sh;
      ctx.beginPath(); ctx.arc(0, 0, shR, 0, 7); ctx.fill(); ctx.restore();

      // halo central suave (tinte de marca, sin fondo sólido)
      const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260);
      ng.addColorStop(0, 'rgba(84,188,235,0.16)'); ng.addColorStop(1, 'rgba(84,188,235,0)');
      ctx.fillStyle = ng; ctx.fillRect(0, 0, w, h);

      // anillos (órbitas) con grosor por profundidad (frente más grueso)
      orbs.forEach((o) => {
        const steps = 96;
        for (let i = 0; i < steps; i++) {
          const p0 = punto(o, (i / steps) * Math.PI * 2);
          const p1 = punto(o, ((i + 1) / steps) * Math.PI * 2);
          const da = depthA((p0.z + p1.z) / 2);
          ctx.lineWidth = 1.1 + da * 2.4;
          ctx.strokeStyle = hexA(o.color, da * 0.78);
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
      for (let i = 0; i < elec.length; i++) for (let j = i + 1; j < elec.length; j++) {
        const da = (depthA(elec[i].z) + depthA(elec[j].z)) / 2;
        ctx.lineWidth = 1.2 + da * 1.2;
        const g = ctx.createLinearGradient(elec[i].sx, elec[i].sy, elec[j].sx, elec[j].sy);
        g.addColorStop(0, hexA(elec[i].o.color, CFG.linkO * da)); g.addColorStop(1, hexA(elec[j].o.color, CFG.linkO * da));
        ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(elec[i].sx, elec[i].sy); ctx.lineTo(elec[j].sx, elec[j].sy); ctx.stroke();
      }

      // núcleo: halo de energía + disco claro + LOGO Alumni UCR al centro
      const nr = 27 * CFG.nuc * fit * (1 + Math.sin(t * 2) * 0.09);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, nr * 2.4);
      cg.addColorStop(0, 'rgba(84,188,235,0.5)'); cg.addColorStop(0.5, 'rgba(84,188,235,0.22)'); cg.addColorStop(1, 'rgba(84,188,235,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, nr * 2.4, 0, 7); ctx.fill();
      const wd = ctx.createRadialGradient(cx, cy, 0, cx, cy, nr * 1.5);
      wd.addColorStop(0, 'rgba(255,255,255,0.95)'); wd.addColorStop(0.68, 'rgba(255,255,255,0.78)'); wd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = wd; ctx.beginPath(); ctx.arc(cx, cy, nr * 1.5, 0, 7); ctx.fill();
      if (logoReady) {
        const ar = logo.naturalWidth / logo.naturalHeight || 1;
        let lh = nr * 1.95, lw = lh * ar;
        if (lw > nr * 3.1) { lw = nr * 3.1; lh = lw / ar; }
        ctx.drawImage(logo, cx - lw / 2, cy - lh / 2, lw, lh);
      } else {
        ctx.fillStyle = '#004C63'; ctx.beginPath(); ctx.arc(cx, cy, nr * 0.5, 0, 7); ctx.fill();
      }

      // electrones (orden por profundidad)
      elec.sort((a, b) => b.z - a.z).forEach((e) => {
        if (CFG.trail > 0) {
          ctx.strokeStyle = hexA(e.o.color, 0.28); ctx.lineWidth = 3;
          ctx.beginPath(); e.o.trail.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
        }
        const r = (8.5 * CFG.esize) * fit * e.sc;
        const a = depthA(e.z);
        const gg = ctx.createRadialGradient(e.sx, e.sy, 0, e.sx, e.sy, r * 4.2);
        gg.addColorStop(0, hexA(e.o.color, 0.9 * CFG.glow * a)); gg.addColorStop(1, hexA(e.o.color, 0));
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(e.sx, e.sy, r * 4.2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(e.sx, e.sy, r, 0, 7);
        ctx.fillStyle = hexA(e.o.color, a); ctx.fill();
        ctx.lineWidth = 1.4 * e.sc; ctx.strokeStyle = `rgba(0,40,55,${0.32 * a})`; ctx.stroke(); // borde: definición en fondo claro
        ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`; ctx.beginPath(); ctx.arc(e.sx - r * 0.32, e.sy - r * 0.32, r * 0.32, 0, 7); ctx.fill();
        ctx.font = '800 13px "Segoe UI",sans-serif'; ctx.fillStyle = hexA('#01303f', a); ctx.textAlign = 'center';
        ctx.fillText(e.o.valor, e.sx, e.sy - r - 8);
      });

      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className={styles.atomoCanvas} aria-hidden />;
}
