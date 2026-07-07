'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import { obtenerMiPerfilExalumno } from '@/lib/perfilExalumno';
import { obtenerMiLegado, obtenerLeaderboards } from '@/lib/fidelizacion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface Perfil {
  nombre?: string;
  correo_electronico?: string;
  estado?: string;
  roles?: { nombre?: string } | null;
  metadata?: { carreras?: string[]; escuela_facultad?: string; anio_graduacion?: number | string } | null;
}

const NAV = [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { key: 'mi-legado', icon: 'auto_awesome', label: 'Mi Legado', href: '/mi-legado' },
  { key: 'perfil', icon: 'person', label: 'Mi Perfil', href: '/perfil-exalumno' },
  { key: 'mentorias', icon: 'handshake', label: 'Mentorías', href: '/mentorias/exalumno' },
  { key: 'estudiantes', icon: 'group', label: 'Estudiantes', href: '/estudiantes' },
  { key: 'hacer-donacion', icon: 'volunteer_activism', label: 'Hacer donación', href: '/donaciones' },
  { key: 'mis-donaciones', icon: 'history', label: 'Mis donaciones', href: '/mis-donaciones' },
  { key: 'posiciones', icon: 'work', label: 'Posiciones', href: '/mis-posiciones' },
  { key: 'comunidad', icon: 'forum', label: 'Comunidad', href: '/blog' },
  { key: 'ayuda', icon: 'help', label: 'Ayuda', href: '/ayuda' },
];

const cardClass = 'rounded-2xl border border-outline-variant/60 bg-surface-container-lowest/80 backdrop-blur-md shadow-[0_8px_32px_-10px_rgba(0,40,55,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,42,55,0.18)] hover:border-secondary/40';

