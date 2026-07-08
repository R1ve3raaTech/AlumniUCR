// ProyectoGraduacionProvider ahora vive en el layout raíz (app/layout.tsx),
// para que también esté disponible en /perfil-estudiante. Este layout queda
// como passthrough simple (no se elimina el archivo para no tocar la
// estructura de rutas del módulo).
export default function ProyectoGraduacionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
