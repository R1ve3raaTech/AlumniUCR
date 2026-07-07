'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import { obtenerMiPerfilExalumno } from '@/lib/perfilExalumno';
import { obtenerMiLegado } from '@/lib/fidelizacion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface Perfil {
  nombre?: string;
  correo_electronico?: string;
  estado?: string;
  roles?: { nombre?: string } | null;
  metadata?: { carreras?: string[]; escuela_facultad?: string; anio_graduacion?: number | string } | null;
}

const REQUISITOS_LOGROS = {
  pionero: {
    comoConseguir: 'Regístrate en la plataforma Conectando Talento de exalumnos UCR.',
    recompensas: '+10 XP y Rango base de inicio.'
  },
  mecenas: {
    comoConseguir: 'Realiza al menos una donación económica confirmada en la sección de donaciones.',
    recompensas: '+30 XP y desbloquea el color dorado del perfil.'
  },
  mentor_activo: {
    comoConseguir: 'Establece y mantén activa al menos una mentoría de tesis con un estudiante de la red.',
    recompensas: '+15 XP y acceso a métricas detalladas en el árbol.'
  },
  mentor_oro: {
    comoConseguir: 'Completa con éxito el proceso de acompañamiento de tesis hasta que el estudiante se gradúe.',
    recompensas: '+50 XP y mención especial en el muro de honor de exalumnos.'
  },
  gran_impacto: {
    comoConseguir: 'Guía exitosamente a 3 o más estudiantes hasta su graduación, o dona un total superior a 250,000 CRC.',
    recompensas: '+100 XP, Rango Master Boss (Aura cyan animada) y visualización holográfica avanzada.'
  }
};

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

