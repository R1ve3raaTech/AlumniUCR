'use client';

// Dashboard del exalumno: "Perfil de Mentor" premium (estética bento, alineada
// al dashboard del estudiante y a la marca UCR). Datos REALES del perfil del
// exalumno (bio, empresa, cargo, experiencia, áreas, foto) + métricas reales de
// donaciones. Conserva la lógica de aprobación (pendiente/activo) y los enlaces
// funcionales (perfil, mentorías, estudiantes, donaciones, posiciones, ayuda).

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import AlumniLogo from './AlumniLogo';
import { obtenerMisDonaciones } from '@/lib/donaciones';
import { obtenerMiPerfilExalumno, obtenerCatalogos } from '@/lib/perfilExalumno';
import { obtenerMisMatches, contactarMatch, aceptarMatch, rechazarMatch, obtenerExplicacionMatchIA, generarMatches } from '@/lib/matchesEstudiante';
import { obtenerDirectorioEstudiantes } from '@/lib/directorioEstudiantes';
import { obtenerMiLegado, obtenerLeaderboards } from '@/lib/fidelizacion';
import { useTema } from '@/lib/useTema';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface Perfil {
  nombre?: string;
  correo_electronico?: string;
  estado?: string;
  roles?: { nombre?: string } | null;
  metadata?: { carreras?: string[]; escuela_facultad?: string; anio_graduacion?: number | string } | null;
}
interface Donacion { estado?: string; id_proyecto?: string | null }

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

const card = 'rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-16px_rgba(0,40,55,0.25)] hover:border-secondary/35';

// Accesos rápidos, espejo de los del dashboard del estudiante.
const ACCESOS: { titulo: string; icon: string; href: string }[] = [
  { titulo: 'Mi Perfil', icon: 'person', href: '/perfil-exalumno' },
  { titulo: 'Mentorías', icon: 'handshake', href: '/mentorias/exalumno' },
  { titulo: 'Estudiantes', icon: 'group', href: '/estudiantes' },
  { titulo: 'Donaciones', icon: 'volunteer_activism', href: '/donaciones' },
  { titulo: 'Posiciones', icon: 'work', href: '/mis-posiciones' },
  { titulo: 'Comunidad', icon: 'forum', href: '/blog' },
];

