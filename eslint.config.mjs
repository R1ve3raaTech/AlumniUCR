// Configuración de ESLint (flat config, ESLint 9).
// Next.js 16 eliminó el comando `next lint`, así que el script `npm run lint`
// ahora invoca ESLint directamente contra esta configuración.
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  {
    // Artefactos de build, dependencias y código ajeno al app de Next.
    // BackEnd/ queda fuera a propósito: es un paquete Express independiente
    // (su propio package.json, CommonJS), así que las reglas de Next/TS del
    // frontend no aplican — marcaba cada `require()` legítimo como error.
    ignores: [
      '.next/**',
      'node_modules/**',
      'BackEnd/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
      'Skill GSAP/**',
      'skills/**',
      'docs/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    // Baseline del retrofit: ESLint se agregó sobre un código ya escrito, así
    // que lo que es deuda de estilo queda en 'warn' (visible, no bloquea) y
    // solo lo que rompe de verdad queda en 'error'. Al bajar el conteo de
    // warnings, subir estas reglas a 'error' una por una.
    rules: {
      // 78 usos de `any` heredados: tipar es trabajo aparte, no un bug.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Reglas nuevas de la era React Compiler (react-hooks v7). Señalan humo
      // real, pero cambiarlas puede alterar comportamiento: backlog, no gate.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      // Falsos positivos acá: los `Date.now()` que marca están dentro de
      // handlers de eventos, no en el render.
      'react-hooks/purity': 'warn',
    },
  },
];

export default config;
