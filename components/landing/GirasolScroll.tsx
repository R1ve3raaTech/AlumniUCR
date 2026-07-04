'use client';

// Girasol decorativo de la landing: anclado arriba a la derecha (zona del
// hero), con solo la mitad visible. NO acompaña el scroll — queda en su lugar
// de la página — pero gira sobre su centro según el scroll (bajar = horario,
// subir = antihorario). No intercepta clics y se oculta en pantallas chicas.
// Imagen: /public/images/girasol.svg (vectorial, centrada, fondo transparente).

import React, { useEffect, useRef, useState } from 'react';

export default function GirasolScroll() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let raf = 0;

    const actualizar = () => {
      raf = 0;
      if (imgRef.current) {
        // Rotación proporcional al scroll: bajar aumenta el ángulo (horario)
        // y subir lo reduce (antihorario), de forma natural.
        imgRef.current.style.transform = `rotate(${window.scrollY * 0.15}deg)`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(actualizar);
    };

    actualizar();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        // Absoluto (no fixed): queda anclado arriba de la página, en la zona
        // del hero, y NO acompaña al usuario cuando scrollea.
        position: 'absolute',
        top: '110px',
        right: 0,
        // Corre el contenedor la mitad hacia afuera: solo asoma media flor.
        transform: 'translateX(50%)',
        width: 'min(560px, 46vw)',
        aspectRatio: '1 / 1',
        pointerEvents: 'none',
        zIndex: 30, // debajo de la mascota/chatbot, encima del contenido
      }}
      className="girasol-scroll"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/images/girasol.svg"
        alt=""
        onError={() => setVisible(false)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transition: 'transform 0.15s linear',
          willChange: 'transform',
          filter: 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.35))',
        }}
      />
      {/* Oculto en pantallas chicas: taparía demasiado contenido. */}
      <style jsx>{`
        @media (max-width: 768px) {
          .girasol-scroll {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