export default function ExalumnoDashboard({
  perfil, correo, onSignOut, userId, token,
}: { perfil: Perfil | null; correo: string; onSignOut: () => void; userId?: string; token?: string }) {
  const nombre = perfil?.nombre || correo.split('@')[0] || 'Exalumno';
  const primerNombre = nombre.split(' ')[0];
  const estado = (perfil?.estado || 'activo').toLowerCase().trim();
  const aprobado = estado === 'activo';
  const iniciales = nombre.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const [full, setFull] = useState<any | null>(null);
  const [cat, setCat] = useState<any | null>(null);
  const [donaciones, setDonaciones] = useState<Donacion[] | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [cargandoMatches, setCargandoMatches] = useState(true);
  const [explicacionIA, setExplicacionIA] = useState<string>('');
  const [cargandoExplicacion, setCargandoExplicacion] = useState(false);

  // Estados de fidelización y gamificación
  const [legado, setLegado] = useState<any | null>(null);
  const [leaderboards, setLeaderboards] = useState<any | null>(null);
  const [cargandoLegado, setCargandoLegado] = useState(true);
  useTema(); // aplica el modo claro/oscuro guardado (misma preferencia que el estudiante)
  const [subTab, setSubTab] = useState<'timeline' | 'insignias' | 'arbol' | 'leaderboard' | 'portafolio'>('timeline');

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Bento cards entrance stagger
    gsap.fromTo('.bento-card', 
      { y: 30, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.06, ease: 'power4.out', delay: 0.1 }
    );
  }, { scope: containerRef });

  useGSAP(() => {
    // 2. Stats counter animation
    const targets = containerRef.current?.querySelectorAll('.stat-number');
    targets?.forEach((el) => {
      const targetVal = parseFloat(el.getAttribute('data-target') || '0');
      if (targetVal > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetVal,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.3,
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          }
        });
      }
    });
  }, { scope: containerRef, dependencies: [full, donaciones] });

  // Función para volver a cargar los matches
  const cargarMatches = async () => {
    if (!token) return;
    try {
      const [m, e] = await Promise.all([
        obtenerMisMatches(token),
        obtenerDirectorioEstudiantes(token)
      ]);
      setMatches(m);
      setEstudiantes(e?.data ?? e ?? []);

      // Cargar explicación IA si hay un match sugerido
      const sug = m.find((x: any) => x.estado === 'sugerido');
      if (sug) {
        setCargandoExplicacion(true);
        try {
          const exp = await obtenerExplicacionMatchIA(token, sug.id);
          setExplicacionIA(exp);
        } catch (err) {
          console.error("Error al cargar explicación IA:", err);
        } finally {
          setCargandoExplicacion(false);
        }
      } else {
        setExplicacionIA('');
      }
    } catch (err) {
      console.error("Error al cargar matches o directorio:", err);
    } finally {
      setCargandoMatches(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let activo = true;
    Promise.all([obtenerMiPerfilExalumno(token), obtenerCatalogos(token)])
      .then(([p, c]) => { if (activo) { setFull(p?.data?.perfil ?? p?.perfil ?? p ?? null); setCat(c?.data ?? c ?? null); } })
      .catch(() => {});
    
    // Carga de datos de fidelización
    setCargandoLegado(true);
    obtenerMiLegado(token)
      .then((res) => { if (activo) setLegado(res?.data ?? res ?? null); })
      .catch((err) => console.error("Error al cargar legado:", err))
      .finally(() => { if (activo) setCargandoLegado(false); });

    obtenerLeaderboards(token)
      .then((res) => { if (activo) setLeaderboards(res?.data ?? res ?? null); })
      .catch((err) => console.error("Error al cargar leaderboards:", err));

    if (userId) {
      obtenerMisDonaciones(token, userId)
        .then((r) => { if (activo) setDonaciones((Array.isArray(r) ? r : r?.data ?? []) as Donacion[]); })
        .catch(() => { if (activo) setDonaciones(null); });
    }
    cargarMatches();
    return () => { activo = false; };
  }, [token, userId]);

  const nombreDe = (lista: any[], id: any) => (lista || []).find((x) => x.id === id)?.nombre;
  const areas: string[] = (full?.areas || []).map((id: any) => nombreDe(cat?.areas, id)).filter(Boolean);
  const sectores: string[] = (full?.sectores || []).map((id: any) => nombreDe(cat?.sectores, id)).filter(Boolean);
  const carreras: string[] = (full?.carreras || []).map((id: any) => nombreDe(cat?.carreras, id)).filter(Boolean);

  const facultad = full?.escuela_facultad || perfil?.metadata?.escuela_facultad || '—';
  const anio = full?.anio_graduacion || perfil?.metadata?.anio_graduacion || '—';
  const ciudad = [full?.ciudad, full?.pais].filter(Boolean).join(', ') || 'Costa Rica';
  const cargo = full?.cargo || 'Profesional UCR';
  const empresa = full?.empresa || '';
  const experiencia = full?.anos_experiencia;
  const bio = full?.biografia || '';
  const foto = full?.foto_perfil || '';
  const linkedin = full?.url_linkedin || '';

  const apoyos = [
    full?.ofrece_mentoria && 'Mentoría',
    full?.ofrece_empleo && 'Empleo',
    full?.ofrece_pasantia && 'Pasantía',
    full?.ofrece_colaboracion && 'Colaboración',
    full?.ofrece_donacion && 'Donación',
  ].filter(Boolean) as string[];

  const confirmadas = (donaciones ?? []).filter((d) => (d.estado || '').toLowerCase() === 'confirmada');
  const proyectosApoyados = new Set(confirmadas.map((d) => d.id_proyecto).filter(Boolean)).size;
  const dash = (v: number) => (donaciones === null ? '—' : String(v));

  // % de perfil completo (espejo de las reglas de /perfil-exalumno), para el
  // anillo de progreso del hero — igual que en el dashboard del estudiante.
  const pctPerfil = useMemo(() => {
    const p = full || {};
    const t = (v: unknown) => typeof v === 'string' && v.trim() !== '';
    const req = [
      t(p.pais), t(p.ciudad), t(p.url_linkedin), t(p.biografia),
      (p.carreras?.length ?? 0) > 0, t(p.escuela_facultad), !!p.anio_graduacion,
      t(p.empresa), t(p.cargo), (p.sectores?.length ?? 0) > 0,
      p.anos_experiencia !== '' && p.anos_experiencia != null,
      (p.areas?.length ?? 0) > 0,
    ];
    return Math.round((req.filter(Boolean).length / req.length) * 100);
  }, [full]);

  const [procesandoMatchId, setProcesandoMatchId] = useState<string | null>(null);

  const handleConectar = async (matchId: string) => {
    if (!token) return;
    setProcesandoMatchId(matchId);
    try {
      await contactarMatch(token, matchId);
      await cargarMatches();
    } catch (err) {
      console.error("Error al contactar match:", err);
    } finally {
      setProcesandoMatchId(null);
    }
  };

  const handleConectarClientSide = async (estudianteId: string) => {
    if (!token) return;
    setProcesandoMatchId(estudianteId);
    try {
      // 1. Generar los matches en BD para asegurar que exista la fila
      await generarMatches(token);
      // 2. Volver a cargar matches para obtener su ID
      const actualizados = await obtenerMisMatches(token);
      setMatches(actualizados);
      // 3. Buscar el match correspondiente
      const match = actualizados.find((m: any) => m.usuarios?.id === estudianteId);
      if (match && match.estado === 'sugerido') {
        await contactarMatch(token, match.id);
        await cargarMatches();
      } else {
        throw new Error('No se encontró el match sugerido tras generarlo.');
      }
    } catch (err) {
      console.error("Error al conectar client side:", err);
    } finally {
      setProcesandoMatchId(null);
    }
  };

  const handleAceptar = async (matchId: string) => {
    if (!token) return;
    setProcesandoMatchId(matchId);
    try {
      await aceptarMatch(token, matchId);
      await cargarMatches();
    } catch (err) {
      console.error("Error al aceptar match:", err);
    } finally {
      setProcesandoMatchId(null);
    }
  };

  const handleRechazar = async (matchId: string) => {
    if (!token) return;
    setProcesandoMatchId(matchId);
    try {
      await rechazarMatch(token, matchId);
      await cargarMatches();
    } catch (err) {
      console.error("Error al rechazar match:", err);
    } finally {
      setProcesandoMatchId(null);
    }
  };

  const obtenerDetallesEstudiante = (estudianteId: string) => {
    return estudiantes.find((e: any) => e.id === estudianteId);
  };

  const puntuarEstudiante = (est: any) => {
    let score = 0;
    const comunes: string[] = [];

    // 1. Carreras (30 pts)
    const tieneCarreraComun = (est.carreras || []).some((c: string) => 
      carreras.some((ec: string) => ec.toLowerCase().trim() === c.toLowerCase().trim())
    );
    if (tieneCarreraComun) score += 30;

    // 2. Áreas de interés comunes (30 pts)
    const mias = new Set(areas.map(a => a.toLowerCase().trim()));
    (est.areas || []).forEach((a: string) => {
      if (mias.has(a.toLowerCase().trim())) {
        comunes.push(a);
      }
    });
    if (areas.length > 0) {
      score += Math.round((comunes.length / areas.length) * 30);
    }

    // 3. Sector <-> Area proyecto (20 pts)
    const tieneSectorComun = (est.areas || []).some((a: string) =>
      sectores.some((s: string) => s.toLowerCase().trim() === a.toLowerCase().trim())
    );
    if (tieneSectorComun) score += 20;

    // 4. Apoyo (20 pts)
    const exaOfreceMentoria = full?.ofrece_mentoria;
    const exaOfreceEmpleo = full?.ofrece_empleo;
    const exaOfrecePasantia = full?.ofrece_pasantia;
    const exaOfreceDonacion = full?.ofrece_donacion;

    const apoyoComun =
      (exaOfreceMentoria && est.busca?.mentoria) ||
      (exaOfreceEmpleo && est.busca?.empleo) ||
      (exaOfrecePasantia && est.busca?.pasantia) ||
      (exaOfreceDonacion && est.busca?.financiamiento);
    if (apoyoComun) score += 20;

    return { score: Math.min(score, 100), comunes };
  };

  const estudiantesPuntuados = useMemo(() => {
    if (cargandoMatches || estudiantes.length === 0) return [];
    // Excluir estudiantes que ya tienen match (activo, contactado, rechazado, etc.)
    const idsConMatch = new Set(matches.map((m: any) => m.usuarios?.id).filter(Boolean));
    const disponibles = estudiantes.filter((e: any) => !idsConMatch.has(e.id));
    
    return disponibles
      .map((e: any) => {
        const { score, comunes } = puntuarEstudiante(e);
        return { ...e, score_match: score, comunes };
      })
      .sort((a: any, b: any) => b.score_match - a.score_match);
  }, [cargandoMatches, estudiantes, matches, carreras, areas, sectores, full]);

  const topEstudiante = useMemo(() => {
    if (estudiantesPuntuados.length === 0) return null;
    return estudiantesPuntuados[0];
  }, [estudiantesPuntuados]);

  // Clasificación de matches
  const matchSugerido = matches.find((m: any) => m.estado === 'sugerido');
  const solicitudesPendientes = matches.filter((m: any) => m.estado === 'contactado' && m.iniciado_por === 'estudiante');
  const conexionesActivas = matches.filter((m: any) => m.estado === 'activo');

  const matchRender = useMemo(() => {
    if (matchSugerido) {
      const detalles = obtenerDetallesEstudiante(matchSugerido.usuarios.id);
      return {
        id: matchSugerido.id,
        isClientSide: false,
        estudianteId: matchSugerido.usuarios.id,
        nombre: matchSugerido.usuarios.nombre,
        score_match: matchSugerido.score_match,
        proyectoTitulo: detalles?.proyecto?.titulo || 'Proyecto de Graduación',
        areas: detalles?.areas || ['Tecnología', 'Innovación'],
      };
    } else if (topEstudiante) {
      return {
        id: topEstudiante.id,
        isClientSide: true,
        estudianteId: topEstudiante.id,
        nombre: topEstudiante.nombre,
        score_match: topEstudiante.score_match,
        proyectoTitulo: topEstudiante.proyecto?.titulo || 'Proyecto de Graduación',
        areas: topEstudiante.areas || ['Tecnología', 'Innovación'],
      };
    }
    return null;
  }, [matchSugerido, topEstudiante, estudiantes]);

  const STATS = [
    { rawVal: experiencia ? Number(experiencia) : 0, suffix: '+', label: 'Años de experiencia', destacado: true },
    { rawVal: full?.ofrece_mentoria && full?.horas_disponibles_mes ? Number(full.horas_disponibles_mes) : 0, suffix: 'h', label: 'Horas mentoría / mes' },
    { rawVal: donaciones === null ? 0 : (proyectosApoyados || 0), suffix: '', label: 'Proyectos apoyados' },
    { rawVal: donaciones === null ? 0 : (donaciones ?? []).length, suffix: '', label: 'Donaciones realizadas' },
  ];

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
              className={item.key === 'dashboard'
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
        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-4">
          <Link href="/configuracion-exalumno"
            className="flex items-center gap-4 rounded-lg p-3.5 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-semibold">Configuración</span>
          </Link>
          <button type="button" onClick={onSignOut}
            className="flex items-center gap-4 rounded-lg p-3.5 text-left text-on-surface-variant transition-all hover:text-error"
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
        </div>
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
            <input className="w-full border-none bg-transparent text-sm outline-none placeholder:text-on-surface-variant" placeholder="Buscar mentores, egresados o eventos..." />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-bold text-on-surface">{nombre}</p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Mentor</p>
            </div>
            {foto
              ? <img src={foto} alt={nombre} className="h-10 w-10 rounded-full border-2 border-primary-container object-cover" />
              : <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary">{iniciales || 'E'}</div>}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ml-0 min-h-screen px-4 pb-12 pt-24 sm:px-8 lg:ml-64">
        <div className="mx-auto max-w-[1440px] space-y-6">
          {/* Aviso de aprobación */}
          {!aprobado && (
            <div role="status" className={`rounded-xl border p-4 text-sm ${estado === 'rechazado' ? 'border-error/30 bg-error/10 text-error' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>
              <strong>{estado === 'rechazado' ? 'Tu cuenta no fue aprobada.' : 'Tu cuenta está en revisión.'}</strong>{' '}
              {estado === 'rechazado'
                ? 'Escribinos al Centro de Ayuda si creés que es un error.'
                : 'Un administrador validará tu registro. Completá tu perfil para agilizar la aprobación; las acciones se habilitan al aprobarse.'}
            </div>
          )}

          {/* Saludo + progreso (mismo hero del dashboard del estudiante) */}
          <section className="relative overflow-hidden rounded-2xl bg-primary p-8 text-on-primary bento-card">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-on-primary/70">¡Hola de nuevo!</p>
                <h1 className="font-headline-md text-2xl font-bold sm:text-3xl">{nombre}</h1>
                <p className="mt-1 max-w-lg text-sm text-on-primary/85">
                  Es un placer tenerte de vuelta. Tu experiencia puede marcar la diferencia para un estudiante becado de la UCR.
                </p>
              </div>
              {/* Anillo de progreso */}
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 pr-5">
                <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#fb923c ${pctPerfil * 3.6}deg, rgba(255,255,255,0.25) 0deg)` }}>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-bold">{pctPerfil}%</span>
                </div>
                <div>
                  <p className="font-body-semibold text-sm">Perfil Completo</p>
                  <Link href="/perfil-exalumno" className="text-xs text-on-primary/70 underline hover:text-on-primary">
                    {pctPerfil >= 100 ? '¡Tu perfil se ve genial para los estudiantes!' : 'Completar ahora →'}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {ACCESOS.map((s) => (
              <Link
                key={`acceso-${s.titulo}`}
                href={s.href}
                className="bento-card flex flex-col items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-0.5 hover:border-secondary"
              >
                <span className="material-symbols-outlined text-secondary">{s.icon}</span>
                <span className="text-xs font-bold text-on-surface">{s.titulo}</span>
              </Link>
            ))}
          </div>

          {/* Encabezado de perfil + stats */}
          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 flex flex-col items-start gap-6 rounded-2xl border border-outline-variant bg-surface-container-low p-6 md:flex-row md:items-center lg:col-span-8 bento-card">
              <div className="relative shrink-0">
                {foto ? (
                  <img src={foto} alt={nombre} className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md md:h-36 md:w-36" />
                ) : (
                  <div className="grid h-32 w-32 place-items-center rounded-full border-4 border-white bg-primary/10 font-display-lg text-4xl font-bold text-primary shadow-md md:h-36 md:w-36">{iniciales || 'E'}</div>
                )}
                <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </span>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h2 className="font-headline-md text-2xl text-primary sm:text-3xl">{nombre}</h2>
                  <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-secondary-container">
                    {legado?.cicloVida?.etapa || "Mentor Senior"}
                  </span>
                </div>
                <p className="mb-4 text-lg text-on-surface-variant">{cargo}{empresa ? ` · ${empresa}` : ''}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-[20px]">location_on</span>{ciudad}</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-[20px]">school</span>{facultad}</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>Generación {anio}</span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 md:w-auto">
                <Link href="/mentorias/exalumno" className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-bold text-on-primary shadow-md transition-transform hover:-translate-y-0.5">
                  <span className="material-symbols-outlined text-[20px]">handshake</span> Ofrecer mentoría
                </Link>
                <Link href="/perfil-exalumno" className="flex items-center justify-center gap-2 rounded-lg border border-primary px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5">
                  <span className="material-symbols-outlined text-[20px]">edit</span> Editar perfil
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-4">
              {STATS.map((s) => (
                <div key={s.label} className={`${card} bento-card flex flex-col items-center justify-center p-5 text-center ${s.destacado ? 'bg-primary-container' : ''}`}>
                  <span className={`font-display-lg text-3xl font-bold ${s.destacado ? 'text-on-primary-container' : 'text-secondary'}`}>
                    <span className="stat-number" data-target={s.rawVal}>0</span>{s.suffix}
                  </span>
                  <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${s.destacado ? 'text-on-primary-container/80' : 'text-on-surface-variant'}`}>{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cuerpo: izquierda (bio/áreas/acciones) + derecha (match/actividad) */}
          <div className="grid grid-cols-12 items-start gap-6">
            <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
              {/* Biografía */}
              <section className={`${card} bento-card p-6 sm:p-8`}>
                <h3 className="mb-4 flex items-center gap-2 font-headline-md text-xl text-primary">
                  <span className="material-symbols-outlined">article</span> Biografía profesional
                </h3>
                <p className="text-lg leading-relaxed text-on-surface-variant">
                  {bio || `Hola, soy ${primerNombre}. Completá tu biografía profesional desde "Editar perfil" para inspirar a la próxima generación de la UCR.`}
                </p>
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-secondary hover:underline">
                    <span className="material-symbols-outlined text-[18px]">link</span> Ver perfil de LinkedIn
                  </a>
                )}
              </section>

              {/* Áreas de especialidad */}
              <section className={`${card} bento-card p-6 sm:p-8`}>
                <h3 className="mb-6 flex items-center gap-2 font-headline-md text-xl text-primary">
                  <span className="material-symbols-outlined">workspace_premium</span> Áreas de especialidad
                </h3>
                {areas.length === 0 && sectores.length === 0 && carreras.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Aún no definiste tus áreas. Agregalas desde tu perfil para mejorar tus matches.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {carreras.map((c) => <span key={`c-${c}`} className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">{c}</span>)}
                    {areas.map((a) => <span key={`a-${a}`} className="rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">{a}</span>)}
                    {sectores.map((s) => <span key={`s-${s}`} className="rounded-lg border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface">{s}</span>)}
                  </div>
                )}
                {apoyos.length > 0 && (
                  <div className="mt-6 border-t border-outline-variant pt-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Ofrece a la red</p>
                    <div className="flex flex-wrap gap-2">
                      {apoyos.map((a) => <span key={a} className="rounded-full bg-tertiary/10 px-3 py-1 text-xs font-semibold text-tertiary">{a}</span>)}
                    </div>
                  </div>
                )}
              </section>

              {/* Acciones rápidas (funcionales) */}
              <section className={`${card} bento-card p-6 sm:p-8`}>
                <h3 className="mb-5 flex items-center gap-2 font-headline-md text-xl text-primary">
                  <span className="material-symbols-outlined">bolt</span> Acciones rápidas
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { icon: 'volunteer_activism', t: 'Hacer una donación', href: '/donaciones' },
                    { icon: 'receipt_long', t: 'Mis donaciones', href: '/mis-donaciones' },
                    { icon: 'post_add', t: 'Publicar una posición', href: '/posiciones/nueva' },
                    { icon: 'work', t: 'Mis posiciones', href: '/mis-posiciones' },
                    { icon: 'groups', t: 'Directorio de estudiantes', href: '/estudiantes' },
                    { icon: 'handshake', t: 'Ofrecer mentoría', href: '/mentorias/exalumno' },
                  ].map((a) => (
                    <Link key={a.t} href={a.href} className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/60 p-4 transition-all hover:-translate-y-0.5 hover:border-secondary hover:bg-secondary/5">
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary/10 text-secondary"><span className="material-symbols-outlined text-[20px]">{a.icon}</span></span>
                        <span className="text-sm font-body-semibold text-primary">{a.t}</span>
                      </span>
                      <span className="material-symbols-outlined text-outline">chevron_right</span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Promo Banner: Mi Legado UCR */}
              <section className="relative overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-r from-primary to-[#002B3A] p-6 sm:p-8 bento-card shadow-md text-white">
                <div className="absolute -right-20 -bottom-20 h-44 w-44 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-secondary mb-2 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                      <span className="material-symbols-outlined text-[12px] fill-current">auto_awesome</span> Mi Legado UCR
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                      ¡Estás dejando huella, {primerNombre}!
                    </h3>
                    <p className="text-sm text-white/90 max-w-xl leading-relaxed font-brand-body font-light">
                      Actualmente te encuentras en la etapa de <strong className="text-secondary font-bold">{legado?.cicloVida?.etapa || "Mentor Senior"}</strong>. 
                      Descubre tus insignias acumuladas, tu árbol de impacto multigeneracional, la línea de tiempo de tus donaciones y tu portafolio de co-creaciones.
                    </p>
                    
                    {/* Pequeño preview de insignias */}
                    {legado?.insignias && (
                      <div className="mt-4 flex items-center gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Tus Insignias:</p>
                        <div className="flex gap-1.5">
                          {legado.insignias.map((ins: any) => (
                            <span 
                              key={ins.id} 
                              className={`material-symbols-outlined text-lg p-1 rounded-full ${
                                ins.desbloqueado ? 'text-secondary bg-white/10 border border-white/15' : 'text-white/20 bg-white/5 border border-white/5 grayscale opacity-30'
                              }`}
                              title={ins.nombre}
                            >
                              {ins.icono}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-center">
                    <Link 
                      href="/mi-legado" 
                      className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3.5 text-sm font-bold text-primary shadow-md transition-all hover:scale-[1.03] hover:shadow-lg font-brand-body hover:brightness-110"
                    >
                      Ver mi Legado completo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </section>
            </div>

            {/* Derecha */}
            <aside className="col-span-12 flex flex-col gap-6 lg:col-span-4">
              {/* Match Estratégico */}
              {cargandoMatches ? (
                <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 text-center text-sm text-on-surface-variant animate-pulse">
                  Cargando coincidencias...
                </div>
              ) : matchRender ? (() => {
                const estInitials = matchRender.nombre.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
                const enProceso = procesandoMatchId === matchRender.id;
                
                return (
                  <div className="relative overflow-hidden rounded-2xl border border-primary bg-gradient-to-br from-primary to-secondary p-7 text-on-primary shadow-xl bento-card">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative z-10">
                      <div className="mb-6 flex items-start justify-between">
                        <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-black uppercase text-on-secondary-container">Match sugerido</span>
                        <div className="text-right"><span className="font-display-lg text-2xl leading-none">{matchRender.score_match}%</span><p className="text-[10px] font-bold opacity-80">Afinidad</p></div>
                      </div>
                      <div className="mb-6 flex items-center justify-center gap-3">
                        <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-white/40 bg-white/10 font-bold text-lg">
                          {estInitials}
                        </div>
                        <span className="material-symbols-outlined text-secondary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-secondary-fixed-dim bg-white/10 font-bold text-lg">{iniciales}</div>
                      </div>
                      <p className="mb-2 text-center font-body-semibold">Conexión recomendada con <strong>{matchRender.nombre}</strong></p>
                      <p className="mb-3 text-center text-xs opacity-90 italic line-clamp-2">“{matchRender.proyectoTitulo}”</p>
                      {!matchRender.isClientSide && cargandoExplicacion ? (
                        <p className="mb-4 text-xs opacity-75 text-center italic animate-pulse">Analizando afinidad con IA...</p>
                      ) : !matchRender.isClientSide && explicacionIA ? (
                        <div className="mb-4 rounded-xl bg-white/10 p-3.5 text-[11px] leading-relaxed border border-white/15 text-left text-on-primary">
                          <span className="flex items-center gap-1 font-bold text-secondary-fixed-dim mb-1">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> Recomendación de la IA
                          </span>
                          {explicacionIA}
                        </div>
                      ) : matchRender.isClientSide ? (
                        <div className="mb-4 rounded-xl bg-white/10 p-3.5 text-[11px] leading-relaxed border border-white/15 text-left text-on-primary">
                          <span className="flex items-center gap-1 font-bold text-secondary-fixed-dim mb-1">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> Recomendación por Afinidad
                          </span>
                          Este estudiante comparte áreas de especialidad, carreras o industrias de tu perfil.
                        </div>
                      ) : null}
                      <div className="mb-6 space-y-2 border-t border-white/20 pt-4">
                        {matchRender.areas.slice(0, 3).map((a: string) => (
                          <p key={a} className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[18px] text-secondary-fixed-dim">check_circle</span>{a}</p>
                        ))}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => matchRender.isClientSide ? handleConectarClientSide(matchRender.estudianteId) : handleConectar(matchRender.id)} 
                        disabled={enProceso} 
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#54BCEB] py-3.5 font-bold text-primary transition-transform hover:scale-[1.02] disabled:opacity-50"
                      >
                        {enProceso ? 'Conectando...' : <>Conectar <span className="material-symbols-outlined">bolt</span></>}
                      </button>
                    </div>
                  </div>
                );
              })() : (
                <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-7 shadow-sm text-center">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">groups</span>
                  <h4 className="font-body-semibold text-primary mb-1">Sin sugerencias activas</h4>
                  <p className="text-xs text-on-surface-variant mb-4">Asegúrate de completar tu perfil al 100% y seleccionar tus áreas para recibir recomendaciones.</p>
                  <Link href="/estudiantes" className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary py-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary/5">
                    Ver directorio de estudiantes
                  </Link>
                </div>
              )}

              {/* Solicitudes de contacto de estudiantes */}
              {!cargandoMatches && solicitudesPendientes.length > 0 && (
                <div className={`${card} bento-card p-6`}>
                  <h4 className="mb-4 flex items-center gap-2 border-b border-outline-variant pb-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <span className="material-symbols-outlined text-[18px]">handshake</span> Solicitudes Recibidas ({solicitudesPendientes.length})
                  </h4>
                  <div className="space-y-4">
                    {solicitudesPendientes.map((m: any) => {
                      const detalles = obtenerDetallesEstudiante(m.usuarios.id);
                      const estInitials = m.usuarios.nombre.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
                      const enProceso = procesandoMatchId === m.id;
                      return (
                        <div key={m.id} className="flex flex-col gap-2 rounded-xl border border-outline-variant p-4 bg-surface-container-low">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-sm">{estInitials}</span>
                            <div className="min-w-0 flex-1">
                              <h5 className="truncate text-sm font-bold text-primary">{m.usuarios.nombre}</h5>
                              <p className="truncate text-xs text-on-surface-variant">{detalles?.carreras?.[0] || 'Estudiante UCR'}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{m.score_match}%</span>
                          </div>
                          <p className="text-xs font-body-semibold italic text-on-surface-variant line-clamp-2">“{detalles?.proyecto?.titulo || 'Proyecto de Graduación'}”</p>
                          <div className="mt-2 flex gap-2">
                            <button type="button" onClick={() => handleAceptar(m.id)} disabled={enProceso} className="flex-1 rounded-lg bg-secondary py-1.5 text-xs font-bold text-on-secondary hover:brightness-110 disabled:opacity-50">
                              {enProceso ? 'Aceptar...' : 'Aceptar'}
                            </button>
                            <button type="button" onClick={() => handleRechazar(m.id)} disabled={enProceso} className="flex-1 rounded-lg border border-outline-variant py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-variant/20 disabled:opacity-50">
                              Rechazar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conexiones Activas (Matches Aceptados) */}
              {!cargandoMatches && conexionesActivas.length > 0 && (
                <div className={`${card} bento-card p-6`}>
                  <h4 className="mb-4 flex items-center gap-2 border-b border-outline-variant pb-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span> Conexiones Activas ({conexionesActivas.length})
                  </h4>
                  <div className="space-y-4">
                    {conexionesActivas.map((m: any) => {
                      const detalles = obtenerDetallesEstudiante(m.usuarios.id);
                      const estInitials = m.usuarios.nombre.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
                      return (
                        <div key={m.id} className="flex flex-col gap-1.5 rounded-xl border border-outline-variant p-4 bg-emerald-50/40">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800 text-sm">{estInitials}</span>
                            <div className="min-w-0 flex-1">
                              <h5 className="truncate text-sm font-bold text-primary">{m.usuarios.nombre}</h5>
                              <p className="truncate text-xs text-on-surface-variant">{detalles?.carreras?.[0] || 'Estudiante UCR'}</p>
                            </div>
                          </div>
                          <p className="text-xs font-body-semibold italic text-on-surface-variant line-clamp-2">“{detalles?.proyecto?.titulo || 'Proyecto de Graduación'}”</p>
                          <a href={`mailto:${m.usuarios.correo_electronico}`} className="mt-1 flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline">
                            <span className="material-symbols-outlined text-[14px]">mail</span> {m.usuarios.correo_electronico}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actividad reciente */}
              <div className={`${card} bento-card p-6`}>
                <h4 className="mb-5 border-b border-outline-variant pb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Actividad reciente</h4>
                <div className="space-y-5">
                  {[
                    { icon: 'forum', t: <>Comentó en <span className="font-bold text-primary">“Futuro de la IA en CR”</span></>, time: 'Hace 2 horas' },
                    { icon: 'history_edu', t: <>Publicó <span className="font-bold text-primary">“Migración a la nube 2026”</span></>, time: 'Hace 1 día' },
                    { icon: 'handshake', t: <>Nueva mentoría aceptada: <span className="font-bold text-primary">Daniel R.</span></>, time: 'Hace 3 días' },
                  ].map((a, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-container-high text-primary"><span className="material-symbols-outlined text-[18px]">{a.icon}</span></span>
                      <div><p className="text-sm text-on-surface">{a.t}</p><p className="text-[11px] text-on-surface-variant">{a.time}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="ml-0 flex flex-wrap items-center justify-center gap-3 border-t border-outline-variant bg-surface-container-lowest py-5 text-center text-xs text-on-surface-variant lg:ml-64">
        <AlumniLogo height={26} /> © 2026 Alumni UCR · Universidad de Costa Rica
      </footer>
    </div>
  );
}
