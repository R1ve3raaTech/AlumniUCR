'use client';

// Dashboard del voluntario (rol nace al aprobar su solicitud de /voluntariado
// o /registro/otros). No tiene perfil editable propio; su panel es un centro
// de accesos rápidos a las áreas que el admin le habilitó al aprobarlo
// (acceso_proyectos / acceso_mentorias / acceso_estudiantes), más un resumen
// de lo que ofreció al postularse.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AlumniLogo from '../common/AlumniLogo';
import { obtenerMisAccesosVoluntario, actualizarMiPerfilVoluntario } from '@/lib/voluntariado/voluntarios';
import CargandoGirasol from '../common/CargandoGirasol';
import AvatarUploader from '../student/AvatarUploader';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface Solicitud {
  nombre?: string;
  tipo_ayuda?: string | null;
  area?: string | null;
  area_colaboracion?: string | null;
  modalidad?: string | null;
  disponibilidad?: string | null;
  mensaje?: string;
  biografia?: string | null;
  foto_perfil?: string | null;
  acceso_proyectos?: boolean;
  acceso_mentorias?: boolean;
  acceso_estudiantes?: boolean;
}

const NAV = [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { key: 'donar', icon: 'volunteer_activism', label: 'Hacer donación', href: '/donaciones' },
  { key: 'mis-donaciones', icon: 'history', label: 'Mis donaciones', href: '/mis-donaciones' },
  { key: 'ofrecer-pasantia', icon: 'work', label: 'Ofrecer pasantía', href: '/posiciones/nueva' },
  { key: 'mis-posiciones', icon: 'list_alt', label: 'Mis publicaciones', href: '/mis-posiciones' },
  { key: 'comunidad', icon: 'forum', label: 'Comunidad', href: '/blog' },
  { key: 'ayuda', icon: 'help', label: 'Ayuda', href: '/ayuda' },
];

const MODALIDADES = ['Presencial', 'Remoto', 'Híbrido'];
const DISPONIBILIDAD = ['Tiempo completo', 'Medio tiempo', 'Por horas', 'Puntual / por proyecto'];

const TIPO_AYUDA_LABEL: Record<string, string> = {
  donacion: 'Donación', pasantia: 'Pasantía', mentoria: 'Mentoría', taller: 'Taller',
};

const card = 'rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-16px_rgba(0,40,55,0.25)] hover:border-secondary/35';

