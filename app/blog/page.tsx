'use client';

// Espacio público de Comunidad / Blog (estudiantes, exalumnos y visitantes).
// Usa el Navbar de marca y comparte la UI con /comunidad (ComunidadFeed).

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import ComunidadFeed from '@/components/comunidad/ComunidadFeed';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-4">
        <ComunidadFeed />
      </main>
    </div>
  );
}
