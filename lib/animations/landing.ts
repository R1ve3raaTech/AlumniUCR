// Animaciones GSAP del landing de UCR Connect.
//
// Funciones puras (sin React): reciben el elemento raíz (scope) y crean los
// tweens usando atributos data-anim para seleccionar los objetivos. La
// integración con React (cleanup, SSR) la maneja components/landing/LandingShell.tsx
// mediante useGSAP, que revierte automáticamente todo lo creado aquí.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Selector helper acotado al scope. */
const q = (scope: HTMLElement, sel: string) =>
  Array.from(scope.querySelectorAll<HTMLElement>(sel));

/** Entrada del hero: el texto aparece en secuencia y la imagen se desliza. */
function animateHero(scope: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

  tl.fromTo(q(scope, '[data-anim="hero-text"] > *'),
    { y: 40, opacity: 0, scale: 0.95, filter: 'blur(8px)' },
    { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', stagger: 0.15 }
  );

  const bgVideo = q(scope, '[data-anim="hero-bg-video"]');
  if (bgVideo.length) {
    tl.from(bgVideo, { 
      opacity: 0, 
      scale: 1.05,
      duration: 2,
      ease: 'power2.out'
    }, 0);
  }
}

/**
 * Revela los grupos marcados con [data-anim="reveal"] al entrar en viewport,
 * animando sus hijos directos con un stagger. Equivale al fade/slide-up del
 * diseño original, pero gestionado con ScrollTrigger.
 */
function animateReveals(scope: HTMLElement) {
  q(scope, '[data-anim="reveal"]').forEach((group) => {
    const items = Array.from(group.children) as HTMLElement[];
    gsap.set(items, { opacity: 1 }); // anula el opacity:0 base (.animItem)
    gsap.from(items, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}

/**
 * Conteo numérico de las métricas marcadas con [data-count="<valor>"].
 * Respeta prefijos/sufijos no numéricos (p. ej. "+1,200", "85%").
 */
function animateStats(scope: HTMLElement) {
  q(scope, '[data-count]').forEach((el) => {
    const raw = el.dataset.count || '';
    const target = parseFloat(raw.replace(/[^\d.]/g, ''));
    if (Number.isNaN(target)) return;

    const prefix = raw.startsWith('+') ? '+' : '';
    const suffix = raw.replace(/[\d.,+]/g, '');
    const obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: 'power1.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onUpdate: () => {
        el.textContent = prefix + Math.round(obj.val).toLocaleString('es-CR') + suffix;
      },
    });
  });
}

/**
 * Punto de entrada único. Lo invoca LandingShell dentro de useGSAP.
 * Todo lo creado queda en el contexto de useGSAP y se revierte al desmontar.
 */
export function initLandingAnimations(scope: HTMLElement | null) {
  if (!scope) return;
  animateHero(scope);
  animateReveals(scope);
  animateStats(scope);
}
