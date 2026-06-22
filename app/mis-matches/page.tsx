'use client';

// Centro de Matches (estudiante): adaptación del Stitch a la marca. Layout bento
// con necesidades actuales (derivadas del perfil), match estratégico sugerido,
// perfiles sugeridos, estado de solicitudes y tips de IA. Conectado a la fuente
// única (perfil) en los datos personalizables; las sugerencias son ilustrativas.

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';

const bento = 'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-0.5';

// Mapa de los tipos de apoyo del perfil a tarjetas de "necesidad".
const NECESIDADES: Record<string, { etiqueta: string; color: string; titulo: string; desc: string }> = {
  mentoria: { etiqueta: 'Mentoría Técnica', color: 'bg-secondary', titulo: 'Guía y mentoría especializada', desc: 'Busco un experto que me oriente en los retos técnicos de mi proyecto.' },
  pasantia: { etiqueta: 'Pasantía Académica', color: 'bg-tertiary-container', titulo: 'Práctica en un entorno real', desc: 'Necesito validar el impacto de mi trabajo en un entorno profesional.' },
  empleo: { etiqueta: 'Empleabilidad', color: 'bg-primary', titulo: 'Oportunidad laboral', desc: 'Estoy en busca de mi primera oportunidad profesional alineada a mi carrera.' },
  financiamiento: { etiqueta: 'Patrocinio', color: 'bg-secondary', titulo: 'Apoyo o financiamiento', desc: 'Busco patrocinio para llevar mi proyecto al siguiente nivel.' },
};

// Perfiles sugeridos (ilustrativos; la red real se conectará al backend).
const SUGERIDOS = [
  { nombre: 'Lucía Méndez', rol: 'HR Director · Especialista en Selección', tags: ['Empleabilidad', 'RRHH'], ini: 'LM' },
  { nombre: 'Carlos Vargas', rol: 'Data Scientist · Investigador UCR', tags: ['Investigación', 'Python'], ini: 'CV' },
  { nombre: 'Marcela Ávila', rol: 'Product Lead · Exalumna UCR ’12', tags: ['Producto', 'Mentoría'], ini: 'MA' },
];

const SOLICITUDES = [
  { titulo: 'Mentoría: Roberto Solano', estado: 'En revisión', color: 'text-secondary', barra: 'bg-secondary', pct: 65, tiempo: 'Enviado hace 2 días' },
  { titulo: 'Pasantía: Intel CR', estado: 'Entrevista pendiente', color: 'text-tertiary', barra: 'bg-tertiary', pct: 90, tiempo: 'Enviado hace 5 días' },
  { titulo: 'Colaboración: Ana Rojas', estado: 'Pendiente', color: 'text-outline', barra: 'bg-outline', pct: 20, tiempo: 'Enviado hace 1 hora' },
];

function completitud(p: ReturnType<typeof usePerfilEstudiante>['perfil']): number {
  const campos = [
    p.nombre, p.apellidos, p.telefono, p.carrera, p.resumen, p.foto,
    p.proyectoTitulo, p.habilidadesTecnicas,
    p.experiencias.length ? 'x' : '', p.intereses.length ? 'x' : '',
  ];
  const llenos = campos.filter((c) => String(c).trim()).length;
  return Math.round((llenos / campos.length) * 100);
}

