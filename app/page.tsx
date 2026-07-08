import React from 'react';
import LandingShell from '@/components/landing/LandingShell';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import MatchingSeccion from '@/components/landing/MatchingSeccion';
import Impacto from '@/components/landing/Impacto';
import ProyectosGraduacion from '@/components/landing/ProyectosGraduacion';
import Testimonios from '@/components/landing/Testimonios';
import CTAFinal from '@/components/landing/CTAFinal';
import MisionFundacion from '@/components/landing/MisionFundacion';
import Footer from '@/components/landing/Footer';
import ScrollToHero from '@/components/landing/ScrollToHero';
import GirasolScroll from '@/components/landing/GirasolScroll';

// Landing pÃºblico de Alumni UCR (diseÃ±o Stitch adaptado a CSS Modules + GSAP).
// LandingShell (cliente) aporta el scope de GSAP; las secciones se renderizan en
// el servidor y se animan al entrar en viewport.
export default function Home() {
  return (
    <LandingShell>
      <Navbar />
      <main>
        <Hero />
        <MatchingSeccion />
        <ProyectosGraduacion />
        <MisionFundacion />
        <Testimonios />
        <CTAFinal />
        <Impacto />
      </main>
      <Footer />
      <ScrollToHero />
      <GirasolScroll />
    </LandingShell>
  );
}