export default function MiLegadoPage() {
  const router = useRouter();
  const { user, token, loading, signOut } = useAuth();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [full, setFull] = useState<any | null>(null);
  const [legado, setLegado] = useState<any | null>(null);
  const [cargandoLegado, setCargandoLegado] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Redireccionar si no hay sesión
  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  // Cargar datos del perfil y legado
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

    return () => {
      activo = false;
    };
  }, [token]);

  // Animación de entrada GSAP
  useGSAP(() => {
    if (!cargandoLegado) {
      gsap.fromTo('.anim-card',
        { y: 25, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.06, ease: 'power3.out', delay: 0.05 }
      );
    }
  }, [cargandoLegado]);

  // Efecto 3D de hover para las insignias
  const handleMouseMoveInsignia = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
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
  const iniciales = nombre.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const foto = full?.foto_perfil || '';
  const facultad = full?.escuela_facultad || 'Facultad de Ciencias';
  const anio = full?.anio_graduacion || '2016';

  // Métricas obtenidas directamente de la API (calculadas en backend)
  const totalSemillas = legado?.resumen?.totalSemillas ?? 4;
  const totalDonadoVal = legado?.resumen?.totalDonado ?? 500000;
  const totalHoras = legado?.resumen?.totalHoras ?? 76;

  if (loading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] font-brand-body text-[#004857]">
        Cargando…
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8F9FA] font-brand-body text-slate-800 antialiased flex select-none">
      {/* Sidebar de Navegación */}
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
          <p className="text-sm font-bold uppercase tracking-tight text-on-surface-variant">Exalumno · Mentor</p>
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

      {/* Area Principal del Contenido */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Cabecera */}
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
              <p className="text-base font-bold text-on-surface">{nombre}</p>
              <p className="text-xs uppercase tracking-wider text-on-surface-variant">Mentor</p>
            </div>
            {foto ? (
              <img src={foto} alt={nombre} className="h-10 w-10 rounded-full border-2 border-primary object-cover" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary">{iniciales || 'E'}</div>
            )}
          </div>
        </header>

        {/* Cuerpo Principal del Dashboard */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1440px] mx-auto w-full space-y-8">
          
          {/* Título de Página */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">Mi Legado UCR</h1>
              <p className="text-base text-on-surface-variant mt-1">Monitorea y explora las semillas académicas, mentorías y aportes financieros sembrados.</p>
            </div>
            <Link href="/dashboard" className="flex items-center gap-1.5 self-start md:self-auto rounded-xl bg-white border border-outline-variant px-4 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-surface-variant/20 shadow-sm">
              <span className="material-symbols-outlined text-sm">dashboard</span> Volver al Dashboard
            </Link>
          </div>

          {cargandoLegado ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 border-4 border-[#005B70] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500 animate-pulse font-brand-body">Cargando tu legado histórico...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Columna Izquierda (8 cols): Tarjeta Principal del Árbol e Hitos */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Bento Principal: Acceso al Árbol */}
                <div className="anim-card bg-gradient-to-br from-[#005B70] to-[#004857] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-[#005B70]/10 flex flex-col justify-between min-h-[260px]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                  <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-3">
                    <span className="text-[11.5px] font-mono tracking-widest text-cyan-300 uppercase font-black bg-white/10 px-3 py-1 rounded-full">
                      Visualizador Holográfico de Red
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-cyan-300 text-3xl">forest</span> Árbol de Impacto Histórico
                    </h3>
                    <p className="text-sm sm:text-base text-cyan-100/80 font-light max-w-xl leading-relaxed">
                      Descubre tu red intergeneracional de impacto académico. Explora de forma inmersiva y a pantalla completa las semillas de estudiantes mentoreados, el efecto multiplicador en la red y las tesis graduadas con éxito.
                    </p>
                  </div>
                  
                  <div className="relative z-10 pt-6 self-start">
                    <Link href="/mi-legado/arbol" className="flex items-center gap-2 rounded-xl bg-white text-[#004857] hover:bg-cyan-50 px-5 py-3 text-xs font-bold shadow-md transition-all active:scale-[0.98] hover:shadow-lg">
                      <span className="material-symbols-outlined text-sm font-bold animate-pulse">open_in_new</span>
                      <span>Abrir Visualizador de Impacto Completo</span>
                    </Link>
                  </div>
                </div>

                {/* Guía de Desbloqueo de Logros */}
                <div className="anim-card bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="text-lg font-black text-[#004857] flex items-center gap-2 border-b border-[#005B70]/10 pb-3">
                    <span className="material-symbols-outlined text-[#005B70]">menu_book</span> Guía de Trofeos del Legado
                  </h3>
                  
                  <div className="space-y-6">
                    {legado?.insignias?.map((insignia: any, index: number) => {
                      const req = REQUISITOS_LOGROS[insignia.id as keyof typeof REQUISITOS_LOGROS] || {
                        comoConseguir: 'Completa los objetivos del sistema.',
                        recompensas: '+20 XP.'
                      };
                      const isUnlocked = insignia.desbloqueado;
                      const cat = insignia.categoria || 'bronce';
                      
                      let catColor = '';
                      if (cat === 'bronce') catColor = 'text-[#B87333]';
                      else if (cat === 'plata') catColor = 'text-[#C0C0C0]';
                      else if (cat === 'oro') catColor = 'text-[#FFD700]';
                      else if (cat === 'platino') catColor = 'text-[#E5E4E2] drop-shadow-[0_0_2px_rgba(6,182,212,0.4)]';

                      return (
                        <div 
                          key={index} 
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                            isUnlocked 
                              ? 'bg-slate-50/60 border-slate-200/60 shadow-sm' 
                              : 'bg-slate-100/35 border-slate-200/40 opacity-70 filter grayscale'
                          }`}
                        >
                          {/* Columna Izquierda: Status / Medalla */}
                          <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                            <span className={`material-symbols-outlined text-3xl ${catColor}`}>
                              {isUnlocked ? 'emoji_events' : 'lock'}
                            </span>
                            <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md ${
                              isUnlocked 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-250 text-slate-550'
                            }`}>
                              {isUnlocked ? 'Obtenido' : 'Bloqueado'}
                            </span>
                          </div>

                          {/* Columna Derecha: Detalles del Trofeo */}
                          <div className="flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-[14.5px] text-slate-800 leading-none">{insignia.nombre}</h4>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                                ({cat === 'bronce' ? 'Bronce' : cat === 'plata' ? 'Plata' : cat === 'oro' ? 'Oro' : 'Platino'})
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-light leading-normal">{insignia.descripcion}</p>
                            
                            <div className="pt-1.5 space-y-1 border-t border-slate-100 text-[11px]">
                              <div>
                                <strong className="text-[#005B70]">¿Cómo conseguir?:</strong>{' '}
                                <span className="text-slate-600 font-light">{req.comoConseguir}</span>
                              </div>
                              <div>
                                <strong className="text-purple-700 font-extrabold">Recompensas:</strong>{' '}
                                <span className="text-slate-600 font-light">{req.recompensas}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Columna Derecha (4 cols): Insignias y Logros */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Módulo de Medallas / Insignias */}
                <div className="anim-card bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                  <h3 className="text-lg font-black text-[#004857] flex items-center justify-between border-b border-[#005B70]/10 pb-3">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#005B70]">emoji_events</span> Logros de Legado
                    </span>
                    <span className={`text-[10.5px] font-mono uppercase tracking-widest font-black px-2.5 py-1 rounded-full border ${
                      legado?.resumen?.rango === 'Master Boss'
                        ? 'bg-cyan-500/10 border-cyan-300 text-cyan-700 shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-pulse'
                        : legado?.resumen?.rango === 'Senior'
                          ? 'bg-slate-100 border-slate-300 text-slate-700'
                          : 'bg-amber-500/10 border-amber-200 text-amber-800'
                    }`}>
                      Rango {legado?.resumen?.rango ?? 'Junior'}
                    </span>
                  </h3>

                  {/* PlayStation Leveling Progress Bar */}
                  <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <span className="material-symbols-outlined text-sm text-[#005B70]">stars</span>
                        <span>Nivel de Legado</span>
                      </div>
                      <div className="font-mono text-slate-500 font-bold">
                        {legado?.resumen?.xp ?? 0} XP
                      </div>
                    </div>
                    
                    <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-300/30">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                          legado?.resumen?.rango === 'Master Boss'
                            ? 'from-cyan-400 to-blue-500 shadow-[0_0_4px_rgba(6,182,212,0.5)]'
                            : legado?.resumen?.rango === 'Senior'
                              ? 'from-slate-400 to-slate-600'
                              : 'from-amber-400 to-orange-500'
                        }`}
                        style={{ width: `${legado?.resumen?.porcentajeProgreso ?? 0}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-semibold">
                      <span>Progreso: {legado?.resumen?.porcentajeProgreso ?? 0}%</span>
                      <span>Siguiente Rango: {legado?.resumen?.siguienteRango ?? 'Senior'}</span>
                    </div>

                    <div className="flex justify-around items-center pt-2 border-t border-slate-200/50 text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-1.5" title="Trofeos de Bronce">
                        <span className="material-symbols-outlined text-[#B87333]">emoji_events</span>
                        <span className="font-mono">{legado?.resumen?.trofeos?.bronce ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Trofeos de Plata">
                        <span className="material-symbols-outlined text-[#C0C0C0]">emoji_events</span>
                        <span className="font-mono">{legado?.resumen?.trofeos?.plata ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Trofeos de Oro">
                        <span className="material-symbols-outlined text-[#FFD700]">emoji_events</span>
                        <span className="font-mono">{legado?.resumen?.trofeos?.oro ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Trofeos de Platino">
                        <span className="material-symbols-outlined text-[#E5E4E2] drop-shadow-[0_0_2px_rgba(6,182,212,0.4)]">emoji_events</span>
                        <span className="font-mono">{legado?.resumen?.trofeos?.platino ?? 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {legado?.insignias && legado.insignias.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {legado.insignias.map((insignia: any, index: number) => {
                        const isUnlocked = insignia.desbloqueado;
                        const cat = insignia.categoria || 'bronce';
                        
                        let badgeColorClass = '';
                        let iconColorClass = '';
                        
                        if (isUnlocked) {
                          if (cat === 'bronce') {
                            badgeColorClass = 'bg-gradient-to-br from-amber-50 to-orange-100/40 border-orange-200/80 text-orange-950 shadow-sm';
                            iconColorClass = 'text-amber-700 bg-amber-100/50 border-amber-200/50';
                          } else if (cat === 'plata') {
                            badgeColorClass = 'bg-gradient-to-br from-slate-50 to-slate-200/40 border-slate-300 text-slate-950 shadow-sm';
                            iconColorClass = 'text-slate-500 bg-slate-100 border-slate-300/50';
                          } else if (cat === 'oro') {
                            badgeColorClass = 'bg-gradient-to-br from-yellow-50 to-amber-100/40 border-amber-300 text-amber-950 shadow-sm';
                            iconColorClass = 'text-yellow-600 bg-yellow-100/50 border-yellow-200/50';
                          } else if (cat === 'platino') {
                            badgeColorClass = 'bg-gradient-to-br from-cyan-50 to-blue-100/40 border-cyan-200 text-cyan-950 shadow-md shadow-cyan-100/50 border-[1.5px]';
                            iconColorClass = 'text-cyan-600 bg-cyan-100/50 border-cyan-200/50 drop-shadow-[0_0_2px_rgba(6,182,212,0.4)]';
                          }
                        } else {
                          badgeColorClass = 'bg-slate-50 opacity-45 border-slate-200 border-dashed border-[1.5px] cursor-not-allowed filter grayscale';
                          iconColorClass = 'text-slate-400 bg-slate-100 border-slate-200';
                        }
                        
                        return (
                          <div 
                            key={index} 
                            className={`border rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 group ${badgeColorClass} ${
                              isUnlocked ? 'hover:scale-[1.03] hover:shadow-md cursor-pointer' : ''
                            }`}
                            onMouseMove={isUnlocked ? handleMouseMoveInsignia : undefined}
                            onMouseLeave={isUnlocked ? handleMouseLeaveInsignia : undefined}
                            title={isUnlocked ? 'Logro desbloqueado' : `Bloqueado: ${insignia.descripcion}`}
                          >
                            <div className="relative">
                              <div className={`badge-icon-wrap h-14 w-14 rounded-full flex items-center justify-center mb-2.5 border transition-transform duration-300 ${iconColorClass}`}>
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isUnlocked ? "'FILL' 1" : "'FILL' 0" }}>
                                  {insignia.icono || 'award_star'}
                                </span>
                              </div>
                              {!isUnlocked && (
                                <div className="absolute -bottom-1 -right-1 bg-white border border-slate-200 text-slate-500 rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                                  <span className="material-symbols-outlined text-[12px] font-black">lock</span>
                                </div>
                              )}
                            </div>
                            <h4 className="text-[13px] font-extrabold leading-snug">{insignia.nombre}</h4>
                            <p className="text-[10px] text-slate-500 font-medium mt-1 leading-snug">
                              {insignia.descripcion}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-4xl text-slate-300">award_star</span>
                      <p className="text-xs text-slate-400 mt-2 font-light">Completa más mentorías para ganar medallas.</p>
                    </div>
                  )}
                </div>

                {/* Tarjeta de Resumen Estadístico Directo */}
                <div className="anim-card bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4.5">
                  <h3 className="text-sm font-mono tracking-widest text-[#005B70] uppercase font-bold">Bitácora de Legado</h3>
                  <div className="space-y-3.5 font-mono text-xs">
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-slate-400">Total de Semillas:</span>
                      <span className="font-bold text-[#004857]">{totalSemillas}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-slate-400">Mentoría Activa:</span>
                      <span className="font-bold text-[#00A7C1]">{totalHoras} Horas</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-slate-400">Aportación Económica:</span>
                      <span className="font-bold text-emerald-600">₡{totalDonadoVal.toLocaleString('es-CR')}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-400">Facultad de Vínculo:</span>
                      <span className="font-bold text-slate-700 truncate max-w-[140px]">{facultad}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-outline-variant bg-white py-5 text-center text-xs text-on-surface-variant mt-auto">
          <AlumniLogo height={26} /> © 2026 Alumni UCR · Universidad de Costa Rica
        </footer>
      </div>
    </div>
  );
}
