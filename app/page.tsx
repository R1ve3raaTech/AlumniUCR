import React from 'react';
import LandingShell from '@/components/landing/LandingShell';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Servicios from '@/components/landing/Servicios';
import Historia from '@/components/landing/Historia';
import Contacto from '@/components/landing/Contacto';
import Footer from '@/components/landing/Footer';

// Landing público de UCR Connect. LandingShell (cliente) aporta el scope de GSAP;
// las secciones se renderizan en el servidor y se animan al entrar en viewport.
export default function Home() {
  return (
    <LandingShell>
      <Navbar />
      <main>
        <Hero />
        <Servicios />
        <Historia />
        <Contacto />
      </main>
      <Footer />
    </LandingShell>
  );
}
