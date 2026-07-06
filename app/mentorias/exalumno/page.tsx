'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRequireRole } from '@/lib/useRequireRole';
import AlumniLogo from '@/components/AlumniLogo';
import { apiFetch } from '@/lib/api';
import {
  obtenerMisMatches,
  contactarMatch,
  aceptarMatch,
  rechazarMatch,
} from '@/lib/matchesEstudiante';
import {
  obtenerMiPerfilExalumno,
  guardarMiPerfilExalumno,
  obtenerCatalogos,
} from '@/lib/perfilExalumno';
import { obtenerDirectorioEstudiantes } from '@/lib/directorioEstudiantes';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface Estudiante {
  id: string;
  nombre: string;
  correo_electronico: string;
  carreras?: string[];
  facultades?: string[];
  proyecto?: {
    titulo?: string;
    descripcion?: string;
    areaTematica?: string;
  };
}

interface Match {
  id: string;
  score_match: number;
  estado: string;
  iniciado_por: string;
  usuarios: {
    id: string;
    nombre: string;
    correo_electronico: string;
    estado: string;
  };
}

const NAV = [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { key: 'perfil', icon: 'person', label: 'Mi Perfil', href: '/perfil-exalumno' },
  { key: 'mentorias', icon: 'handshake', label: 'Mentorías', href: '/mentorias/exalumno' },
  { key: 'estudiantes', icon: 'group', label: 'Estudiantes', href: '/estudiantes' },
  { key: 'hacer-donacion', icon: 'volunteer_activism', label: 'Hacer donación', href: '/donaciones' },
  { key: 'mis-donaciones', icon: 'history', label: 'Mis donaciones', href: '/mis-donaciones' },
  { key: 'posiciones', icon: 'work', label: 'Posiciones', href: '/mis-posiciones' },
  { key: 'comunidad', icon: 'forum', label: 'Comunidad', href: '/blog' },
  { key: 'ayuda', icon: 'help', label: 'Ayuda', href: '/ayuda' },
];

const cardClass = 'rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-16px_rgba(0,40,55,0.25)] hover:border-secondary/35 p-6 bento-card';

