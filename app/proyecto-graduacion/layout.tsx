'use client';

import { ProyectoGraduacionProvider } from '@/context/ProyectoGraduacionContext';

export default function ProyectoGraduacionLayout({ children }: { children: React.ReactNode }) {
  return <ProyectoGraduacionProvider>{children}</ProyectoGraduacionProvider>;
}
