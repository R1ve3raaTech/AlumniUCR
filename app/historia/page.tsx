import React from 'react';
import LandingShell from '@/components/landing/LandingShell';
import Navbar from '@/components/landing/Navbar';
import Historia from '@/components/landing/Historia';
import Footer from '@/components/landing/Footer';

export default function HistoriaPage() {
  return (
    <LandingShell>
      <Navbar />
      <main style={{ paddingTop: '40px', minHeight: '80vh' }}>
        <Historia />
      </main>
      <Footer />
    </LandingShell>
  );
}
