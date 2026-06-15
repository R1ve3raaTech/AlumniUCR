'use client';

// Contenedor cliente del landing: define el scope para GSAP y ejecuta las
// animaciones (definidas en lib/animations/landing.ts) mediante useGSAP, que
// se encarga del cleanup automático al desmontar y de no correr en SSR.

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { initLandingAnimations } from '@/lib/animations/landing';
import styles from './landing.module.css';

gsap.registerPlugin(useGSAP);

export default function LandingShell({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      initLandingAnimations(scope.current);
    },
    { scope },
  );

  return (
    <div ref={scope} className={styles.landing}>
      {children}
    </div>
  );
}
