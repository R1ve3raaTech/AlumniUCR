import React from 'react';
import LandingShell from '@/components/landing/LandingShell';
import Navbar from '@/components/landing/Navbar';
import Servicios from '@/components/landing/Servicios';
import Footer from '@/components/landing/Footer';

export default function ServiciosPage() {
  return (
    <LandingShell>
      <Navbar />
      <main style={{ paddingTop: '40px', minHeight: '80vh' }}>
        <Servicios />
      </main>
      <Footer />
    </LandingShell>
  );
}
