import React from 'react';
import LandingShell from '@/components/landing/LandingShell';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import UCRImpacto from '@/components/landing/UCRImpacto';
import UCRAnexos from '@/components/landing/UCRAnexos';
import InfoUCR from '@/components/landing/Contacto'; // InfoUCR is in Contacto.tsx
import Footer from '@/components/landing/Footer';

// Landing público de UCR Connect. LandingShell (cliente) aporta el scope de GSAP;
// las secciones se renderizan en el servidor y se animan al entrar en viewport.
export default function Home() {
  return (
    <LandingShell>
      <Navbar />
      <main>
        <Hero />
        <UCRImpacto />
        <UCRAnexos />
        <InfoUCR />
      </main>
      <Footer />
    </LandingShell>
  );
}
