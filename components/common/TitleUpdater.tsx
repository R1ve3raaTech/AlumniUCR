'use client';

// Actualiza el título de la pestaña según la ruta actual.
// La landing muestra solo "Alumni UCR"; el resto "Página — Alumni UCR".
// Las páginas son componentes de cliente, así que no pueden exportar metadata
// propia — este componente centraliza los títulos en un solo lugar.

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const MARCA = 'Alumni UCR';

// Nombres bonitos por prefijo de ruta (el más específico primero).
const TITULOS: [string, string][] = [
  ['/admin/matches', 'Gestión de Matches'],
  ['/admin/usuarios', 'Gestión de Usuarios'],
  ['/admin/donaciones', 'Gestión de Donaciones'],
  ['/admin/reportes', 'Reportes de Impacto'],
  ['/admin', 'Administración'],
  ['/login', 'Iniciar sesión'],
  ['/registro', 'Registro'],
  ['/recuperar', 'Recuperar contraseña'],
  ['/restablecer', 'Restablecer contraseña'],
  ['/definir-contrasena', 'Definir contraseña'],
  ['/dashboard', 'Dashboard'],
  ['/mentorias', 'Mentorías'],
  ['/mis-matches', 'Mis Matches'],
  ['/proyectos', 'Proyectos'],
  ['/directorio', 'Directorio'],
  ['/estudiantes', 'Estudiantes'],
  ['/donaciones', 'Donaciones'],
  ['/mis-donaciones', 'Mis Donaciones'],
  ['/posiciones', 'Posiciones'],
  ['/mis-posiciones', 'Mis Posiciones'],
  ['/mis-aplicaciones', 'Mis Aplicaciones'],
  ['/mi-curriculum', 'Mi Currículum'],
  ['/mi-legado', 'Mi Legado'],
  ['/voluntariado', 'Voluntariado'],
  ['/comunidad', 'Comunidad'],
  ['/blog', 'Blog'],
  ['/ayuda', 'Ayuda'],
  ['/terminos', 'Términos'],
  ['/configuracion-exalumno', 'Configuración'],
  ['/configuracion-voluntario', 'Configuración'],
  ['/configuracion', 'Configuración'],
  ['/perfil-estudiante', 'Mi Perfil'],
  ['/perfil-exalumno', 'Mi Perfil'],
  ['/completar-perfil', 'Completar perfil'],
  ['/onboarding', 'Bienvenida'],
];

// Fallback: "/mi-pagina-x" → "Mi Pagina X".
function tituloDesdeRuta(pathname: string): string {
  const segmento = pathname.split('/').filter(Boolean)[0] ?? '';
  if (!segmento) return '';
  return segmento
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export default function TitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === '/') {
      document.title = MARCA;
      return;
    }
    const conocido = TITULOS.find(([prefijo]) => pathname.startsWith(prefijo))?.[1];
    const titulo = conocido ?? tituloDesdeRuta(pathname);
    document.title = titulo ? `${titulo} — ${MARCA}` : MARCA;
  }, [pathname]);

  return null;
}
