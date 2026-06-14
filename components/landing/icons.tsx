// Íconos SVG inline del landing. Se usan como componentes para evitar depender
// de una fuente de íconos externa y mantener el control de tamaño/color por CSS
// (heredan currentColor). Cada uno acepta className.

import React from 'react';

type IconProps = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const ArrowRight = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);

export const ArrowLeft = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M19 12H5m7 7-7-7 7-7" />
  </svg>
);

export const ArrowTrend = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M3 12h18m-6-6 6 6-6 6" />
  </svg>
);

export const ArrowUp = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M12 19V5m-7 7 7-7 7 7" />
  </svg>
);

export const Mail = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

export const Phone = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// Comillas decorativas (relleno sólido)
export const Quote = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6.83v-6.83H5.5a3.67 3.67 0 0 1 3.67-3.67V6zm10 0A5.17 5.17 0 0 0 12 11.17V18h6.83v-6.83H15.5a3.67 3.67 0 0 1 3.67-3.67V6z" />
  </svg>
);

export const Linkedin = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17V9.99H6V17h2.34zM7.17 8.93a1.36 1.36 0 1 0 0-2.72 1.36 1.36 0 0 0 0 2.72zM18 17v-3.84c0-2.05-1.1-3-2.56-3-1.18 0-1.71.65-2 1.11V9.99H11.1V17h2.34v-3.91c0-.21.02-.41.08-.56.16-.41.54-.84 1.17-.84.83 0 1.16.63 1.16 1.55V17H18z" />
  </svg>
);

export const Instagram = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
  </svg>
);

export const Facebook = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
  </svg>
);
