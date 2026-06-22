'use client';

// Dashboard del exalumno: "Perfil de Mentor" premium (estética bento, alineada
// al dashboard del estudiante y a la marca UCR). Datos REALES del perfil del
// exalumno (bio, empresa, cargo, experiencia, áreas, foto) + métricas reales de
// donaciones. Conserva la lógica de aprobación (pendiente/activo) y los enlaces
// funcionales (perfil, mentorías, estudiantes, donaciones, posiciones, ayuda).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AlumniLogo from './AlumniLogo';
import { obtenerMisDonaciones } from '@/lib/donaciones';
import { obtenerMiPerfilExalumno, obtenerCatalogos } from '@/lib/perfilExalumno';

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
  { key: 'perfil', icon: 'person', label: 'Mi Perfil', href: '/perfil-exalumno' },
  { key: 'mentorias', icon: 'handshake', label: 'Mentorías', href: '/mentorias' },
  { key: 'estudiantes', icon: 'group', label: 'Estudiantes', href: '/estudiantes' },
  { key: 'donaciones', icon: 'volunteer_activism', label: 'Donaciones', href: '/donaciones' },
  { key: 'posiciones', icon: 'work', label: 'Posiciones', href: '/mis-posiciones' },
  { key: 'comunidad', icon: 'forum', label: 'Comunidad', href: '/blog' },
  { key: 'ayuda', icon: 'help', label: 'Ayuda', href: '/ayuda' },
];

const card = 'rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all';

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

  useEffect(() => {
    if (!token) return;
    let activo = true;
    Promise.all([obtenerMiPerfilExalumno(token), obtenerCatalogos(token)])
      .then(([p, c]) => { if (activo) { setFull(p?.perfil ?? null); setCat(c ?? null); } })
      .catch(() => {});
    if (userId) {
      obtenerMisDonaciones(token, userId)
        .then((r) => { if (activo) setDonaciones((Array.isArray(r) ? r : r?.data ?? []) as Donacion[]); })
        .catch(() => { if (activo) setDonaciones(null); });
    }
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

  const STATS = [
    { valor: experiencia ? `${experiencia}+` : '—', label: 'Años de experiencia', destacado: true },
    { valor: full?.ofrece_mentoria && full?.horas_disponibles_mes ? `${full.horas_disponibles_mes}h` : '—', label: 'Horas mentoría / mes' },
    { valor: dash(proyectosApoyados), label: 'Proyectos apoyados' },
    { valor: dash((donaciones ?? []).length), label: 'Donaciones realizadas' },
  ];

  return (
    <div className="min-h-screen bg-background font-body-base text-on-background antialiased">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col gap-2 border-r border-outline-variant bg-surface-container-low p-6">
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
                : 'flex items-center gap-4 rounded-lg p-3.5 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface'}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
        <button type="button" onClick={onSignOut}
          className="mt-auto flex items-center gap-4 rounded-lg border-t border-outline-variant p-3.5 pt-6 text-on-surface-variant transition-all hover:text-error">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-semibold">Cerrar sesión</span>
        </button>
      </aside>

      {/* Header */}
      <header className="fixed left-64 right-0 top-0 z-40 h-16 border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-8">
          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-full bg-surface-container px-4 py-2 md:flex">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input className="w-full border-none bg-transparent text-sm outline-none placeholder:text-on-surface-variant" placeholder="Buscar mentores, egresados o eventos..." />
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined cursor-pointer rounded-full p-2 text-on-surface-variant hover:bg-surface-container">notifications</span>
            <div className="hidden text-right lg:block">
              <p className="text-sm font-bold text-on-surface">{primerNombre} Machado</p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Mentor Senior</p>
            </div>
            {foto
              ? <img src={foto} alt={nombre} className="h-10 w-10 rounded-full border-2 border-primary-container object-cover" />
              : <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary">{iniciales || 'E'}</div>}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ml-64 min-h-screen px-8 pb-12 pt-24">
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

          {/* Encabezado de perfil + stats */}
          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 flex flex-col items-start gap-6 rounded-2xl border border-outline-variant bg-surface-container-low p-6 md:flex-row md:items-center lg:col-span-8">
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
                  <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-secondary-container">Mentor Senior</span>
                </div>
                <p className="mb-4 text-lg text-on-surface-variant">{cargo}{empresa ? ` · ${empresa}` : ''}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-[20px]">location_on</span>{ciudad}</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-[20px]">school</span>{facultad}</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>Generación {anio}</span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 md:w-auto">
                <Link href="/mentorias" className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-bold text-on-primary shadow-md transition-transform hover:-translate-y-0.5">
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
                <div key={s.label} className={`${card} flex flex-col items-center justify-center p-5 text-center ${s.destacado ? 'bg-primary-container' : ''}`}>
                  <span className={`font-display-lg text-3xl font-bold ${s.destacado ? 'text-on-primary-container' : 'text-secondary'}`}>{s.valor}</span>
                  <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${s.destacado ? 'text-on-primary-container/80' : 'text-on-surface-variant'}`}>{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cuerpo: izquierda (bio/áreas/acciones) + derecha (match/actividad) */}
          <div className="grid grid-cols-12 items-start gap-6">
            <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
              {/* Biografía */}
              <section className={`${card} p-6 sm:p-8`}>
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
              <section className={`${card} p-6 sm:p-8`}>
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
              <section className={`${card} p-6 sm:p-8`}>
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
                    { icon: 'handshake', t: 'Ofrecer mentoría', href: '/mentorias' },
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
            </div>

            {/* Derecha */}
            <aside className="col-span-12 flex flex-col gap-6 lg:col-span-4">
              {/* Match Estratégico */}
              <div className="relative overflow-hidden rounded-2xl border border-primary bg-gradient-to-br from-primary to-secondary p-7 text-on-primary shadow-xl">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="mb-6 flex items-start justify-between">
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-black uppercase text-on-secondary-container">Match estratégico</span>
                    <div className="text-right"><span className="font-display-lg text-2xl leading-none">95%</span><p className="text-[10px] font-bold opacity-80">Afinidad</p></div>
                  </div>
                  <div className="mb-6 flex items-center justify-center gap-3">
                    <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full border-2 border-white/40 bg-white/10 font-bold">
                      {foto ? <img src={foto} alt={nombre} className="h-full w-full object-cover" /> : (iniciales || 'E')}
                    </div>
                    <span className="material-symbols-outlined text-secondary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-secondary-fixed-dim bg-white/10 font-bold">AS</div>
                  </div>
                  <p className="mb-5 text-center font-body-semibold">Conexión recomendada con <strong>Adriana Solano</strong></p>
                  <div className="mb-6 space-y-2 border-t border-white/20 pt-4">
                    {(areas.length ? areas : ['Tecnología', 'Innovación']).slice(0, 3).map((a) => (
                      <p key={a} className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[18px] text-secondary-fixed-dim">check_circle</span>{a}</p>
                    ))}
                  </div>
                  <Link href="/estudiantes" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#54BCEB] py-3.5 font-bold text-primary transition-transform hover:scale-[1.02]">
                    Ver estudiantes <span className="material-symbols-outlined">bolt</span>
                  </Link>
                </div>
              </div>

              {/* Actividad reciente */}
              <div className={`${card} p-6`}>
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

      <footer className="ml-64 flex items-center justify-center gap-3 border-t border-outline-variant bg-surface-container-lowest py-5 text-xs text-on-surface-variant">
        <AlumniLogo height={26} /> © 2026 Alumni UCR · Universidad de Costa Rica
      </footer>
    </div>
  );
}