export default function VoluntarioDashboard({
  correo,
  onSignOut,
  token,
}: { correo: string; onSignOut: () => void; token?: string }) {
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editorFoto, setEditorFoto] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);
  const [form, setForm] = useState({ modalidad: '', disponibilidad: '', biografia: '' });
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.bento-card',
      { y: 30, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.06, ease: 'power4.out', delay: 0.1 },
    );
  }, { scope: containerRef });

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const data = await obtenerMisAccesosVoluntario(token);
        if (activo) {
          setSolicitud(data);
          setForm({
            modalidad: data?.modalidad || '',
            disponibilidad: data?.disponibilidad || '',
            biografia: data?.biografia || '',
          });
        }
      } catch {
        if (activo) setSolicitud(null);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  const nombre = solicitud?.nombre || correo.split('@')[0] || 'Voluntario';
  const primerNombre = nombre.split(' ')[0];
  const iniciales = nombre.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const accesos = [
    solicitud?.acceso_proyectos && { icon: 'work', titulo: 'Proyectos', texto: 'Explorá proyectos de graduación y ofrecé tu apoyo.', href: '/proyectos' },
    solicitud?.acceso_mentorias && { icon: 'handshake', titulo: 'Mentorías', texto: 'Conocé la red de mentoría de la comunidad UCR.', href: '/mentorias' },
    solicitud?.acceso_estudiantes && { icon: 'group', titulo: 'Estudiantes', texto: 'Consultá el directorio de estudiantes que buscan apoyo.', href: '/estudiantes' },
  ].filter(Boolean) as { icon: string; titulo: string; texto: string; href: string }[];

  const tipoAyuda = solicitud?.tipo_ayuda ? TIPO_AYUDA_LABEL[solicitud.tipo_ayuda] || solicitud.tipo_ayuda : solicitud?.area_colaboracion;

  async function guardarPerfil(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setGuardando(true);
    setErrorEdicion(null);
    try {
      const actualizado = await actualizarMiPerfilVoluntario(token, form);
      setSolicitud((s) => (s ? { ...s, ...actualizado } : actualizado));
      setEditando(false);
    } catch (err) {
      setErrorEdicion(err instanceof Error ? err.message : 'No se pudo guardar tu perfil.');
    } finally {
      setGuardando(false);
    }
  }

  async function guardarFoto(dataUrl: string) {
    if (!token) return;
    setSolicitud((s) => (s ? { ...s, foto_perfil: dataUrl } : s));
    setSubiendoFoto(true);
    try {
      const actualizado = await actualizarMiPerfilVoluntario(token, { foto_perfil: dataUrl });
      setSolicitud((s) => (s ? { ...s, ...actualizado } : actualizado));
    } catch {
      /* si falla, la foto queda en pantalla pero no se persistió; el usuario puede reintentar */
    } finally {
      setSubiendoFoto(false);
    }
  }

  if (cargando) {
    return <CargandoGirasol texto="Cargando tu panel…" />;
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
            {solicitud?.foto_perfil ? (
              <img src={solicitud.foto_perfil} alt={nombre} className="h-24 w-24 rounded-full border-2 border-primary object-cover shadow-sm" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-primary bg-primary/10 font-display-lg text-2xl font-bold text-primary">
                {iniciales || 'V'}
              </div>
            )}
            <button
              type="button"
              onClick={() => setEditorFoto(true)}
              title="Cambiar foto"
              aria-label="Cambiar foto de perfil"
              className="absolute bottom-0 right-0 rounded-full border-2 border-surface-container-low bg-secondary p-1.5 text-on-secondary transition-transform hover:scale-110"
            >
              <span className="material-symbols-outlined text-sm">{subiendoFoto ? 'progress_activity' : 'photo_camera'}</span>
            </button>
          </div>
          <h2 className="font-body-semibold text-primary">{nombre}</h2>
          <p className="text-xs font-bold uppercase tracking-tight text-on-surface-variant">Voluntario · Alumni UCR</p>
        </div>
        <nav className="flex flex-grow flex-col gap-1">
          {NAV.map((item) => (
            <Link key={item.key} href={item.href}
              className={item.key === 'dashboard'
                ? 'flex items-center gap-4 rounded-lg bg-primary-container p-3.5 font-bold text-on-primary-container'
                : 'flex items-center gap-4 rounded-lg p-3.5 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface'}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-4">
          <Link href="/configuracion-voluntario"
            className="flex items-center gap-4 rounded-lg p-3.5 text-on-surface-variant transition-all hover:bg-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-semibold">Configuración</span>
          </Link>
          <button type="button" onClick={onSignOut}
            className="flex items-center gap-4 rounded-lg p-3.5 text-left text-on-surface-variant transition-all hover:text-error">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-semibold">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Botón de menú móvil, flotante */}
      <button type="button" onClick={() => setMenuAbierto(true)}
        className="fixed left-4 top-4 z-30 rounded-full border border-outline-variant bg-surface-container-lowest p-2.5 text-on-surface-variant shadow-[0_4px_16px_-6px_rgba(0,40,55,0.25)] transition-colors hover:bg-surface-variant lg:hidden" aria-label="Abrir menú">
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Volver al inicio (landing) + perfil flotante estilo píldora. El
          voluntario no tiene una página de perfil aparte: la píldora abre el editor. */}
      <div className="fixed right-4 top-4 z-30 flex items-center gap-2 sm:right-8">
        <Link
          href="/"
          aria-label="Volver al inicio"
          title="Volver al inicio"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest shadow-[0_4px_16px_-6px_rgba(0,40,55,0.25)] outline-none transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(0,40,55,0.3)] focus-visible:ring-2 focus-visible:ring-secondary/40"
        >
          <span className="material-symbols-outlined text-on-surface-variant">home</span>
        </Link>
        <button
          type="button"
          onClick={() => setEditando(true)}
          aria-label="Ver y editar mi perfil"
          title="Mi Perfil"
          className="flex items-center gap-3 rounded-full border border-outline-variant bg-surface-container-lowest py-1.5 pl-4 pr-1.5 shadow-[0_4px_16px_-6px_rgba(0,40,55,0.25)] outline-none transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(0,40,55,0.3)] focus-visible:ring-2 focus-visible:ring-secondary/40"
        >
          <p className="text-sm font-bold text-on-surface">{nombre}</p>
          {solicitud?.foto_perfil ? (
            <img src={solicitud.foto_perfil} alt={nombre} className="h-10 w-10 rounded-full border-2 border-primary-container object-cover" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary">{iniciales}</div>
          )}
        </button>
      </div>

      {/* Main */}
      <main className="ml-0 min-h-screen px-4 pb-12 pt-24 sm:px-8 lg:ml-64">
        <div className="mx-auto max-w-[1440px] space-y-6">
          {/* Banner */}
          <section className="bento-card relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-[#005470] p-8 text-on-primary shadow-lg">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 max-w-3xl space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-secondary-container border border-white/10">
                <span className="material-symbols-outlined text-[14px]">volunteer_activism</span> Voluntario Alumni UCR
              </span>
              <h1 className="font-headline-md text-3xl font-extrabold tracking-tight sm:text-4xl">¡Gracias por sumarte, {primerNombre}!</h1>
              <p className="text-sm opacity-90 sm:text-base leading-relaxed">
                Tu apoyo hace la diferencia para los estudiantes becados de la UCR. Desde acá
                podés acceder a las áreas que la administración habilitó para vos.
              </p>
            </div>
          </section>

          {/* Acciones rápidas: siempre disponibles, sin depender de accesos del admin */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href="/donaciones" className="bento-card flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-0.5 hover:border-secondary">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined">volunteer_activism</span>
              </span>
              <div>
                <h3 className="font-body-semibold text-primary">Hacer una donación</h3>
                <p className="text-xs text-on-surface-variant">Apoyá un proyecto de graduación con tu aporte.</p>
              </div>
            </Link>
            <Link href="/posiciones/nueva" className="bento-card flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)] transition-all hover:-translate-y-0.5 hover:border-secondary">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined">work</span>
              </span>
              <div>
                <h3 className="font-body-semibold text-primary">Ofrecer una pasantía</h3>
                <p className="text-xs text-on-surface-variant">Publicá una posición de empleo o pasantía para estudiantes.</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Accesos habilitados */}
            <div className="col-span-12 lg:col-span-8">
              <section className={`${card} bento-card p-6 sm:p-8`}>
                <h2 className="mb-5 border-b border-outline-variant pb-2 flex items-center gap-2 font-headline-md text-lg font-bold text-primary">
                  <span className="material-symbols-outlined">grid_view</span> Tus áreas de colaboración
                </h2>

                {accesos.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">hourglass_top</span>
                    <p className="font-body-semibold text-on-surface">Tu cuenta está activa, pero aún sin áreas asignadas.</p>
                    <p className="max-w-sm text-sm text-on-surface-variant">
                      La administración te habilitará el acceso a proyectos, mentorías o
                      estudiantes según lo que ofreciste al postularte.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {accesos.map((a) => (
                      <Link key={a.href} href={a.href}
                        className="flex flex-col gap-3 rounded-2xl border border-outline-variant p-5 transition-all hover:-translate-y-0.5 hover:border-secondary hover:bg-secondary/5">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary/10 text-secondary">
                          <span className="material-symbols-outlined">{a.icon}</span>
                        </span>
                        <h3 className="font-body-semibold text-primary">{a.titulo}</h3>
                        <p className="text-xs text-on-surface-variant">{a.texto}</p>
                        <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-secondary">
                          Ir ahora <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Resumen de tu postulación */}
            <div className="col-span-12 lg:col-span-4">
              <section className={`${card} bento-card p-6`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tu perfil</h3>
                  <button
                    type="button"
                    onClick={() => setEditando(true)}
                    className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-surface-variant"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> Editar
                  </button>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  {tipoAyuda && (
                    <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                      <span className="text-on-surface-variant">Tipo de ayuda</span>
                      <span className="font-body-semibold text-primary">{tipoAyuda}</span>
                    </div>
                  )}
                  {solicitud?.area && (
                    <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                      <span className="text-on-surface-variant">Área</span>
                      <span className="font-body-semibold text-primary">{solicitud.area}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                    <span className="text-on-surface-variant">Modalidad</span>
                    <span className="font-body-semibold text-primary">{solicitud?.modalidad || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                    <span className="text-on-surface-variant">Disponibilidad</span>
                    <span className="font-body-semibold text-primary">{solicitud?.disponibilidad || '—'}</span>
                  </div>
                  <div className="rounded-xl bg-surface-container-low p-3">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Biografía</p>
                    <p className="text-xs text-on-surface-variant">
                      {solicitud?.biografia || 'Todavía no agregaste una biografía. Contanos quién sos.'}
                    </p>
                  </div>
                  {solicitud?.mensaje && (
                    <div className="rounded-xl bg-surface-container-low p-3">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Mensaje de tu solicitud</p>
                      <p className="text-xs italic text-on-surface-variant">“{solicitud.mensaje}”</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="ml-0 flex flex-wrap items-center justify-center gap-3 border-t border-outline-variant bg-surface-container-lowest py-5 text-center text-xs text-on-surface-variant lg:ml-64">
        <AlumniLogo height={26} /> © 2026 Alumni UCR · Universidad de Costa Rica
      </footer>

      {/* Modal: editar modalidad, disponibilidad y biografía */}
      {editando && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Editar mi perfil</h3>
              <button type="button" onClick={() => setEditando(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={guardarPerfil} className="flex flex-col gap-4">
              {errorEdicion && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{errorEdicion}</div>
              )}

              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Modalidad</span>
                <select
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 font-body-semibold text-on-surface focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  value={form.modalidad}
                  onChange={(e) => setForm((f) => ({ ...f, modalidad: e.target.value }))}
                >
                  <option value="">Sin definir</option>
                  {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Disponibilidad</span>
                <select
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 font-body-semibold text-on-surface focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  value={form.disponibilidad}
                  onChange={(e) => setForm((f) => ({ ...f, disponibilidad: e.target.value }))}
                >
                  <option value="">Sin definir</option>
                  {DISPONIBILIDAD.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Biografía</span>
                <textarea
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 font-body-semibold text-on-surface focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  value={form.biografia}
                  onChange={(e) => setForm((f) => ({ ...f, biografia: e.target.value }))}
                  placeholder="Contanos sobre tu experiencia y por qué querés ayudar…"
                />
                <span className="text-right text-xs text-on-surface-variant">{form.biografia.length}/500</span>
              </label>

              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditando(false)} className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary disabled:opacity-60">
                  <span className="material-symbols-outlined text-base">check</span> {guardando ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AvatarUploader
        abierto={editorFoto}
        fotoActual={solicitud?.foto_perfil ?? undefined}
        onGuardar={guardarFoto}
        onCerrar={() => setEditorFoto(false)}
      />
    </div>
  );
}
