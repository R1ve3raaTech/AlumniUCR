import React from 'react';
import AlumniLogo from '../AlumniLogo';

interface BrandLogoProps {
  /** Conservado por compatibilidad; el logo trae su propio fondo de marca. */
  light?: boolean;
}

/**
 * Marca de la aplicación: logo oficial Alumni UCR. Delega en <AlumniLogo />
 * (único punto de verdad). Se mantiene el nombre y la prop `light` para no
 * alterar a Navbar/Footer que ya lo consumen.
 */
export default function BrandLogo({ light = false }: BrandLogoProps) {
  return <AlumniLogo height={light ? 44 : 40} />;
}
