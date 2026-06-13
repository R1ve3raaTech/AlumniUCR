// Animaciones GSAP del landing de UCR Connect.
//
// Funciones puras (sin React): reciben el elemento raíz (scope) y crean los
// tweens/timelines usando atributos data-anim para seleccionar los objetivos.
// La integración con React (cleanup, SSR) la maneja components/landing/LandingShell.tsx
// mediante useGSAP, que revierte automáticamente todo lo creado aquí.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Selector helper acotado al scope. */
const q = (scope: HTMLElement, sel: string) =>
  Array.from(scope.querySelectorAll<HTMLElement>(sel));

/**
 * Entrada del hero: el texto y la composición visual aparecen en secuencia.
 */
function animateHero(scope: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

  tl.from(q(scope, '[data-anim="hero-text"] > *'), {
    y: 28,
    opacity: 0,
    stagger: 0.12,
  }).from(
    q(scope, '[data-anim="hero-card"]'),
    { scale: 0.85, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.6)' },
    '-=0.4',
  );

  // Parádlax suave de las formas decorativas al hacer scroll del hero.
  q(scope, '[data-anim="shape"]').forEach((shape, i) => {
    gsap.to(shape, {
      y: i % 2 === 0 ? 60 : -50,
      ease: 'none',
      scrollTrigger: {
        trigger: '[data-anim="hero"]',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/**
 * Revela los grupos marcados con [data-anim="reveal"] al entrar en viewport.
 * Anima los hijos directos con un stagger.
 */
function animateReveals(scope: HTMLElement) {
  q(scope, '[data-anim="reveal"]').forEach((group) => {
    const items = Array.from(group.children) as HTMLElement[];
    gsap.set(items, { opacity: 1 }); // anula el opacity:0 base (.animItem) antes de animar
    gsap.from(items, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: group,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}

/**
 * Conteo numérico de las estadísticas marcadas con [data-count="<valor>"].
 * Respeta sufijos no numéricos (p. ej. "+", "k+", "%").
 */
function animateStats(scope: HTMLElement) {
  q(scope, '[data-count]').forEach((el) => {
    const raw = el.dataset.count || '';
    const target = parseFloat(raw.replace(/[^\d.]/g, ''));
    const suffix = raw.replace(/[\d.,]/g, '');
    if (Number.isNaN(target)) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: 'power1.out',
      scrollTrigger: { 
        trigger: el, 
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString('es-CR') + suffix;
      },
    });
  });
}

/**
 * Animación interactiva con scroll para la sección Institucional (InfoUCR).
 * Utiliza stagger para la entrada de textos y parallax (scrub) en la imagen
 * y la forma decorativa superpuesta.
 */
function animateInfo(scope: HTMLElement) {
  const section = scope.querySelector('[data-anim="info-split"]');
  if (!section) return;

  // Entrada de textos
  gsap.from(q(scope, '[data-anim="info-text"] > *'), {
    x: -40,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  // Entrada del contenedor de la imagen
  gsap.from(q(scope, '[data-anim="info-visual"]'), {
    x: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  // Efecto parallax sutil en la imagen con scroll
  q(scope, '[data-anim="info-image"]').forEach((img) => {
    gsap.to(img, {
      y: 40, // La imagen subirá mientras el contenedor baja
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Efecto parallax acentuado en el círculo decorativo
  q(scope, '[data-anim="info-shape"]').forEach((shape) => {
    gsap.to(shape, {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  });
}

/**
 * Efecto "Magnético" para botones. El elemento sigue suavemente al cursor del ratón.
 */
function animateMagnetic(scope: HTMLElement) {
  q(scope, '[data-anim="magnetic"]').forEach((el) => {
    // Solo aplicar en dispositivos con puntero (no touch)
    if (window.matchMedia('(hover: none)').matches) return;
    
    el.addEventListener('mousemove', (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = e.clientX - left - width / 2;
      const y = e.clientY - top - height / 2;
      
      gsap.to(el, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.6,
        ease: 'power3.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { 
        x: 0, 
        y: 0, 
        duration: 1, 
        ease: 'elastic.out(1, 0.3)' 
      });
    });
  });
}

/**
 * Efecto Tilt 3D. El contenedor detecta el ratón e inclina sus elementos hijos.
 */
function animateTilt(scope: HTMLElement) {
  q(scope, '[data-anim="tilt-container"]').forEach((container) => {
    if (window.matchMedia('(hover: none)').matches) return;
    
    // Podemos usar clases específicas o el atributo data-anim
    const targets = Array.from(container.children) as HTMLElement[];
    
    container.addEventListener('mousemove', (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5; // -0.5 a 0.5
      const y = (e.clientY - top) / height - 0.5; // -0.5 a 0.5
      
      gsap.to(targets, {
        rotationY: x * 25,
        rotationX: -y * 25,
        z: 30, // Levantar un poco en Z
        transformPerspective: 1000,
        transformOrigin: "center center",
        duration: 0.6,
        ease: 'power2.out',
      });
    });

    container.addEventListener('mouseleave', () => {
      gsap.to(targets, {
        rotationY: 0,
        rotationX: 0,
        z: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });
}

/**
 * Animación creativa para las tarjetas de Impacto de la UCR.
 * Entran desde abajo con un efecto de persiana (stagger).
 */
function animateImpactCards(scope: HTMLElement) {
  q(scope, '[data-anim="impact-cards"]').forEach((group) => {
    gsap.from(group.children, {
      y: 80,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    });
  });
}

/**
 * Animación para la sección de Anexos:
 * 1. El texto fijo (sticky) entra suavemente desde la izquierda.
 * 2. Las tarjetas de anexos se revelan a medida que haces scroll.
 */
function animateAnexos(scope: HTMLElement) {
  // Panel izquierdo
  q(scope, '[data-anim="sticky-panel"]').forEach((panel) => {
    gsap.from(panel.children, {
      x: -60,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });
  });

  // Tarjetas derechas
  q(scope, '[data-anim="anexo-card"]').forEach((card) => {
    gsap.from(card, {
      scale: 0.9,
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
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
  animateInfo(scope);
  animateImpactCards(scope);
  animateAnexos(scope);
  animateMagnetic(scope);
  animateTilt(scope);
}