// Helper simple para renderizar Markdown a HTML con estilos de marca
function parseMarkdownToHtml(markdown: string) {
  if (!markdown) return '';
  let html = markdown
    // Bold
    .replace(/\*\*(.*?)\*\"/g, '<strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Bullet points
    .replace(/^\s*-\s+(.*?)$/gm, '<li class="ml-4 list-disc my-1.5 text-sm text-on-surface-variant">$1</li>')
    .replace(/^\s*\*\s+(.*?)$/gm, '<li class="ml-4 list-disc my-1.5 text-sm text-on-surface-variant">$1</li>')
    // Headers
    .replace(/^\s*###\s+(.*?)$/gm, '<h4 class="text-sm font-black uppercase tracking-wider mt-4 mb-2 text-primary flex items-center gap-1.5">$1</h4>')
    .replace(/^\s*##\s+(.*?)$/gm, '<h3 class="text-md font-bold mt-5 mb-2 text-primary border-b border-outline-variant pb-1 flex items-center gap-1.5">$1</h3>')
    .replace(/^\s*#\s+(.*?)$/gm, '<h2 class="text-lg font-extrabold mt-6 mb-3 text-primary border-b border-outline-variant pb-1 flex items-center gap-2">$1</h2>')
    // Line breaks
    .replace(/\n/g, '<br />');

  // Encapsular li en ul
  html = html.replace(/(<li.*?>.*?<\/li>)+/g, '<ul class="my-3 pl-2">$1</ul>');
  
  // Limpiar br duplicados dentro de las listas para que no se vea tanto espacio
  html = html.replace(/<br \/><ul/g, '<ul').replace(/<\/ul><br \/>/g, '</ul>');
  
  return html;
}

export default function MentoriasExalumnoPage() {
  const router = useRouter();
  const { token, user, signOut } = useAuth();
  const { verificando, autorizado } = useRequireRole(['exalumno']);

  // Datos de perfil y catálogo
  const [perfil, setPerfil] = useState<any | null>(null);
  const [catalogos, setCatalogos] = useState<any | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Estados de configuración de mentoría
  const [ofreceMentoria, setOfreceMentoria] = useState(false);
  const [horasMes, setHorasMes] = useState<number | string>('');
  const [guardandoPreferencias, setGuardandoPreferencias] = useState(false);
  const [notifPreferencias, setNotifPreferencias] = useState<{ tipo: 'ok' | 'error'; msg: string } | null>(null);

  // Control de UI
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [procesandoMatchId, setProcesandoMatchId] = useState<string | null>(null);

  // Copiloto de IA
  const [analisisIa, setAnalisisIa] = useState<{ activo: boolean; estudianteNombre: string; contenido: string; cargando: boolean }>({
    activo: false,
    estudianteNombre: '',
    contenido: '',
    cargando: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Bento cards entrance stagger
    gsap.fromTo('.bento-card', 
      { y: 35, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.75, stagger: 0.08, ease: 'power4.out', delay: 0.1 }
    );
  }, { scope: containerRef });

  useGSAP(() => {
    if (analisisIa.activo) {
      // Slide in from the right
      gsap.fromTo(drawerRef.current,
        { x: '100%', opacity: 0.5 },
        { x: '0%', opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
      // Blur fade in for background overlay
      gsap.fromTo('.drawer-overlay',
        { opacity: 0, backdropFilter: 'blur(0px)' },
        { opacity: 1, backdropFilter: 'blur(4px)', duration: 0.35 }
      );
    }
  }, [analisisIa.activo]);

  const nombre = perfil?.nombre || user?.email?.split('@')[0] || 'Mentor';
  const primerNombre = nombre.split(' ')[0];
  const iniciales = nombre.split(/\s+/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  const foto = perfil?.foto_perfil || '';
  const estadoCuenta = (perfil?.estado || 'activo').toLowerCase().trim();
  const aprobado = estadoCuenta === 'activo';

  const cargarDatos = async () => {
    if (!token) return;
    try {
      const [perfData, catData, matchesData, directorioData] = await Promise.all([
        obtenerMiPerfilExalumno(token),
        obtenerCatalogos(token),
        obtenerMisMatches(token),
        obtenerDirectorioEstudiantes(token),
      ]);

      const data = perfData?.data || perfData;
      const perf = data?.perfil ?? data;
      setPerfil({
        ...(perf ?? {}),
        nombre: data?.usuario?.nombre || '',
        estado: data?.usuario?.estado || 'activo',
      });
      setCatalogos(catData);
      setMatches(matchesData);
      setEstudiantes(directorioData?.data ?? directorioData ?? []);

      // Configurar inputs con los datos del backend
      setOfreceMentoria(Boolean(perf?.ofrece_mentoria));
      setHorasMes(perf?.horas_disponibles_mes ?? '');
    } catch (err) {
      console.error('Error al cargar datos de mentorías exalumno:', err);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    if (token && autorizado) {
      cargarDatos();
    }
  }, [token, autorizado]);

  const handleSignOut = () => {
    signOut();
    router.replace('/login');
  };

  const handleGuardarPreferencias = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !aprobado) return;
    setGuardandoPreferencias(true);
    setNotifPreferencias(null);
    try {
      const res = await guardarMiPerfilExalumno(token, {
        ...perfil,
        ofrece_mentoria: ofreceMentoria,
        horas_disponibles_mes: horasMes === '' ? null : Number(horasMes),
      });
      const data = res?.data || res;
      const updatedPerf = data?.perfil ?? data;
      setPerfil({
        ...(updatedPerf ?? {}),
        nombre: data?.usuario?.nombre || perfil?.nombre || '',
        estado: data?.usuario?.estado || perfil?.estado || 'activo',
      });
      setNotifPreferencias({ tipo: 'ok', msg: '✓ Preferencias actualizadas correctamente.' });
      setTimeout(() => setNotifPreferencias(null), 4000);
    } catch (err: any) {
      setNotifPreferencias({ tipo: 'error', msg: err?.message || 'Error al guardar preferencias.' });
    } finally {
      setGuardandoPreferencias(false);
    }
  };

  // Acciones de conexión
  const handleAceptar = async (matchId: string) => {
    if (!token || !aprobado) return;
    setProcesandoMatchId(matchId);
    try {
      await aceptarMatch(token, matchId);
      await cargarDatos();
    } catch (err) {
      console.error('Error al aceptar solicitud:', err);
    } finally {
      setProcesandoMatchId(null);
    }
  };

  const handleRechazar = async (matchId: string) => {
    if (!token || !aprobado) return;
    setProcesandoMatchId(matchId);
    try {
      await rechazarMatch(token, matchId);
      await cargarDatos();
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
    } finally {
      setProcesandoMatchId(null);
    }
  };

  const handleConectar = async (matchId: string) => {
    if (!token || !aprobado) return;
    setProcesandoMatchId(matchId);
    try {
      await contactarMatch(token, matchId);
      await cargarDatos();
    } catch (err) {
      console.error('Error al contactar match:', err);
    } finally {
      setProcesandoMatchId(null);
    }
  };

  // AI Copilot
  const handleAnalizarIA = async (estudianteNombre: string) => {
    if (!token) return;
    setAnalisisIa({
      activo: true,
      estudianteNombre,
      contenido: '',
      cargando: true,
    });

    try {
      const data = await apiFetch('/claude/chat', {
        method: 'POST',
        body: {
          historial: [{ role: 'user', text: `analiza a ${estudianteNombre}` }],
          contexto: {
            rol: 'exalumno',
            pathname: '/mentorias/exalumno',
          },
        },
        token,
      });

      if (data && data.success) {
        setAnalisisIa((prev) => ({
          ...prev,
          contenido: data.respuesta,
          cargando: false,
        }));
      } else {
        throw new Error('Error al procesar con IA');
      }
    } catch (err) {
      setAnalisisIa((prev) => ({
        ...prev,
        contenido: 'Lo siento, no pudimos generar el análisis en este momento debido a un problema de cuota o conexión. Por favor, intenta de nuevo en unos segundos.',
        cargando: false,
      }));
    }
  };

  const obtenerDetallesEstudiante = (estudianteId: string) => {
    return estudiantes.find((e) => e.id === estudianteId);
  };

  // Clasificación de matches
  const sugeridos = useMemo(() => matches.filter((m) => m.estado === 'sugerido'), [matches]);
  const solicitudesPendientes = useMemo(() => matches.filter((m) => m.estado === 'contactado' && m.iniciado_por === 'estudiante'), [matches]);
  const conexionesActivas = useMemo(() => matches.filter((m) => m.estado === 'activo'), [matches]);

  if (verificando || !autorizado || cargandoDatos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-body-base text-on-background">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <span className="text-sm font-semibold text-primary">Cargando panel de mentorías…</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background font-body-base text-on-background antialiased">
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
              <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-primary bg-primary/10 font-display-lg text-2xl font-bold text-primary">{iniciales || 'M'}</div>
            )}
            <span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-surface-container-low bg-secondary text-on-secondary" title="Mentor verificado">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </span>
          </div>
          <h2 className="font-body-semibold text-primary">{nombre}</h2>
          <p className="text-xs font-bold uppercase tracking-tight text-on-surface-variant">Exalumno · Mentor</p>
        </div>
        <nav className="flex flex-grow flex-col gap-1">
          {NAV.map((item) => (
            <Link key={item.key} href={item.href}
              className={item.key === 'mentorias'
                ? 'flex items-center gap-4 rounded-lg bg-primary-container p-3.5 font-bold text-on-primary-container'
                : 'flex items-center gap-4 rounded-lg p-3.5 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface'}
              onMouseEnter={(e) => {
                const icon = e.currentTarget.querySelector('.material-symbols-outlined');
                if (icon) {
                  gsap.to(icon, { scale: 1.15, rotation: 8, duration: 0.3, ease: 'back.out(2)' });
                }
              }}
              onMouseLeave={(e) => {
                const icon = e.currentTarget.querySelector('.material-symbols-outlined');
                if (icon) {
                  gsap.to(icon, { scale: 1, rotation: 0, duration: 0.4, ease: 'power2.out' });
                }
              }}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
        <button type="button" onClick={handleSignOut}
          className="mt-auto flex items-center gap-4 rounded-lg border-t border-outline-variant p-3.5 pt-6 text-on-surface-variant transition-all hover:text-error"
          onMouseEnter={(e) => {
            const icon = e.currentTarget.querySelector('.material-symbols-outlined');
            if (icon) {
              gsap.to(icon, { scale: 1.15, rotation: -8, duration: 0.3, ease: 'back.out(2)' });
            }
          }}
          onMouseLeave={(e) => {
            const icon = e.currentTarget.querySelector('.material-symbols-outlined');
            if (icon) {
              gsap.to(icon, { scale: 1, rotation: 0, duration: 0.4, ease: 'power2.out' });
            }
          }}
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-semibold">Cerrar sesión</span>
        </button>
      </aside>

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-outline-variant bg-surface-container-lowest lg:left-64">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-2 px-4 sm:px-8">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-variant lg:hidden"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-full bg-surface-container px-4 py-2 md:flex">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input className="w-full border-none bg-transparent text-sm outline-none placeholder:text-on-surface-variant" placeholder="Buscar..." />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-bold text-on-surface">{nombre}</p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Mentor</p>
            </div>
            {foto
              ? <img src={foto} alt={nombre} className="h-10 w-10 rounded-full border-2 border-primary-container object-cover" />
              : <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary">{iniciales}</div>}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-0 min-h-screen px-4 pb-12 pt-24 sm:px-8 lg:ml-64">
        <div className="mx-auto max-w-[1440px] space-y-6">
          {/* Aviso de aprobación */}
          {!aprobado && (
            <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              <strong>Tu cuenta está en revisión o inactiva.</strong> Las opciones de mentoría se habilitarán por completo una vez que un administrador apruebe tu perfil de mentor.
            </div>
          )}

          {/* Banner Principal */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-[#005470] p-8 text-on-primary shadow-lg">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 max-w-3xl space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-secondary-container border border-white/10">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Copiloto de IA Activo
              </span>
              <h1 className="font-headline-md text-3xl font-extrabold tracking-tight sm:text-4xl">Gestión de Mentorías</h1>
              <p className="text-sm opacity-90 sm:text-base leading-relaxed">
                Administrá tu disponibilidad, conectá con estudiantes de la UCR y utilizá el copiloto de IA para analizar afinidades académicas y obtener sugerencias metodológicas para tus reuniones de mentoría.
              </p>
            </div>
          </section>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Panel de Configuración (Col 4) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <section className={cardClass}>
                <h2 className="mb-4 flex items-center gap-2 font-headline-md text-lg font-bold text-primary">
                  <span className="material-symbols-outlined">settings</span> Configurar Disponibilidad
                </h2>
                <form onSubmit={handleGuardarPreferencias} className="space-y-5">
                  <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-4">
                    <div>
                      <span className="block font-body-semibold text-sm text-primary">Ofrecer Mentoría</span>
                      <span className="text-xs text-on-surface-variant">Habilitar tu perfil en el motor de búsqueda.</span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={ofreceMentoria}
                        disabled={!aprobado}
                        onChange={(e) => setOfreceMentoria(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-outline-variant after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-secondary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-disabled:opacity-50" />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Horas Disponibles por Mes</label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={horasMes}
                      disabled={!ofreceMentoria || !aprobado}
                      onChange={(e) => setHorasMes(e.target.value)}
                      placeholder="Ej: 4"
                      className="w-full rounded-xl border border-outline-variant bg-transparent p-3 text-sm outline-none focus:border-primary disabled:opacity-50"
                    />
                  </div>

                  {notifPreferencias && (
                    <div className={`rounded-xl p-3 text-xs font-semibold ${notifPreferencias.tipo === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-error/10 text-error border border-error/20'}`}>
                      {notifPreferencias.msg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={guardandoPreferencias || !aprobado}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-on-primary transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 shadow-md"
                  >
                    {guardandoPreferencias ? 'Guardando...' : 'Actualizar Preferencias'}
                  </button>
                </form>
              </section>

              {/* Tarjeta de Resumen Estadístico */}
              <section className={`${cardClass} bg-[#F4F6F7] border-none`}>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Resumen de Actividad</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                    <span className="block font-display-lg text-2xl font-bold text-primary">{conexionesActivas.length}</span>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Estudiantes Activos</span>
                  </div>
                  <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                    <span className="block font-display-lg text-2xl font-bold text-secondary">{solicitudesPendientes.length}</span>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Solicitudes</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Listados de Conexiones (Col 8) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              {/* 1. Solicitudes Recibidas */}
              <section className={cardClass}>
                <h2 className="mb-5 border-b border-outline-variant pb-2 flex items-center justify-between font-headline-md text-lg font-bold text-primary">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined">pending_actions</span> Solicitudes Pendientes
                  </span>
                  <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-xs font-black text-on-secondary-container">{solicitudesPendientes.length}</span>
                </h2>

                {solicitudesPendientes.length === 0 ? (
                  <p className="py-8 text-center text-sm text-on-surface-variant">No tenés solicitudes de estudiantes en este momento.</p>
                ) : (
                  <div className="space-y-4">
                    {solicitudesPendientes.map((m) => {
                      const est = obtenerDetallesEstudiante(m.usuarios.id);
                      const estInit = m.usuarios.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
                      const enProceso = procesandoMatchId === m.id;
                      
                      return (
                        <div key={m.id} className="flex flex-col gap-3 rounded-2xl border border-outline-variant p-5 bg-surface-container-low hover:border-secondary transition-all">
                          <div className="flex items-start gap-4">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/15 font-bold text-primary text-md">{estInit}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <h3 className="font-body-semibold text-primary">{m.usuarios.nombre}</h3>
                                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-on-primary">{m.score_match}% Afinidad</span>
                              </div>
                              <p className="text-xs text-on-surface-variant mt-0.5">{est?.carreras?.[0] || 'Estudiante UCR'}</p>
                              {est?.proyecto?.titulo && (
                                <p className="text-xs font-body-semibold text-primary mt-2 italic leading-relaxed">
                                  Proyecto: “{est.proyecto.titulo}”
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-outline-variant/60">
                            <button
                              type="button"
                              onClick={() => handleAceptar(m.id)}
                              disabled={enProceso}
                              className="flex-1 min-w-[120px] rounded-xl bg-secondary py-2.5 text-xs font-bold text-on-secondary hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                            >
                              Aceptar Conexión
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRechazar(m.id)}
                              disabled={enProceso}
                              className="flex-1 min-w-[120px] rounded-xl border border-outline-variant py-2.5 text-xs font-bold text-on-surface-variant hover:bg-surface-variant/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAnalizarIA(m.usuarios.nombre)}
                              className="flex-grow min-w-[150px] rounded-xl border border-primary/30 bg-primary/5 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">auto_awesome</span> Analizar con IA
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 2. Conexiones Activas */}
              <section className={cardClass}>
                <h2 className="mb-5 border-b border-outline-variant pb-2 flex items-center justify-between font-headline-md text-lg font-bold text-primary">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined">supervised_user_circle</span> Mentorías Activas
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">{conexionesActivas.length}</span>
                </h2>

                {conexionesActivas.length === 0 ? (
                  <p className="py-8 text-center text-sm text-on-surface-variant">No tenés mentorías activas en curso.</p>
                ) : (
                  <div className="space-y-4">
                    {conexionesActivas.map((m) => {
                      const est = obtenerDetallesEstudiante(m.usuarios.id);
                      const estInit = m.usuarios.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
                      
                      return (
                        <div key={m.id} className="flex flex-col gap-3 rounded-2xl border border-emerald-100 p-5 bg-emerald-50/20 hover:border-emerald-300 transition-all">
                          <div className="flex items-start gap-4">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800 text-md">{estInit}</span>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-body-semibold text-primary">{m.usuarios.nombre}</h3>
                              <p className="text-xs text-on-surface-variant mt-0.5">{est?.carreras?.[0] || 'Estudiante UCR'}</p>
                              
                              {est?.proyecto?.titulo && (
                                <div className="mt-3 rounded-xl bg-white/70 p-3 border border-outline-variant/40">
                                  <p className="text-xs font-bold text-primary mb-1">Proyecto de Graduación</p>
                                  <p className="text-xs font-body-semibold text-primary italic leading-relaxed">“{est.proyecto.titulo}”</p>
                                  {est.proyecto.descripcion && (
                                    <p className="text-[11px] text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">{est.proyecto.descripcion}</p>
                                  )}
                                </div>
                              )}

                              <a href={`mailto:${m.usuarios.correo_electronico}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline">
                                <span className="material-symbols-outlined text-[16px]">mail</span> {m.usuarios.correo_electronico}
                              </a>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3 pt-3 border-t border-emerald-100">
                            <button
                              type="button"
                              onClick={() => handleAnalizarIA(m.usuarios.nombre)}
                              className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-xs font-bold text-on-primary hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">auto_awesome</span> Generar Plan de Trabajo (IA)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 3. Estudiantes Sugeridos */}
              <section className={cardClass}>
                <h2 className="mb-5 border-b border-outline-variant pb-2 flex items-center justify-between font-headline-md text-lg font-bold text-primary">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined">explore</span> Recomendados por la Plataforma
                  </span>
                  <span className="rounded-full bg-outline-variant/40 px-2.5 py-0.5 text-xs font-black text-on-surface">{sugeridos.length}</span>
                </h2>

                {sugeridos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-on-surface-variant">Completá tus áreas de especialidad en tu perfil para recibir sugerencias de estudiantes.</p>
                ) : (
                  <div className="space-y-4">
                    {sugeridos.slice(0, 3).map((m) => {
                      const est = obtenerDetallesEstudiante(m.usuarios.id);
                      const estInit = m.usuarios.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
                      const enProceso = procesandoMatchId === m.id;

                      return (
                        <div key={m.id} className="flex flex-col gap-3 rounded-2xl border border-outline-variant/60 p-5 bg-surface-container-lowest hover:bg-surface-container-low transition-all">
                          <div className="flex items-start gap-4">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-sm">{estInit}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-body-semibold text-primary truncate text-sm">{m.usuarios.nombre}</h3>
                                <span className="shrink-0 text-xs font-bold text-secondary">{m.score_match}% afinidad</span>
                              </div>
                              <p className="text-[11px] text-on-surface-variant mt-0.5">{est?.carreras?.[0] || 'Estudiante UCR'}</p>
                              {est?.proyecto?.titulo && (
                                <p className="text-xs font-body-semibold text-primary italic mt-2 line-clamp-1">Tesis: “{est.proyecto.titulo}”</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2 pt-2 border-t border-outline-variant/40">
                            <button
                              type="button"
                              onClick={() => handleConectar(m.id)}
                              disabled={enProceso}
                              className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-on-primary hover:bg-secondary active:scale-95 transition-all disabled:opacity-50"
                            >
                              Ofrecer Apoyo / Conectar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAnalizarIA(m.usuarios.nombre)}
                              className="rounded-lg border border-primary/20 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 active:scale-95 transition-all flex items-center justify-center"
                              title="Analizar con IA"
                            >
                              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* AI Drawer/Modal Panel */}
      {analisisIa.activo && (
        <div className="drawer-overlay fixed inset-0 z-50 flex items-center justify-end bg-black/50 p-0 sm:p-4">
          <div ref={drawerRef} className="relative flex h-full w-full max-w-xl flex-col bg-surface-container-lowest shadow-2xl transition-all sm:h-[95vh] sm:rounded-2xl border border-outline-variant">
            {/* Cabecera del Drawer */}
            <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4 bg-gradient-to-r from-primary to-secondary text-on-primary sm:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-pulse text-secondary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <div>
                  <h3 className="font-headline-md text-md font-extrabold leading-none">Copiloto IA de Mentoría</h3>
                  <span className="text-[10px] opacity-75 font-semibold">Análisis de {analisisIa.estudianteNombre}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnalisisIa((prev) => ({ ...prev, activo: false }))}
                className="rounded-lg p-1.5 hover:bg-white/10 text-on-primary transition-colors"
                aria-label="Cerrar panel"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Contenido del Drawer */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {analisisIa.cargando ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
                  <div className="relative">
                    <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
                    <span className="material-symbols-outlined absolute inset-0 m-auto h-fit w-fit text-xl text-secondary animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-body-semibold text-primary">Elaborando informe inteligente...</p>
                    <p className="text-xs text-on-surface-variant max-w-xs">
                      Estamos analizando los perfiles, la alineación de carreras y el TFG para estructurar una guía de mentoría personalizada.
                    </p>
                  </div>
                </div>
              ) : (
                <article 
                  className="prose prose-sm max-w-none text-on-surface leading-relaxed text-left"
                  dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(analisisIa.contenido) }}
                />
              )}
            </div>

            {/* Acciones del Drawer */}
            {!analisisIa.cargando && (
              <div className="border-t border-outline-variant px-6 py-4 flex gap-3 bg-surface-container-low sm:rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 rounded-xl border border-outline-variant bg-white py-3 text-xs font-bold text-on-surface-variant hover:bg-surface-variant/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span> Imprimir Informe
                </button>
                <button
                  type="button"
                  onClick={() => setAnalisisIa((prev) => ({ ...prev, activo: false }))}
                  className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-on-primary hover:bg-secondary active:scale-95 transition-all"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="ml-0 flex flex-wrap items-center justify-center gap-3 border-t border-outline-variant bg-surface-container-lowest py-5 text-center text-xs text-on-surface-variant lg:ml-64">
        <AlumniLogo height={26} /> © 2026 Alumni UCR · Universidad de Costa Rica
      </footer>
    </div>
  );
}
