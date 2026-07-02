'use client';

// Centro de Matches (estudiante): diseño Stitch adaptado a la marca, ahora con
// datos reales. Necesidades y tip salen de la fuente única (perfil); los perfiles
// sugeridos son exalumnos reales del directorio (RF-02) puntuados por afinidad; y
// las solicitudes salen del motor de matches RF-06 (/matches-mentoria/mis-matches).

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
import { obtenerSugeridos, obtenerMisMatches, conectarConExalumno } from '@/lib/matchesEstudiante';

const bento = 'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-0.5';

// Mapa de los tipos de apoyo del perfil a tarjetas de "necesidad".
const NECESIDADES: Record<string, { etiqueta: string; color: string; titulo: string; desc: string }> = {
  mentoria: { etiqueta: 'Mentoría Técnica', color: 'bg-secondary', titulo: 'Guía y mentoría especializada', desc: 'Busco un experto que me oriente en los retos técnicos de mi proyecto.' },
  pasantia: { etiqueta: 'Pasantía Académica', color: 'bg-tertiary-container', titulo: 'Práctica en un entorno real', desc: 'Necesito validar el impacto de mi trabajo en un entorno profesional.' },
  empleo: { etiqueta: 'Empleabilidad', color: 'bg-primary', titulo: 'Oportunidad laboral', desc: 'Estoy en busca de mi primera oportunidad profesional alineada a mi carrera.' },
  financiamiento: { etiqueta: 'Patrocinio', color: 'bg-secondary', titulo: 'Apoyo o financiamiento', desc: 'Busco patrocinio para llevar mi proyecto al siguiente nivel.' },
};

const ESTADO_SOLICITUD: Record<string, { label: string; color: string; barra: string; pct: number }> = {
  sugerido: { label: 'Sugerido', color: 'text-outline', barra: 'bg-outline', pct: 20 },
  contactado: { label: 'En revisión', color: 'text-secondary', barra: 'bg-secondary', pct: 65 },
  activo: { label: 'Conectado', color: 'text-tertiary', barra: 'bg-tertiary', pct: 100 },
};

function completitud(p: ReturnType<typeof usePerfilEstudiante>['perfil']): number {
  const campos = [
    p.nombre, p.apellidos, p.telefono, p.carrera, p.resumen, p.foto,
    p.proyectoTitulo, p.habilidadesTecnicas,
    p.experiencias.length ? 'x' : '', p.intereses.length ? 'x' : '',
  ];
  const llenos = campos.filter((c) => String(c).trim()).length;
  return Math.round((llenos / campos.length) * 100);
}

