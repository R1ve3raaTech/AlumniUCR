import React from 'react';

interface AlumniLogoProps {
  /** Alto del logo en píxeles (el ancho se ajusta proporcionalmente). */
  height?: number;
  className?: string;
}

/**
 * Logo oficial Alumni UCR. Se sirve desde /public/images/alumni-ucr-logo.svg,
 * por lo que para usar otra versión basta con reemplazar ese archivo (mismo
 * nombre) sin tocar el código. Único punto de verdad de la marca en la app.
 */
export default function AlumniLogo({ height = 40, className }: AlumniLogoProps) {
  return (
    <img
      src="/images/alumni-ucr-logo.svg"
      alt="Alumni UCR"
      className={className}
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}
