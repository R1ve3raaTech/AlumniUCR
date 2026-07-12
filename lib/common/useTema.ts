'use client';

// Modo oscuro/claro real del área de estudiante (Preferencias del Sistema en
// /configuracion). Alterna la clase "dark" en <html>, que sobreescribe los
// tokens --st-* (Stitch) definidos en globals.css. Solo afecta esas pantallas;
// el resto del sitio no usa esos tokens.

import { useCallback, useEffect, useState } from 'react';

const CLAVE = 'ct_tema';
export type Tema = 'claro' | 'oscuro';

function aplicar(tema: Tema) {
  document.documentElement.classList.toggle('dark', tema === 'oscuro');
}

export function useTema() {
  const [tema, setTema] = useState<Tema>('claro');

  useEffect(() => {
    const guardado = (localStorage.getItem(CLAVE) as Tema | null) || 'claro';
    setTema(guardado);
    aplicar(guardado);
  }, []);

  const alternar = useCallback(() => {
    setTema((actual) => {
      const siguiente: Tema = actual === 'claro' ? 'oscuro' : 'claro';
      localStorage.setItem(CLAVE, siguiente);
      aplicar(siguiente);
      return siguiente;
    });
  }, []);

  return { tema, alternar };
}