const iniciales = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function MisMatchesPage() {
  const router = useRouter();
  const { token, loading } = useAuth();
  const { perfil } = usePerfilEstudiante();

  const [sugeridos, setSugeridos] = useState<any[]>([]);
  const [misMatches, setMisMatches] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [conectando, setConectando] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) router.replace('/login');
  }, [loading, token, router]);

  // Carga real: exalumnos del directorio (puntuados) + matches del motor RF-06.
  useEffect(() => {
    let activo = true;
    (async () => {
      const [sug, mm] = await Promise.all([
        obtenerSugeridos(perfil),
        token ? obtenerMisMatches(token) : Promise.resolve([]),
      ]);
      if (!activo) return;
      setSugeridos(sug);
      setMisMatches(mm);
      setCargando(false);
    })();
    return () => { activo = false; };
  }, [perfil, token]);

  const pct = useMemo(() => completitud(perfil), [perfil]);
  const necesidades = useMemo(() => {
    const activas = (Object.keys(NECESIDADES) as (keyof typeof perfil.apoyo)[])
      .filter((k) => perfil.apoyo[k])
      .map((k) => NECESIDADES[k]);
    return activas.length ? activas.slice(0, 2) : [NECESIDADES.mentoria, NECESIDADES.pasantia];
  }, [perfil.apoyo]);
  const proyecto = perfil.proyectoTitulo || 'tu proyecto de graduación';
  const fortaleza = perfil.habilidadesTecnicas?.split(',')[0]?.trim() || perfil.carrera || 'tu área';

  const destacado = sugeridos[0] || null;
  const resto = sugeridos.slice(1, 6);
  const solicitudes = misMatches.filter((m) => m.estado !== 'sugerido');

  // Inicia la conexión real (RF-06): crea/usa el match y dispara el email al exalumno.
  const conectar = async (idExalumno: string, nombre: string) => {
    if (!token || conectando) return;
    setConectando(idExalumno);
    try {
      await conectarConExalumno(token, idExalumno, misMatches);
      notificar(`✅ Le avisamos a ${nombre} que querés conectar. Te va a llegar su contacto cuando acepte.`);
      const actualizados = await obtenerMisMatches(token);
      setMisMatches(actualizados);
    } catch {
      notificar('❌ No pudimos enviar la solicitud. Intentá de nuevo en un momento.');
    } finally {
      setConectando(null);
    }
  };

  return (
    <StudentShell active="matches">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 p-6 lg:p-8">
        {/* Encabezado */}
        <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-headline-md text-2xl text-primary sm:text-3xl">Centro de Matches</h1>
            <p className="max-w-2xl text-on-surface-variant">
              Potenciá tu carrera conectando con la red de egresados de la UCR. Encontrá mentoría estratégica y
              oportunidades alineadas a tu TFG.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
            <span className="material-symbols-outlined text-[16px]">bolt</span> {pct}% Perfil Completado
          </span>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Columna izquierda */}
          <div className="space-y-6 lg:col-span-8">
            {/* Mis Necesidades */}
            <div className={`${bento} p-6`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-body-semibold text-primary">
                  <span className="material-symbols-outlined text-secondary">campaign</span> Mis Necesidades Actuales
                </h2>
                <button onClick={() => notificar('🚧 Publicar nueva necesidad — en desarrollo')} className="flex items-center gap-1 text-sm font-bold uppercase tracking-wide text-secondary hover:underline">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span> Publicar
                </button>
              </div>
              <p className="mb-4 text-xs italic text-on-surface-variant">Relacionado a: “{proyecto}”</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {necesidades.map((n, i) => (
                  <div key={i} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                    <span className={`mb-2 inline-block rounded px-2 py-1 text-[10px] font-bold uppercase text-white ${n.color}`}>{n.etiqueta}</span>
                    <h3 className="mb-1 font-body-semibold text-primary">{n.titulo}</h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Estratégico (mejor exalumno real) */}
            {destacado ? (
              <div className="overflow-hidden rounded-xl shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]">
                <div className="flex flex-col items-center gap-8 bg-gradient-to-br from-primary to-secondary p-8 md:flex-row">
                  <div className="relative shrink-0">
                    <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-xl border-4 border-secondary-container/30 bg-white/10 font-display-lg text-4xl font-bold text-white">
                      {destacado.foto_perfil ? <img src={destacado.foto_perfil} alt={destacado.nombre} className="h-full w-full object-cover" /> : iniciales(destacado.nombre)}
                    </div>
                    <span className="absolute -bottom-2 -right-2 rounded-lg bg-secondary-container px-2 py-1 text-[10px] font-bold text-on-secondary-container shadow-lg">MATCH {destacado.score}%</span>
                  </div>
                  <div className="flex-1 space-y-2 text-center text-white md:text-left">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      <span className="material-symbols-outlined text-[18px] text-secondary-fixed-dim">verified</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Mejor afinidad para vos</span>
                    </div>
                    <h2 className="font-headline-md text-2xl leading-none">{destacado.nombre}</h2>
                    <p className="text-secondary-fixed-dim">
                      {(destacado.carreras?.[0] || 'Exalumno UCR')}{destacado.anio_graduacion ? ` · UCR ’${String(destacado.anio_graduacion).slice(-2)}` : ''}
                    </p>
                    <p className="mx-auto max-w-lg text-sm leading-relaxed opacity-90 md:mx-0">
                      {destacado.comunes?.length
                        ? `Comparten interés en ${destacado.comunes.slice(0, 3).join(', ')}. Puede aportar a ${proyecto}.`
                        : `Forma parte de la red UCR y puede aportar a ${proyecto}.`}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-3 md:justify-start">
                      <button
                        onClick={() => conectar(destacado.id, destacado.nombre)}
                        disabled={conectando === destacado.id}
                        className="flex items-center gap-2 rounded-lg bg-[#54BCEB] px-6 py-3 text-sm font-bold text-primary transition-transform hover:scale-105 disabled:opacity-60"
                      >
                        {conectando === destacado.id ? 'Enviando…' : 'Solicitar Mentoría'} <span className="material-symbols-outlined text-[18px]">send</span>
                      </button>
                      <button onClick={() => router.push('/directorio')} className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
                        Ver Directorio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${bento} p-8 text-center`}>
                <span className="material-symbols-outlined mb-2 text-4xl text-outline">groups</span>
                <p className="font-body-semibold text-primary">{cargando ? 'Buscando perfiles afines…' : 'Aún no hay exalumnos en el directorio'}</p>
                <p className="text-sm text-on-surface-variant">Completá tus áreas e intereses en el perfil para mejorar tus coincidencias.</p>
              </div>
            )}

            {/* Perfiles Sugeridos (exalumnos reales) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-body-semibold text-primary">Perfiles Sugeridos {sugeridos.length > 0 && <span className="text-on-surface-variant">· {sugeridos.length}</span>}</h2>
              </div>
              <div className="space-y-3">
                {resto.length === 0 ? (
                  <div className={`${bento} p-6 text-center text-sm text-on-surface-variant`}>
                    {cargando ? 'Cargando…' : 'No hay más perfiles por ahora. ¡Volvé pronto!'}
                  </div>
                ) : resto.map((s) => (
                  <div key={s.id} className={`${bento} flex items-center justify-between p-4`}>
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">
                        {s.foto_perfil ? <img src={s.foto_perfil} alt={s.nombre} className="h-full w-full object-cover" /> : iniciales(s.nombre)}
                      </div>
                      <div>
                        <h4 className="font-body-semibold text-primary">{s.nombre}</h4>
                        <p className="text-xs text-on-surface-variant">{s.carreras?.[0] || s.facultades?.[0] || 'Exalumno UCR'}{s.ciudad ? ` · ${s.ciudad}` : ''}</p>
                      </div>
                    </div>
                    <div className="hidden gap-2 md:flex">
                      {(s.comunes?.length ? s.comunes : s.areas || []).slice(0, 2).map((t: string) => <span key={t} className="rounded bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase text-secondary">{t}</span>)}
                      {s.score > 0 && <span className="rounded bg-tertiary/10 px-2 py-1 text-[10px] font-bold text-tertiary">{s.score}%</span>}
                    </div>
                    <button
                      onClick={() => conectar(s.id, s.nombre)}
                      disabled={conectando === s.id}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-400 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_add</span> {conectando === s.id ? 'Enviando…' : 'Conectar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6 lg:col-span-4">
            {/* Solicitudes (matches reales RF-06) */}
            <div className={`${bento} p-6`}>
              <h3 className="mb-6 flex items-center justify-between text-sm font-bold uppercase tracking-wide text-primary">
                Solicitudes Enviadas
                {solicitudes.length > 0 && <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] text-on-secondary-container">{solicitudes.length} ACTIVAS</span>}
              </h3>
              {solicitudes.length === 0 ? (
                <div className="flex items-start gap-3 rounded-lg bg-surface-container-low p-4">
                  <span className="material-symbols-outlined text-outline">outgoing_mail</span>
                  <p className="text-sm text-on-surface-variant">Todavía no enviaste solicitudes. Conectá con un perfil sugerido para empezar.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {solicitudes.map((m) => {
                    const e = ESTADO_SOLICITUD[m.estado] || ESTADO_SOLICITUD.sugerido;
                    return (
                      <div key={m.id}>
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="font-body-semibold text-primary">{m.usuarios?.nombre || 'Conexión'}</span>
                          <span className={e.color}>{e.label}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                          <div className={`h-full ${e.barra}`} style={{ width: `${e.pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tip de IA (personalizado con el perfil) */}
            <div className="rounded-xl border-none bg-[#E6F4F9] p-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-3xl text-secondary">psychology</span>
                <div>
                  <h3 className="font-body-semibold text-primary">Tip de IA</h3>
                  <p className="mt-1 text-sm text-on-secondary-fixed-variant">
                    Tu perfil destaca en <b>{fortaleza}</b>. Contactar mentores con esa etiqueta puede aumentar tus
                    chances de match.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats reales */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`${bento} p-4 text-center`}>
                <p className="text-2xl font-bold text-secondary">{sugeridos.length}</p>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Perfiles afines</p>
              </div>
              <div className={`${bento} p-4 text-center`}>
                <p className="text-2xl font-bold text-secondary">{misMatches.length}</p>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Mis matches</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