export default function MisMatchesPage() {
  const router = useRouter();
  const { token, loading } = useAuth();
  const { perfil } = usePerfilEstudiante();

  useEffect(() => {
    if (!loading && !token) router.replace('/login');
  }, [loading, token, router]);

  const pct = useMemo(() => completitud(perfil), [perfil]);
  const nombre = `${perfil.nombre} ${perfil.apellidos}`.trim() || 'Estudiante';
  const necesidades = useMemo(() => {
    const activas = (Object.keys(NECESIDADES) as (keyof typeof perfil.apoyo)[])
      .filter((k) => perfil.apoyo[k])
      .map((k) => NECESIDADES[k]);
    return activas.length ? activas.slice(0, 2) : [NECESIDADES.mentoria, NECESIDADES.pasantia];
  }, [perfil.apoyo]);
  const proyecto = perfil.proyectoTitulo || 'tu proyecto de graduación';
  const fortaleza = perfil.habilidadesTecnicas?.split(',')[0]?.trim() || perfil.carrera || 'tu área';

  return (
    <StudentShell active="matches">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 p-6 lg:p-8">
        {/* Encabezado */}
        <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-headline-md text-2xl text-primary sm:text-3xl">Centro de Matches</h1>
            <p className="max-w-2xl text-on-surface-variant">
              Potenciá tu carrera conectando con la red de egresados más influyente del país. Encontrá mentoría
              estratégica y oportunidades alineadas a tu TFG.
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

            {/* Match Estratégico */}
            <div className="overflow-hidden rounded-xl shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]">
              <div className="flex flex-col items-center gap-8 bg-gradient-to-br from-primary to-secondary p-8 md:flex-row">
                <div className="relative shrink-0">
                  <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-xl border-4 border-secondary-container/30 bg-white/10 font-display-lg text-4xl font-bold text-white">
                    RS
                  </div>
                  <span className="absolute -bottom-2 -right-2 rounded-lg bg-secondary-container px-2 py-1 text-[10px] font-bold text-on-secondary-container shadow-lg">MATCH 98%</span>
                </div>
                <div className="flex-1 space-y-2 text-center text-white md:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                    <span className="material-symbols-outlined text-[18px] text-secondary-fixed-dim">verified</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Match sugerido por IA</span>
                  </div>
                  <h2 className="font-headline-md text-2xl leading-none">Roberto Solano</h2>
                  <p className="text-secondary-fixed-dim">Lead AI Engineer @ TechFlow · Exalumno UCR ’05</p>
                  <p className="mx-auto max-w-lg text-sm leading-relaxed opacity-90 md:mx-0">
                    15 años de experiencia en automatización con Machine Learning. Puede asesorarte en la validación
                    técnica de la arquitectura de {proyecto}.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-3 md:justify-start">
                    <button onClick={() => notificar('🤝 Solicitud de mentoría enviada (demo)')} className="flex items-center gap-2 rounded-lg bg-[#54BCEB] px-6 py-3 text-sm font-bold text-primary transition-transform hover:scale-105">
                      Solicitar Mentoría <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                    <button onClick={() => notificar('👤 Vista de perfil — en desarrollo')} className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
                      Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Perfiles Sugeridos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-body-semibold text-primary">Perfiles Sugeridos</h2>
                <select className="cursor-pointer border-none bg-transparent text-sm font-semibold text-secondary focus:ring-0">
                  <option>Todas las áreas</option>
                  <option>Tecnología</option>
                  <option>Mentoría</option>
                  <option>Empleo</option>
                </select>
              </div>
              <div className="space-y-3">
                {SUGERIDOS.map((s) => (
                  <div key={s.nombre} className={`${bento} flex items-center justify-between p-4`}>
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 font-bold text-primary">{s.ini}</div>
                      <div>
                        <h4 className="font-body-semibold text-primary">{s.nombre}</h4>
                        <p className="text-xs text-on-surface-variant">{s.rol}</p>
                      </div>
                    </div>
                    <div className="hidden gap-2 md:flex">
                      {s.tags.map((t) => <span key={t} className="rounded bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase text-secondary">{t}</span>)}
                    </div>
                    <button onClick={() => notificar(`➕ Solicitud enviada a ${s.nombre} (demo)`)} className="rounded-full p-2 text-secondary transition-colors hover:bg-secondary/10">
                      <span className="material-symbols-outlined">person_add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6 lg:col-span-4">
            {/* Solicitudes Enviadas */}
            <div className={`${bento} p-6`}>
              <h3 className="mb-6 flex items-center justify-between text-sm font-bold uppercase tracking-wide text-primary">
                Solicitudes Enviadas
                <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] text-on-secondary-container">3 ACTIVAS</span>
              </h3>
              <div className="space-y-6">
                {SOLICITUDES.map((s) => (
                  <div key={s.titulo}>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="font-body-semibold text-primary">{s.titulo}</span>
                      <span className={s.color}>{s.estado}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className={`h-full ${s.barra}`} style={{ width: `${s.pct}%` }} />
                    </div>
                    <p className="mt-2 text-[10px] text-on-surface-variant">{s.tiempo}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip de IA */}
            <div className="rounded-xl border-none bg-[#E6F4F9] p-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-3xl text-secondary">psychology</span>
                <div>
                  <h3 className="font-body-semibold text-primary">Tip de IA</h3>
                  <p className="mt-1 text-sm text-on-secondary-fixed-variant">
                    Tu perfil destaca en <b>{fortaleza}</b>. Contactar mentores con esa etiqueta puede aumentar tus
                    chances de match hasta un <b>25%</b>.
                  </p>
                  <button onClick={() => notificar('💡 Más consejos — en desarrollo')} className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">Ver más consejos</button>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`${bento} p-4 text-center`}>
                <p className="text-2xl font-bold text-secondary">14</p>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Vistas Perfil</p>
              </div>
              <div className={`${bento} p-4 text-center`}>
                <p className="text-2xl font-bold text-secondary">8</p>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Conexiones</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-outline-variant/30 px-2 py-4 text-[12px] text-on-surface-variant">
          <p>© 2026 Alumni Universidad de Costa Rica</p>
          <div className="flex gap-6">
            <button onClick={() => notificar('🆘 Centro de Ayuda — en desarrollo')} className="hover:text-primary">Centro de Ayuda</button>
            <button onClick={() => notificar('📄 Términos de Conexión — en desarrollo')} className="hover:text-primary">Términos de Conexión</button>
          </div>
        </footer>
      </div>
    </StudentShell>
  );
}
