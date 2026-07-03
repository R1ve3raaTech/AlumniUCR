// Animaciones GSAP del landing de Alumni UCR.
//
// Funciones puras (sin React): reciben el elemento raÃ­z (scope) y crean los
// tweens usando atributos data-anim para seleccionar los objetivos. La
// integraciÃ³n con React (cleanup, SSR) la maneja components/landing/LandingShell.tsx
// mediante useGSAP, que revierte automÃ¡ticamente todo lo creado aquÃ­.

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
 * diseÃ±o original, pero gestionado con ScrollTrigger.
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
 * Conteo numÃ©rico de las mÃ©tricas marcadas con [data-count="<valor>"].
 * Respeta prefijos/sufijos no numÃ©ricos (p. ej. "+1,200", "85%").
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
 * Efecto de realce dinÃ¡mico sobre "Talento" y "Experiencia" en el hero.
 * Un highlight naranja barre la palabra de izquierda a derecha,
 * el texto aparece encima y luego el highlight se desvanece.
 * Talento primero, Experiencia despuÃ©s.
 */
function animateWordHighlight(scope: HTMLElement) {
  const talBar = scope.querySelector<HTMLElement>('[data-anim-bar="talento"]');
  const talTxt = scope.querySelector<HTMLElement>('[data-anim-wtext="talento"]');
  const expBar = scope.querySelector<HTMLElement>('[data-anim-bar="experiencia"]');
  const expTxt = scope.querySelector<HTMLElement>('[data-anim-wtext="experiencia"]');

  if (!talBar || !talTxt || !expBar || !expTxt) return;

  const tl = gsap.timeline({ delay: 0.9, repeat: -1, repeatDelay: 3.5 });

  // TALENTO: barre â†’ texto aparece â†’ highlight se desvanece
  tl.to(talBar, { scaleX: 1, opacity: 0.72, duration: 0.38, ease: 'power2.inOut' })
    .to(talTxt, { opacity: 1, duration: 0.22, ease: 'power1.out' }, '-=0.18')
    .to(talBar, { opacity: 0, duration: 0.38, ease: 'power2.in' }, '+=0.12')

    // EXPERIENCIA: igual pero mÃ¡s lento (palabra mÃ¡s larga)
    .to(expBar, { scaleX: 1, opacity: 0.72, duration: 0.5, ease: 'power2.inOut' }, '+=0.08')
    .to(expTxt, { opacity: 1, duration: 0.25, ease: 'power1.out' }, '-=0.22')
    .to(expBar, { opacity: 0, duration: 0.38, ease: 'power2.in' }, '+=0.12');
}

/**
 * Punto de entrada Ãºnico. Lo invoca LandingShell dentro de useGSAP.
 * Todo lo creado queda en el contexto de useGSAP y se revierte al desmontar.
 */
export function initLandingAnimations(scope: HTMLElement | null) {
  if (!scope) return;
  animateHero(scope);
  animateWordHighlight(scope);
  animateReveals(scope);
  animateStats(scope);
}
