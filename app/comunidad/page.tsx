'use client';

// Comunidad (estudiante): adaptación del Stitch a la marca. Hub de la red con
// hero, impacto, próximos eventos, mentorías y proyectos destacados, noticias y
// feed de actividad. Contenido ilustrativo (la red real se conectará al backend);
// el saludo del feed usa la fuente única (perfil).

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';

const bento = 'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-0.5';

const EVENTOS = [
  { mes: 'NOV', dia: '24', titulo: 'Feria de Empleo Tech 2026', detalle: 'Webinar • 10:00 AM', etiqueta: 'GRATUITO', cls: 'bg-primary-container text-on-primary-container', bd: 'bg-primary' },
  { mes: 'DIC', dia: '02', titulo: 'Mentoría: IA en Costa Rica', detalle: 'Panel presencial • 2:00 PM', etiqueta: 'CUPOS LLENOS', cls: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', bd: 'bg-secondary' },
];

const PROYECTOS = [
  { icon: 'verified', match: '98% MATCH', matchCls: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', borde: 'border-t-secondary', titulo: 'Optimización de redes de suministro con IA', meta: 'TFG finalizado • Ingeniería Industrial', desc: 'Algoritmos genéticos para reducir la huella de carbono en logística regional…', autor: 'Marco Herrera' },
  { icon: 'description', match: '92% MATCH', matchCls: 'bg-primary-fixed text-on-primary-fixed-variant', borde: 'border-t-primary', titulo: 'Plataforma educativa para zonas rurales', meta: 'TFG • Ciencias de la Computación', desc: 'PWA de bajo consumo de datos para tele-aprendizaje sin conexión…', autor: 'Sofía Castro' },
];

const BLOGS = [
  { cat: 'FUNDACIÓN UCR', lectura: '15 MIN DE LECTURA', titulo: 'De las aulas al mercado global: la historia de EcoStack', desc: 'Cómo un equipo de tres recién graduados de Ingeniería convirtió su proyecto de grado en una startup que opera en 5 países de Latinoamérica…', likes: 124, coments: 32, icon: 'eco' },
  { cat: 'EVENTOS', lectura: '8 MIN DE LECTURA', titulo: 'Noche de Gala Alumni 2026: fortaleciendo lazos', desc: 'Un resumen del encuentro anual más importante de nuestra comunidad, donde se premió a los líderes que impactaron el sector público y privado…', likes: 89, coments: 12, icon: 'celebration' },
];

export default function ComunidadPage() {
  const router = useRouter();
  const { token, loading } = useAuth();
  const { perfil } = usePerfilEstudiante();

  useEffect(() => {
    if (!loading && !token) router.replace('/login');
  }, [loading, token, router]);

  const nombre = perfil.nombre || 'estudiante';

  const ACTIVIDAD = [
    { icon: 'handshake', borde: 'border-secondary', bg: 'bg-secondary/10', ic: 'text-secondary', texto: <><span className="font-bold">Nuevo match:</span> tu perfil coincide en un 95% con la vacante de <span className="font-bold text-secondary">Senior Web Lead</span> en Banco Nacional.</>, tiempo: 'Hace 15 minutos' },
    { icon: 'workspace_premium', borde: 'border-primary', bg: 'bg-primary/10', ic: 'text-primary', texto: <><span className="font-bold">Logro desbloqueado:</span> completaste <span className="font-bold">5 sesiones de mentoría</span> este semestre. ¡Seguí así!</>, tiempo: 'Hace 2 horas' },
    { icon: 'group_add', borde: 'border-outline', bg: 'bg-surface-container', ic: 'text-on-surface-variant', texto: <><span className="font-bold">Juan Pérez</span> y 3 exalumnos más se unieron a tu red de contactos.</>, tiempo: 'Ayer' },
    { icon: 'post_add', borde: 'border-tertiary', bg: 'bg-tertiary-fixed', ic: 'text-tertiary-container', texto: <><span className="font-bold">{nombre}</span>, hay 3 nuevos artículos en el blog que podrían interesarte.</>, tiempo: 'Ayer' },
  ];

  return (
    <StudentShell active="comunidad">
      <div className="mx-auto w-full max-w-[1280px] space-y-8 p-6 lg:p-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary p-8 text-white">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <h1 className="mb-3 font-headline-md text-2xl leading-tight sm:text-3xl">Conectando talentos, construyendo futuros</h1>
            <p className="mb-6 max-w-lg text-white/90">
              Sumate a la red de la comunidad UCR. Compartí experiencias, escalá profesionalmente y dejá tu huella en
              la próxima generación.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => notificar('✍️ Crear blog — en desarrollo')} className="flex items-center gap-2 rounded-xl bg-[#54BCEB] px-6 py-3 font-bold text-primary transition-transform hover:scale-105">
                <span className="material-symbols-outlined">add_circle</span> Crear Blog
              </button>
              <button onClick={() => notificar('📊 Reporte de impacto — en desarrollo')} className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-bold backdrop-blur-md transition-all hover:bg-white/20">
                Ver Reporte de Impacto
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Impacto de la Red */}
          <div className={`${bento} flex flex-col p-6 md:col-span-8`}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-headline-md text-xl text-primary">Impacto de la red</h3>
              <span className="text-xs font-semibold text-on-surface-variant">ACTUALIZADO HOY</span>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                <p className="mb-1 text-xs font-bold text-on-surface-variant">EMPLEABILIDAD</p>
                <p className="text-2xl font-bold text-primary">87%</p>
                <div className="mt-2 h-1 w-full rounded-full bg-surface-container-high"><div className="h-full rounded-full bg-secondary" style={{ width: '87%' }} /></div>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                <p className="mb-1 text-xs font-bold text-on-surface-variant">PROYECTOS ÉXITO</p>
                <p className="text-2xl font-bold text-primary">1.2k</p>
                <p className="text-[10px] font-bold text-on-tertiary-container">+12% este mes</p>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                <p className="mb-1 text-xs font-bold text-on-surface-variant">COMMUNITY HUB</p>
                <p className="text-2xl font-bold text-primary">15k</p>
                <p className="text-[10px] text-on-surface-variant">Miembros activos</p>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-outline bg-surface-container-lowest p-4">
              <div className="flex flex-col items-center text-on-surface-variant">
                <span className="material-symbols-outlined mb-2 text-4xl">monitoring</span>
                <p className="text-sm font-body-semibold italic">Crecimiento histórico de la comunidad</p>
              </div>
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className={`${bento} bg-surface-container-low p-6 md:col-span-4`}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-headline-md text-xl text-primary">Próximos eventos</h3>
              <button onClick={() => notificar('📅 Agenda completa — en desarrollo')} className="text-xs font-bold text-secondary hover:underline">Ver todo</button>
            </div>
            <div className="space-y-4">
              {EVENTOS.map((e) => (
                <div key={e.titulo} className="group flex cursor-pointer items-start gap-4 rounded-xl border border-outline-variant bg-white p-4 transition-colors hover:border-secondary" onClick={() => notificar(`🎟️ ${e.titulo} — en desarrollo`)}>
                  <div className={`min-w-[50px] rounded-lg ${e.bd} p-2 text-center text-white`}>
                    <p className="text-[10px] font-bold">{e.mes}</p>
                    <p className="text-lg font-bold">{e.dia}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary transition-colors group-hover:text-secondary">{e.titulo}</h4>
                    <p className="mb-2 text-xs text-on-surface-variant">{e.detalle}</p>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${e.cls}`}>{e.etiqueta}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => notificar('➕ Sugerir evento — en desarrollo')} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant py-3 text-sm font-bold text-on-surface-variant transition-all hover:border-secondary hover:text-secondary">
                <span className="material-symbols-outlined">calendar_add_on</span> Sugerir evento
              </button>
            </div>
          </div>

          {/* Top Mentorías y Proyectos */}
          <div className="md:col-span-12">
            <h3 className="mb-6 font-headline-md text-2xl text-primary">Top mentorías y proyectos</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Mentor */}
              <div className={`${bento} flex flex-col overflow-hidden`}>
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary to-secondary">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-white/15 font-display-lg text-3xl font-bold text-white">RS</span>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-primary">Roberto Solano</h4>
                      <p className="text-sm text-on-surface-variant">Cloud Architect • Google</p>
                    </div>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">Mentor Pro</span>
                  </div>
                  <div className="mb-6 flex flex-wrap gap-1.5">
                    {['AWS', 'Scalability', 'DevOps'].map((t) => <span key={t} className="rounded border border-secondary/20 bg-secondary/5 px-2 py-1 text-[10px] font-bold text-primary">{t}</span>)}
                  </div>
                  <button onClick={() => notificar('🤝 Contactar mentor — en desarrollo')} className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">Contactar mentor</button>
                </div>
              </div>

              {/* Proyectos */}
              {PROYECTOS.map((p) => (
                <div key={p.titulo} className={`${bento} flex flex-col justify-between border-t-4 ${p.borde} p-6`}>
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="material-symbols-outlined text-secondary">{p.icon}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${p.matchCls}`}>{p.match}</span>
                    </div>
                    <h4 className="mb-2 text-lg font-bold leading-tight text-primary">{p.titulo}</h4>
                    <p className="mb-4 text-xs text-on-surface-variant">{p.meta}</p>
                    <p className="line-clamp-3 text-sm text-primary/80">{p.desc}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-outline-variant pt-4">
                    <p className="text-xs font-bold text-primary">Autor: {p.autor}</p>
                    <button onClick={() => notificar(`📂 ${p.titulo} — en desarrollo`)} className="material-symbols-outlined text-secondary">arrow_forward</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Noticias y Casos de Éxito */}
          <div className="space-y-6 md:col-span-9">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-2xl text-primary">Noticias y casos de éxito</h3>
              <button onClick={() => notificar('⚙️ Filtros — en desarrollo')} className="rounded-lg border border-outline-variant p-2 transition-colors hover:bg-surface-container">
                <span className="material-symbols-outlined text-sm">tune</span>
              </button>
            </div>
            {BLOGS.map((b) => (
              <article key={b.titulo} className={`${bento} flex flex-col overflow-hidden md:flex-row`}>
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-secondary/20 to-primary/20 md:h-auto md:w-2/5">
                  <span className="material-symbols-outlined text-5xl text-primary/40">{b.icon}</span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-secondary">
                      <span>{b.cat}</span><span>•</span><span>{b.lectura}</span>
                    </div>
                    <h4 className="mb-3 text-xl font-bold text-primary">{b.titulo}</h4>
                    <p className="line-clamp-3 text-sm text-on-surface-variant">{b.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">thumb_up</span> {b.likes}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">mode_comment</span> {b.coments}</span>
                    </div>
                    <button onClick={() => notificar(`📖 ${b.titulo} — en desarrollo`)} className="flex items-center gap-1 text-sm font-bold text-primary">Leer más <span className="material-symbols-outlined">chevron_right</span></button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Actividad Reciente */}
          <div className="md:col-span-3">
            <h3 className="mb-6 font-headline-md text-xl text-primary">Actividad reciente</h3>
            <div className={`${bento} relative overflow-hidden p-6`}>
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-container/10 blur-3xl" />
              <div className="relative z-10 space-y-6">
                {ACTIVIDAD.map((a, i) => (
                  <div key={i} className={`flex gap-4 border-l-2 ${a.borde} pl-4`}>
                    <div className={`grid h-8 min-w-[32px] place-items-center rounded-full ${a.bg}`}>
                      <span className={`material-symbols-outlined text-sm ${a.ic}`}>{a.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs leading-snug text-on-surface">{a.texto}</p>
                      <p className="mt-1 text-[10px] text-on-surface-variant">{a.tiempo}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => notificar('🔔 Todas las notificaciones — en desarrollo')} className="mt-6 w-full rounded-lg py-2 text-xs font-bold text-secondary transition-colors hover:bg-secondary/5">Ver todas las notificaciones</button>
            </div>
          </div>
        </div>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm font-bold text-primary">Alumni UCR — Conectando Talento</p>
            <p className="text-xs text-on-surface-variant">© 2026 Universidad de Costa Rica. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-3">
            {['link', 'language', 'mail'].map((ic) => (
              <button key={ic} onClick={() => notificar('🔗 Enlace — en desarrollo')} className="rounded-full bg-primary p-2 text-white transition-colors hover:bg-secondary">
                <span className="material-symbols-outlined text-sm">{ic}</span>
              </button>
            ))}
          </div>
        </footer>
      </div>
    </StudentShell>
  );
}
