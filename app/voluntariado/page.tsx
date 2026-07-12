'use client';

// Página pública /voluntariado: single-page con Navbar, Hero, "Cómo puedes
// ayudar" y el formulario dinámico "Quiero ayudar". Reemplaza el destino del
// enlace "Voluntariado"; /registro/otros (el formulario simple del flujo de
// registro) sigue existiendo sin cambios, comparten el mismo endpoint del BE.

import React, { useState } from 'react';
import AlumniLogo from '@/components/common/AlumniLogo';
import VoluntariadoNavbar from '@/components/voluntariado/VoluntariadoNavbar';
import Hero from '@/components/voluntariado/Hero';
import ComoAyudar from '@/components/voluntariado/ComoAyudar';
import FormularioAyuda, { type TipoAyuda } from '@/components/voluntariado/FormularioAyuda';

export default function VoluntariadoPage() {
  const [tipoElegido, setTipoElegido] = useState<TipoAyuda | null>(null);

  return (
    <div className="min-h-screen bg-white font-brand-body text-ucr-on-surface">
      <VoluntariadoNavbar />
      <Hero />
      <ComoAyudar onElegir={setTipoElegido} />
      <FormularioAyuda tipoPreseleccionado={tipoElegido} />

      <footer className="flex flex-col items-center gap-3 border-t border-ucr-outline-variant px-4 py-8 text-center text-xs text-ucr-on-surface-variant">
        <AlumniLogo height={28} />
        © 2026 Alumni UCR. Todos los derechos reservados.
      </footer>
    </div>
  );
}
