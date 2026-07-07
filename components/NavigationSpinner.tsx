'use client';

// Overlay de transición entre páginas. Antes aparecía en TODO el sitio (incluso
// en /login, /recuperar, la landing); ahora solo en las pantallas "principales"
// que de verdad cargan datos pesados al navegar — el resto no muestra nada.

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Rutas donde sí vale la pena mostrar el aviso de carga. '/' se compara exacto
// (si no, un prefijo vacío haría match con TODAS las rutas del sitio); el resto
// son prefijos (cubren subrutas, ej. /mi-legado/arbol).
const RUTA_EXACTA = ['/'];
const RUTAS_PRINCIPALES = ['/dashboard', '/mi-legado', '/mentorias/exalumno', '/login', '/registro', '/donaciones', '/mis-donaciones'];

export default function NavigationSpinner() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const esPrincipal =
    RUTA_EXACTA.includes(pathname || '') || RUTAS_PRINCIPALES.some((r) => pathname?.startsWith(r));

  useEffect(() => {
    if (!esPrincipal) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!esPrincipal || !loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div
        style={{ background: 'rgba(9, 10, 15, 0.5)', backdropFilter: 'blur(4px)' }}
        className="absolute inset-0"
      />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <img src="/images/girasol.svg" alt="" aria-hidden className="h-16 w-16" style={{ animation: 'girar 1.6s linear infinite' }} />
        <span className="text-xs font-bold tracking-widest text-white">Cargando…</span>
      </div>

      <style>{`
        @keyframes girar { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