export default function MiLegadoPage() {
  const router = useRouter();
  const { user, token, loading, signOut } = useAuth();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [full, setFull] = useState<any | null>(null);
  const [legado, setLegado] = useState<any | null>(null);
  const [leaderboards, setLeaderboards] = useState<any | null>(null);
  const [cargandoLegado, setCargandoLegado] = useState(true);
  
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [subTab, setSubTab] = useState<'timeline' | 'insignias' | 'arbol' | 'leaderboard' | 'portafolio'>('timeline');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Redirección client-side si no hay sesión
  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  // Cargar datos
  useEffect(() => {
    if (!token) return;
    let activo = true;

    obtenerMiPerfilExalumno(token)
      .then((p) => {
        if (activo) {
          setPerfil(p?.data?.usuario ?? null);
          setFull(p?.data?.perfil ?? p ?? null);
        }
      })
      .catch((err) => console.error("Error al cargar perfil:", err));

    setCargandoLegado(true);
    obtenerMiLegado(token)
      .then((res) => {
        if (activo) setLegado(res?.data ?? res ?? null);
      })
      .catch((err) => console.error("Error al cargar legado:", err))
      .finally(() => {
        if (activo) setCargandoLegado(false);
      });

    obtenerLeaderboards(token)
      .then((res) => {
        if (activo) setLeaderboards(res?.data ?? res ?? null);
      })
      .catch((err) => console.error("Error al cargar leaderboards:", err));

    return () => {
      activo = false;
    };
  }, [token]);

  // Animación GSAP de entrada en cascada
  useGSAP(() => {
    if (!cargandoLegado) {
      gsap.fromTo('.anim-card',
        { y: 35, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, [cargandoLegado]);

  // Animaciones especiales al cambiar de sub-pestaña
  useGSAP(() => {
    if (subTab === 'leaderboard' && leaderboards) {
      // Animar barras de progreso
      gsap.fromTo('.progress-fill',
        { width: '0%' },
        { width: (i, el) => el.getAttribute('data-width') || '10%', duration: 1.2, ease: 'power2.out', stagger: 0.05 }
      );
    }
    if (subTab === 'timeline' && legado?.hitos) {
      // Animar nodos de la línea de tiempo
      gsap.fromTo('.timeline-node',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.05 }
      );
    }
    if (subTab === 'insignias' && legado?.insignias) {
      // Animar insignias con salto inicial
      gsap.fromTo('.insignia-badge',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.04 }
      );
    }
  }, [subTab, legado, leaderboards]);

  // Efecto 3D de hover para las insignias
  const handleMouseMoveInsignia = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Rotar sutilmente la insignia según la posición del cursor
    gsap.to(card.querySelector('.badge-icon-wrap'), {
      rotateY: x * 0.15,
      rotateX: -y * 0.15,
      scale: 1.08,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  const handleMouseLeaveInsignia = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget.querySelector('.badge-icon-wrap'), {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.4,
      ease: 'power3.out'
    });
  };

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  const nombre = perfil?.nombre || user?.email?.split('@')[0] || 'Exalumno';
  const primerNombre = nombre.split(' ')[0];
  const iniciales = nombre.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const foto = full?.foto_perfil || '';
  const facultad = full?.escuela_facultad || '—';
  const anio = full?.anio_graduacion || '—';

  // Mostrar cargando inicial si está hidratándose
  if (loading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ucr-surface font-brand-body text-ucr-on-surface">
        Cargando…
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8F9FA] font-body-base text-on-background antialiased flex">
      {/* Sidebar */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuAbierto(false)} aria-hidden />
      )}
      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col gap-2 border-r border-outline-variant bg-surface-container-low p-6 transition-transform duration-300 lg:translate-x-0 ${menuAbierto ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        <Link href="/" className="mb-8 flex items-center justify-center py-2" aria-label="Alumni UCR — inicio">
          <AlumniLogo height={52} />
        </Link>
        <div className="mb-8 flex flex-col items-center px-4 text-center">
          <div className="relative mb-3">
            {foto ? (
              <img src={foto} alt={nombre} className="h-24 w-24 rounded-full border-2 border-primary object-cover shadow-sm" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-primary bg-primary/10 font-display-lg text-2xl font-bold text-primary">{iniciales || 'E'}</div>
            )}
            <span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-surface-container-low bg-secondary text-on-secondary" title="Exalumno verificado">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </span>
          </div>
          <h2 className="font-body-semibold text-primary">{nombre}</h2>
          <p className="text-xs font-bold uppercase tracking-tight text-on-surface-variant">Exalumno · Mentor</p>
        </div>
        <nav className="flex flex-grow flex-col gap-1">
          {NAV.map((item) => (
            <Link key={item.key} href={item.href}
              className={item.key === 'mi-legado'
                ? 'flex items-center gap-4 rounded-lg bg-primary-container p-3.5 font-bold text-on-primary-container'
                : 'flex items-center gap-4 rounded-lg p-3.5 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface'}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
        <button type="button" onClick={handleSignOut}
          className="mt-auto flex items-center gap-4 rounded-lg border-t border-outline-variant p-3.5 pt-6 text-on-surface-variant transition-all hover:text-error"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-semibold">Cerrar sesión</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-outline-variant bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sm:px-8">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-variant lg:hidden"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          <span className="font-brand-body text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">stars</span> Mi Impacto Histórico
          </span>

          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-bold text-on-surface">{nombre}</p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Mentor</p>
            </div>
            {foto ? (
              <img src={foto} alt={nombre} className="h-10 w-10 rounded-full border-2 border-primary object-cover" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary">{iniciales || 'E'}</div>
            )}
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1440px] mx-auto w-full space-y-6">
          
          {/* Título de Página */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">Mi Legado en la UCR</h1>
              <p className="text-sm text-on-surface-variant mt-1">Sigue de cerca las semillas de conocimiento y solidaridad que has sembrado en la red.</p>
            </div>
            <Link href="/dashboard" className="flex items-center gap-1.5 self-start md:self-auto rounded-xl bg-white border border-outline-variant px-4 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-surface-variant/20 shadow-sm">
              <span className="material-symbols-outlined text-sm">dashboard</span> Volver al Dashboard
            </Link>
          </div>

          {cargandoLegado ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-on-surface-variant animate-pulse font-brand-body">Calculando tu impacto académico...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6 items-start">
              
              {/* Columna Izquierda: Ciclo de vida y Tabs de Legacy */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                
                {/* Holographic Certificate - Ciclo de Vida */}
                {legado?.cicloVida && (
                  <div className="relative overflow-hidden rounded-3xl border border-secondary/30 bg-gradient-to-br from-primary to-[#002C3B] p-6 sm:p-8 text-white shadow-xl anim-card">
                    <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-secondary/15 blur-3xl opacity-60" />
                    <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-primary-container/10 blur-2xl" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 border border-white/15 text-secondary shrink-0 shadow-inner">
                        <span className="material-symbols-outlined text-3xl font-light">workspace_premium</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/15 px-3 py-1 rounded-full border border-secondary/20">
                          Etapa de Impacto Activo
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black">{legado.cicloVida.etapa}</h2>
                        <p className="text-sm opacity-90 leading-relaxed font-light">{legado.cicloVida.etapaDescripcion}</p>
                      </div>
                    </div>

                    <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
                      <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">tips_and_updates</span> Recomendaciones estratégicas para tu nivel:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {legado.cicloVida.consejos.map((c: string, idx: number) => (
                          <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-2">
                            <span className="material-symbols-outlined text-sm text-secondary shrink-0 mt-0.5">verified</span>
                            <span className="text-xs opacity-90 leading-normal">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Bento Legacy Container */}
                <div className={`${cardClass} p-6 sm:p-8 anim-card`}>
                  {/* Selectores de SubTabs */}
                  <div className="mb-6 flex flex-wrap gap-1 border-b border-outline-variant/60 pb-3 text-xs sm:text-sm font-brand-body overflow-x-auto">
                    {[
                      { key: 'timeline', label: 'Línea de Tiempo', icon: 'route' },
                      { key: 'insignias', label: 'Mis Insignias', icon: 'shield' },
                      { key: 'arbol', label: 'Árbol de Impacto', icon: 'account_tree' },
                      { key: 'leaderboard', label: 'Desafíos UCR', icon: 'rewarded_ads' },
                      { key: 'portafolio', label: 'Co-Creaciones', icon: 'business_center' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setSubTab(tab.key as any)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
                          subTab === tab.key
                            ? 'bg-primary text-on-primary shadow-md scale-[1.02]'
                            : 'hover:bg-surface-variant hover:text-on-surface text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* 1. LÍNEA DE TIEMPO INTERACTIVA */}
                  {subTab === 'timeline' && (
                    <div className="relative border-l-2 border-primary/20 pl-6 ml-3 py-2 space-y-8 font-brand-body">
                      {(legado?.hitos || []).length === 0 ? (
                        <p className="text-sm text-on-surface-variant py-4 italic">No hay hitos registrados aún en tu cuenta.</p>
                      ) : (
                        legado.hitos.map((h: any, idx: number) => (
                          <div key={idx} className="relative timeline-node">
                            {/* Checkpoint flotante */}
                            <span className={`absolute -left-[39px] top-0 grid h-9 w-9 place-items-center rounded-full border-2 border-white shadow-md ${
                              h.tipo === 'exito'
                                ? 'bg-emerald-500 text-white'
                                : h.tipo === 'donacion'
                                ? 'bg-secondary text-primary'
                                : h.tipo === 'conexion'
                                ? 'bg-[#FF9B18] text-white'
                                : 'bg-primary text-white'
                            }`}>
                              <span className="material-symbols-outlined text-[18px]">{h.icono}</span>
                            </span>
                            
                            <div className="bg-surface-container-low/60 border border-outline-variant/40 p-4 rounded-2xl hover:border-secondary/30 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                <h4 className="font-bold text-primary text-sm sm:text-base flex items-center gap-2">
                                  {h.titulo}
                                  {h.tipo === 'exito' && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />}
                                </h4>
                                <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full font-bold self-start sm:self-auto shadow-inner">
                                  {new Date(h.fecha).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">{h.descripcion}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 2. MIS INSIGNIAS 3D */}
                  {subTab === 'insignias' && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 font-brand-body">
                      {(legado?.insignias || []).map((ins: any) => (
                        <div
                          key={ins.id}
                          onMouseMove={handleMouseMoveInsignia}
                          onMouseLeave={handleMouseLeaveInsignia}
                          className={`insignia-badge flex flex-col items-center p-5 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                            ins.desbloqueado
                              ? 'bg-gradient-to-b from-white to-surface-container-low border-secondary/30 hover:border-secondary/70 shadow-sm'
                              : 'bg-surface-container-low border-outline-variant/30 opacity-40 grayscale select-none'
                          }`}
                        >
                          {ins.desbloqueado && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-transparent pointer-events-none" />
                          )}
                          
                          {/* Contenedor icono insignia */}
                          <div className="badge-icon-wrap preserve-3d grid h-16 w-16 place-items-center rounded-full mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white relative">
                            {ins.desbloqueado && (
                              <div className="absolute inset-0.5 rounded-full border border-secondary/20 bg-secondary/5 animate-pulse" />
                            )}
                            <span className={`material-symbols-outlined text-3xl ${
                              ins.desbloqueado ? 'text-secondary font-bold' : 'text-outline/80'
                            }`}>{ins.icono}</span>
                          </div>
                          
                          <h5 className="font-black text-xs text-primary mb-1">{ins.nombre}</h5>
                          <p className="text-[10px] text-on-surface-variant leading-normal font-light">{ins.descripcion}</p>
                          
                          {ins.desbloqueado && (
                            <span className="mt-3 inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold text-emerald-800 uppercase tracking-widest shadow-sm">
                              ✓ Obtenida
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. ÁRBOL DE IMPACTO INTERACTIVO */}
                  {subTab === 'arbol' && (
                    <div className="space-y-6 font-brand-body">
                      {/* Nodo Raíz (Mentor del exalumno en el pasado) */}
                      {legado?.arbolImpacto?.mentorRaiz ? (
                        <div className="relative flex flex-col items-center">
                          <div className="bg-gradient-to-r from-primary to-[#002C3B] text-white rounded-2xl px-5 py-3 shadow-md text-center max-w-sm border border-white/10">
                            <span className="text-[8px] font-black uppercase tracking-widest text-secondary block mb-1">Tu Mentor de Origen</span>
                            <h4 className="font-bold text-xs sm:text-sm">{legado.arbolImpacto.mentorRaiz.nombre}</h4>
                            <p className="text-[9px] opacity-75">{legado.arbolImpacto.mentorRaiz.correo}</p>
                          </div>
                          
                          {/* Línea de conexión al nodo central */}
                          <div className="h-8 w-0.5 bg-gradient-to-b from-primary to-secondary" />
                        </div>
                      ) : null}

                      {/* Nodo Central (El Exalumno actual) */}
                      <div className="flex flex-col items-center">
                        <div className="bg-white border-2 border-secondary rounded-2xl px-6 py-4 shadow-md text-center max-w-sm relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 -z-10" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-secondary block mb-1">Tú (Origen del Legado)</span>
                          <h4 className="font-black text-sm text-primary">{nombre}</h4>
                          <p className="text-[10px] text-on-surface-variant">{facultad} · Clase {anio}</p>
                        </div>
                        
                        {(legado?.arbolImpacto?.ramas || []).length > 0 && (
                          <div className="h-8 w-0.5 bg-secondary" />
                        )}
                      </div>

                      {/* Nodos Hijos (Estudiantes mentoreados) */}
                      {(legado?.arbolImpacto?.ramas || []).length === 0 ? (
                        <div className="rounded-2xl border border-outline-variant/60 p-6 bg-surface-container-low text-center max-w-md mx-auto">
                          <span className="material-symbols-outlined text-4xl text-outline mb-2">account_tree</span>
                          <h4 className="font-bold text-xs text-primary mb-1">Tu árbol no tiene ramas aún</h4>
                          <p className="text-[10px] text-on-surface-variant">
                            Se generarán nodos por cada estudiante que apoyes con mentorías o donaciones en la plataforma.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                          {legado.arbolImpacto.ramas.map((est: any) => (
                            <div key={est.id} className="relative flex flex-col items-center">
                              {/* Línea horizontal puente */}
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-secondary" />
                              
                              <div className={`w-full bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative ${
                                est.estadoMatch === 'cerrado' ? 'border-emerald-200 bg-emerald-50/10' : 'border-outline-variant'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-primary">{est.nombre}</span>
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                    est.estadoMatch === 'cerrado' ? 'bg-emerald-100 text-emerald-800' : 'bg-secondary-container text-on-secondary-container'
                                  }`}>
                                    {est.estadoMatch === 'cerrado' ? 'Egresado' : 'Estudiante'}
                                  </span>
                                </div>
                                
                                {est.esMentorActivo ? (
                                  <div className="mt-2.5 pl-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 space-y-1">
                                    <p className="font-black flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs fill-current">eco</span>
                                      ¡Multiplicador Activo!
                                    </p>
                                    <p className="font-light leading-normal">
                                      Este egresado ha tomado tu ejemplo y ahora mentorea a: <strong>{est.hijos.join(', ')}</strong>.
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-on-surface-variant font-light italic mt-1">Colaborando activamente para consolidar su proyecto.</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. LEADERBOARDS (DESAFÍOS UNIVERSITARIOS) */}
                  {subTab === 'leaderboard' && (
                    <div className="space-y-8 font-brand-body">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Generaciones */}
                        <div className="rounded-2xl border border-outline-variant/60 p-5 bg-surface-container-low/40">
                          <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">event</span> Generaciones Líderes
                          </h4>
                          <div className="space-y-4">
                            {(leaderboards?.generaciones || []).length === 0 ? (
                              <p className="text-xs text-on-surface-variant">Cargando estadísticas...</p>
                            ) : (
                              leaderboards.generaciones.map((g: any, idx: number) => {
                                const esMiGen = String(g.gen) === String(legado?.cicloVida?.anioGraduacion);
                                // Normalización para porcentaje de barra (máx. 100)
                                const maxScore = Math.max(...leaderboards.generaciones.map((x: any) => x.scoreTotal), 1);
                                const pct = Math.round((g.scoreTotal / maxScore) * 100);

                                return (
                                  <div key={g.gen} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-body-semibold">
                                      <span className="flex items-center gap-1.5">
                                        <span className={`font-bold ${idx < 3 ? 'text-secondary' : 'opacity-50'}`}>#{idx + 1}</span>
                                        <span className={esMiGen ? 'font-bold text-primary' : 'font-medium'}>Clase {g.gen}</span>
                                        {esMiGen && <span className="text-[8px] bg-primary text-white rounded px-1">Tú</span>}
                                      </span>
                                      <span className="text-on-surface-variant text-[10px] font-bold">{g.mentores} Mentores · {g.matches} Conexiones</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden border border-outline-variant/40">
                                      <div
                                        className={`h-full rounded-full progress-fill ${esMiGen ? 'bg-primary' : 'bg-secondary'}`}
                                        data-width={`${pct}%`}
                                        style={{ width: '0%' }}
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Facultades */}
                        <div className="rounded-2xl border border-outline-variant/60 p-5 bg-surface-container-low/40">
                          <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">school</span> Facultades Destacadas
                          </h4>
                          <div className="space-y-4">
                            {(leaderboards?.facultades || []).length === 0 ? (
                              <p className="text-xs text-on-surface-variant">Cargando estadísticas...</p>
                            ) : (
                              leaderboards.facultades.map((f: any, idx: number) => {
                                const esMiFac = f.facultad === legado?.cicloVida?.escuelaFacultad || f.facultad === facultad;
                                const maxScore = Math.max(...leaderboards.facultades.map((x: any) => x.scoreTotal), 1);
                                const pct = Math.round((f.scoreTotal / maxScore) * 100);

                                return (
                                  <div key={f.facultad} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-body-semibold">
                                      <span className="flex items-center gap-1.5 min-w-0 flex-1">
                                        <span className={`font-bold ${idx < 3 ? 'text-secondary' : 'opacity-50'}`}>#{idx + 1}</span>
                                        <span className={`truncate ${esMiFac ? 'font-bold text-primary' : 'font-medium'}`} title={f.facultad}>{f.facultad}</span>
                                        {esMiFac && <span className="text-[8px] bg-primary text-white rounded px-1 shrink-0">Tú</span>}
                                      </span>
                                      <span className="text-on-surface-variant text-[10px] font-bold shrink-0">{f.mentores} Mentores · {f.matches} Conexiones</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden border border-outline-variant/40">
                                      <div
                                        className={`h-full rounded-full progress-fill ${esMiFac ? 'bg-primary' : 'bg-secondary'}`}
                                        data-width={`${pct}%`}
                                        style={{ width: '0%' }}
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                      </div>
                      
                      <div className="bg-surface-container-low/50 border border-outline-variant/50 p-4 rounded-xl text-center text-[10px] text-on-surface-variant italic leading-relaxed">
                        <p>💡 <strong>¿Cómo funciona el ranking?</strong> Sumamos 10 puntos por cada conexión activa/cerrada, 5 puntos por mentor y añadimos un score proporcional a las donaciones confirmadas de sus miembros.</p>
                      </div>
                    </div>
                  )}

                  {/* 5. PORTAFOLIO DE CO-CREACIÓN */}
                  {subTab === 'portafolio' && (
                    <div className="space-y-5 font-brand-body">
                      {(legado?.portafolio || []).length === 0 ? (
                        <div className="rounded-2xl border border-outline-variant/60 p-8 bg-surface-container-low/40 text-center max-w-sm mx-auto">
                          <span className="material-symbols-outlined text-4xl text-outline mb-2">workspace_premium</span>
                          <h4 className="font-bold text-xs text-primary mb-1">Sin co-creaciones culminadas</h4>
                          <p className="text-[10px] text-on-surface-variant max-w-xs mx-auto font-light leading-normal">
                            Tu portafolio recopila y formatea los TFGs que guiaste a feliz término. ¡Comparte el éxito conjunto en LinkedIn para inspirar a más profesionales!
                          </p>
                        </div>
                      ) : (
                        legado.portafolio.map((port: any) => (
                          <div key={port.idMatch} className="rounded-2xl border border-outline-variant p-6 bg-surface-container-low/40 flex flex-col gap-4">
                            <div>
                              <h4 className="font-bold text-primary text-sm sm:text-base">Proyecto: "{port.tituloProyecto}"</h4>
                              <p className="text-xs text-on-surface-variant mt-1.5">Estudiante guiado: <strong className="text-primary">{port.nombreEstudiante}</strong></p>
                            </div>
                            
                            <div className="bg-white px-4 py-3 rounded-xl text-xs sm:text-sm italic text-on-surface-variant border border-outline-variant/50 leading-relaxed font-light select-all">
                              "{port.compartirTexto}"
                            </div>
                            
                            <div className="flex gap-2 self-end">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(port.compartirTexto);
                                  setCopiedId(port.idMatch);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-xs font-bold text-primary hover:bg-surface-container transition-colors shadow-sm"
                              >
                                <span className="material-symbols-outlined text-sm">{copiedId === port.idMatch ? 'done' : 'content_copy'}</span>
                                <span>{copiedId === port.idMatch ? 'Copiado' : 'Copiar texto'}</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(port.compartirTexto);
                                  window.open('https://www.linkedin.com/sharing/share-offsite/', '_blank');
                                }}
                                className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold text-on-secondary hover:brightness-110 transition-all shadow-sm"
                              >
                                <span className="material-symbols-outlined text-sm">share</span>
                                <span>Compartir en LinkedIn</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Columna Derecha: Bento Resumen de Impacto */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                
                {/* Bento Card: Estadísticas Acumuladas */}
                <div className={`${cardClass} p-6 sm:p-7 anim-card bg-gradient-to-b from-white to-surface-container-low`}>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-5 flex items-center gap-1.5 border-b border-outline-variant/50 pb-2">
                    <span className="material-symbols-outlined text-secondary text-sm">analytics</span> Resumen General
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-outline-variant/50 p-4 rounded-xl text-center">
                      <p className="font-display-lg text-2xl font-black text-secondary">{legado?.hitos?.length || 1}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Hitos logrados</p>
                    </div>
                    
                    <div className="bg-white border border-outline-variant/50 p-4 rounded-xl text-center">
                      <p className="font-display-lg text-2xl font-black text-secondary">
                        {legado?.insignias?.filter((x: any) => x.desbloqueado).length || 0}/5
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Medallas</p>
                    </div>

                    <div className="bg-white border border-outline-variant/50 p-4 rounded-xl text-center">
                      <p className="font-display-lg text-2xl font-black text-secondary">
                        {legado?.arbolImpacto?.ramas?.length || 0}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Hijos guiados</p>
                    </div>

                    <div className="bg-white border border-outline-variant/50 p-4 rounded-xl text-center">
                      <p className="font-display-lg text-2xl font-black text-secondary">
                        {legado?.portafolio?.length || 0}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Tesis exitosas</p>
                    </div>
                  </div>
                </div>

                {/* Llamado a la Acción de Apoyo */}
                <div className={`${cardClass} p-6 sm:p-7 anim-card bg-primary text-white relative overflow-hidden`}>
                  <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-secondary bg-white/10 px-2 py-0.5 rounded-full">
                      ¿Quieres seguir sumando?
                    </span>
                    <h3 className="text-lg font-bold">Ayuda a financiar proyectos estudiantiles</h3>
                    <p className="text-xs opacity-90 leading-relaxed font-light">
                      Hay decenas de estudiantes con beca socioeconómica que buscan tu ayuda para comprar materiales, licencias o hardware para sus TFGs.
                    </p>
                    <Link href="/donaciones" className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-xs font-bold text-primary transition-all hover:scale-[1.02] shadow-sm font-brand-body">
                      Realizar donación <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                    </Link>
                  </div>
                </div>
                
              </div>

            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-outline-variant bg-white py-5 text-center text-xs text-on-surface-variant">
          <AlumniLogo height={26} /> © 2026 Alumni UCR · Universidad de Costa Rica
        </footer>
      </div>
    </div>
  );
}
