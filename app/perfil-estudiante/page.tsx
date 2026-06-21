'use client';

// Mi Perfil (estudiante) — rediseño Stitch (estático). Contenido de ejemplo;
// se conectarán datos reales en una etapa posterior. Layout fiel al diseño.

import StudentShell from '@/components/student/StudentShell';

const SHADOW = 'shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';
const CARD = `rounded-xl border border-outline-variant bg-surface-container-lowest p-8 ${SHADOW}`;

function CampoLectura({ label, valor, resaltar }: { label: string; valor: string; resaltar?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-caps text-xs uppercase tracking-wider text-on-surface-variant">{label}</label>
      <div
        className={`rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 font-body-semibold ${
          resaltar ? 'text-primary' : ''
        }`}
      >
        {valor}
      </div>
    </div>
  );
}

export default function PerfilEstudiantePage() {
  return (
    <StudentShell active="perfil">
      <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-6 p-8">
        {/* ── Columna central (gestión central) ── */}
        <section className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          {/* Información Académica */}
          <div className={CARD}>
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-headline-md text-2xl text-primary">
                <span className="material-symbols-outlined">school</span>
                Información Académica
              </h3>
              <button className="flex items-center gap-1 text-secondary hover:underline">
                <span className="material-symbols-outlined text-lg">edit</span>
                <span className="font-body-semibold text-sm">Editar</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CampoLectura label="Carné" valor="C17482" />
              <CampoLectura label="Carrera" valor="Ingeniería de Software" resaltar />
              <CampoLectura label="Sede" valor="Rodrigo Facio (Central)" />
              <CampoLectura label="Año de Ingreso" valor="2021" />
            </div>
          </div>

          {/* Proyecto de Graduación (TFG) */}
          <div className={`relative overflow-hidden rounded-xl bg-primary p-8 text-on-primary ${SHADOW}`}>
            <div className="absolute right-0 top-0 p-6 opacity-10">
              <span className="material-symbols-outlined text-9xl">terminal</span>
            </div>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="font-headline-md text-xl">Proyecto de Graduación (TFG)</h3>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold">ACTUALIZADO HOY</span>
                  <button className="text-on-primary/80 transition-colors hover:text-on-primary">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
              </div>
              <p className="mb-4 font-body-semibold text-lg leading-tight">
                Sistema de Gestión de Talento basado en IA para la Red Alumni UCR
              </p>
              <div className="mb-6">
                <div className="mb-1 flex justify-between text-xs">
                  <span>Progreso de Desarrollo</span>
                  <span className="font-bold">75%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-primary-container">
                  <div className="h-full w-3/4 rounded-full bg-secondary-container shadow-[0_0_12px_rgba(106,207,255,0.6)]" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {['Data Science', 'Web Dev', 'IA/ML'].map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Empleabilidad + Trayectoria */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className={`${CARD} flex flex-col gap-4 !p-6`}>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                  <span className="material-symbols-outlined">work_history</span>
                </div>
                <h3 className="font-headline-md text-lg text-primary">Portal Empleabilidad</h3>
              </div>
              <p className="text-sm text-on-surface-variant">
                Accede a vacantes exclusivas para estudiantes y egresados UCR.
              </p>
              <a href="#" className="mt-auto rounded-lg bg-secondary py-2 text-center font-bold text-sm text-on-secondary transition-opacity hover:opacity-90">
                Ir a la Bolsa de Empleo
              </a>
            </div>
            <div className={`${CARD} flex flex-col gap-4 !p-6`}>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-tertiary/10 p-2 text-tertiary">
                  <span className="material-symbols-outlined">query_stats</span>
                </div>
                <h3 className="font-headline-md text-lg text-primary">Gestión de Trayectoria</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full w-3/5 bg-tertiary" />
                </div>
                <span className="text-[10px] font-bold text-tertiary">60% COMPLETO</span>
              </div>
              <button className="mt-auto rounded-lg border border-tertiary py-2 text-center font-bold text-sm text-tertiary transition-colors hover:bg-tertiary/5">
                Ver Mapa de Carrera
              </button>
            </div>
          </div>

          {/* Historial Académico y Experiencia */}
          <div className={CARD}>
            <div className="mb-8 flex items-center justify-between">
              <h3 className="font-headline-md text-xl text-primary">Historial Académico y Experiencia</h3>
              <button className="flex items-center gap-1 text-sm font-bold text-secondary">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>Añadir Registro</span>
              </button>
            </div>
            <div className="space-y-4">
              {[
                { icon: 'auto_stories', color: 'secondary', titulo: 'Cursos de Carrera Aprobados', sub: '32 créditos completados • Promedio: 9.5' },
                { icon: 'corporate_fare', color: 'tertiary', titulo: 'Pasantía: Intel Costa Rica', sub: 'Desarrollo Frontend React • Finalizado Set. 2023' },
              ].map((r) => (
                <div key={r.titulo} className="group flex items-center justify-between rounded-xl border border-outline-variant/30 p-4 transition-colors hover:bg-surface-container-low">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-2 ${r.color === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}`}>
                      <span className="material-symbols-outlined">{r.icon}</span>
                    </div>
                    <div>
                      <p className="font-body-semibold text-sm">{r.titulo}</p>
                      <p className="text-xs text-on-surface-variant">{r.sub}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                    <button className="p-2 text-outline-variant hover:text-secondary"><span className="material-symbols-outlined">edit</span></button>
                    <button className="p-2 text-outline-variant hover:text-error"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de Postulaciones */}
          <div className={CARD}>
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-headline-md text-xl text-primary">
                <span className="material-symbols-outlined">assignment</span>
                Historial de Postulaciones
              </h3>
              <button className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm font-bold text-on-secondary transition-opacity hover:opacity-90">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>Crear Postulación</span>
              </button>
            </div>
            <div className="space-y-4">
              {[
                { icon: 'business_center', titulo: 'Desarrollador Fullstack - Amazon CR', estado: 'En Revisión', estadoCls: 'bg-secondary/10 text-secondary', fecha: 'Enviada: 15 Oct 2023' },
                { icon: 'analytics', titulo: 'Analista de Datos - BAC Credomatic', estado: 'Finalizada', estadoCls: 'bg-surface-container-highest text-on-surface-variant', fecha: 'Enviada: 02 Set 2023' },
              ].map((p) => (
                <div key={p.titulo} className="group flex items-center justify-between rounded-xl border border-outline-variant/30 p-4 transition-colors hover:bg-surface-container-low">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <span className="material-symbols-outlined">{p.icon}</span>
                    </div>
                    <div>
                      <p className="font-body-semibold text-sm">{p.titulo}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${p.estadoCls}`}>{p.estado}</span>
                        <span className="text-[10px] text-on-surface-variant">{p.fecha}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                    <button className="p-2 text-outline-variant hover:text-secondary"><span className="material-symbols-outlined">edit</span></button>
                    <button className="p-2 text-outline-variant hover:text-error"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Columna derecha (apoyo y comunidad) ── */}
        <section className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          {/* Tipo de Beca */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Tipo de Beca</h3>
              <div className="flex gap-1">
                <button className="text-on-surface-variant transition-colors hover:text-secondary"><span className="material-symbols-outlined text-lg">edit</span></button>
                <button className="text-on-surface-variant transition-colors hover:text-primary"><span className="material-symbols-outlined text-lg">visibility</span></button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Asignada</span>
                <span className="text-xl font-bold text-primary">Tipo 5</span>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
            </div>
          </div>

          {/* Apoyo Requerido */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Apoyo Requerido</h3>
              <div className="flex gap-1">
                <button className="text-on-surface-variant transition-colors hover:text-secondary"><span className="material-symbols-outlined text-lg">edit</span></button>
                <button className="text-on-surface-variant transition-colors hover:text-primary"><span className="material-symbols-outlined text-lg">visibility</span></button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Mentoría Técnica', checked: true },
                { label: 'Ofertas de Empleo', checked: false },
                { label: 'Pasantía Académica', checked: true },
              ].map((a) => (
                <label key={a.label} className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2 transition-colors hover:border-secondary">
                  <input type="checkbox" defaultChecked={a.checked} className="rounded border-outline-variant accent-secondary" />
                  <span className="font-body-semibold text-sm">{a.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Intereses */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Intereses</h3>
              <div className="flex gap-1">
                <button className="text-on-surface-variant transition-colors hover:text-secondary"><span className="material-symbols-outlined text-lg">edit</span></button>
                <button className="text-on-surface-variant transition-colors hover:text-primary"><span className="material-symbols-outlined text-lg">visibility</span></button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['tecnología', 'ingeniería'].map((i) => (
                <span key={i} className="flex cursor-pointer items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 font-body-semibold text-xs text-primary hover:bg-primary/10">
                  {i} <span className="material-symbols-outlined text-xs">close</span>
                </span>
              ))}
              {['salud', 'ambiente'].map((i) => (
                <span key={i} className="cursor-pointer rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 font-body-semibold text-xs text-on-surface-variant">
                  {i}
                </span>
              ))}
              <button className="rounded-full border border-dashed border-outline-variant p-1.5 text-on-surface-variant transition-all hover:border-primary hover:text-primary">
                <span className="material-symbols-outlined text-xs">add</span>
              </button>
            </div>
          </div>

          {/* Portafolio */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Portafolio</h3>
              <button className="material-symbols-outlined text-secondary">add_circle</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent bg-surface-container p-2 transition-all hover:border-secondary">
                <span className="material-symbols-outlined text-3xl text-secondary">folder</span>
                <span className="text-center text-[10px] font-bold uppercase">Info Educativa</span>
              </div>
              <div className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent bg-surface-container p-2 transition-all hover:border-secondary">
                <span className="material-symbols-outlined text-3xl text-primary">collections</span>
                <span className="text-center text-[10px] font-bold uppercase">Galería TFG</span>
              </div>
            </div>
          </div>

          {/* Comunidad */}
          <div className="flex-grow rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4">
              <h3 className="font-headline-md text-lg text-primary">Comunidad</h3>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-on-primary shadow-sm transition-opacity hover:opacity-95">
                <span className="material-symbols-outlined">calendar_add_on</span>
                Crear Evento
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-2">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-secondary/10 px-1 text-[10px] font-bold uppercase text-secondary">NOTICIA</span>
                  <span className="text-[10px] text-on-surface-variant">Hace 2 días</span>
                </div>
                <p className="line-clamp-2 font-body-semibold text-xs">Nuevos avances en el Sistema de Gestión de Talento IA</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-on-surface-variant">
                  <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">favorite</span> 24</span>
                  <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">chat_bubble</span> 8</span>
                </div>
              </div>
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-2">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-tertiary/10 px-1 text-[10px] font-bold uppercase text-tertiary">EVENTO</span>
                  <span className="text-[10px] text-on-surface-variant">12 Oct</span>
                </div>
                <p className="line-clamp-1 font-body-semibold text-xs">Feria Tecnológica Sede Central</p>
              </div>
              <button className="w-full py-2 text-xs font-bold text-secondary transition-all hover:underline">Ver toda mi actividad</button>
            </div>
          </div>

          {/* Seguridad y Reportes */}
          <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-error/10 p-2 text-error">
                <span className="material-symbols-outlined">security</span>
              </div>
              <h3 className="font-headline-md text-lg text-primary">Seguridad y Reportes</h3>
            </div>
            <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-primary">Estado de Cuenta</span>
                <span className="rounded bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-500">SEGURO</span>
              </div>
              <p className="text-xs text-on-surface-variant">Tu cuenta está en buen estado. 0 reportes acumulados.</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] italic leading-tight text-on-surface-variant">
                Cualquier usuario puede reportar un perfil. 3 reportes generan una suspensión automática temporal. Los reportes son 100% anónimos.
              </p>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-error py-2 text-center font-bold text-sm text-error transition-colors hover:bg-error/5">
                <span className="material-symbols-outlined text-sm">flag</span> Reportar Perfil
              </button>
            </div>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
