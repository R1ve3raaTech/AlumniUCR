'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ReportarPerfil from '@/components/ReportarPerfil';
import StudentNav from '@/components/StudentNav';
import { obtenerDirectorioEstudiantes, solicitarContacto } from '@/lib/directorioEstudiantes';
import { apiFetch } from '@/lib/api';
import { CARRERAS_UCR } from '@/lib/catalogoUCR';

const SEDES_UCR = [
  'Sede Rodrigo Facio (Central)',
  'Sede de Occidente',
  'Sede del Atlántico',
  'Sede del Caribe',
  'Sede de Guanacaste',
  'Sede del Pacífico',
  'Sede Interuniversitaria de Alajuela',
  'Recinto de Grecia',
  'Recinto de Golfito',
  'Recinto de Paraíso',
  'Recinto de Liberia',
  'Recinto de San Ramón',
  'Recinto de Tacares',
  'Recinto de Turrialba',
];

interface Estudiante {
  id: string;
  nombre: string;
  carreras: string[];
  facultades: string[];
  sede?: string;
  nivel_academico?: string;
  proyecto: { titulo: string; avance: number; tipo?: string; area_tematica?: string };
  areas: string[];
  habilidades: string;
  busca: { financiamiento: boolean; mentoria: boolean; empleo: boolean; pasantia: boolean };
  solicitud: null | 'pendiente' | 'aceptada' | 'rechazada';
  beca: string | null;
  correo: string | null;
}

const BUSCA_LABEL: { clave: keyof Estudiante['busca']; label: string }[] = [
  { clave: 'financiamiento', label: 'Financiamiento' },
  { clave: 'mentoria', label: 'Mentoría' },
  { clave: 'empleo', label: 'Empleo' },
  { clave: 'pasantia', label: 'Pasantía' },
];

const TIPOS_PROYECTO: { clave: string; label: string }[] = [
  { clave: 'tfg', label: 'TFG' },
  { clave: 'tesis', label: 'Tesis' },
  { clave: 'practica_dirigida', label: 'Práctica Dirigida' },
  { clave: 'seminario', label: 'Seminario' },
];

const AREAS_INTERES = [
  'Tecnología e Innovación',
  'Salud y Bienestar',
  'Educación y Pedagogía',
  'Medio Ambiente y Sostenibilidad',
  'Arte y Cultura',
  'Ciencias Sociales',
  'Agro y Alimentación',
  'Emprendimiento y Negocios',
  'Ingeniería y Construcción',
  'Derecho y Política Pública',
  'Economía y Finanzas',
  'Comunicación y Medios',
  'Turismo y Patrimonio',
  'Investigación Científica',
];

function getTipoBadge(e: Estudiante) {
  if (e.proyecto?.tipo) {
    const found = TIPOS_PROYECTO.find((t) => t.clave === e.proyecto.tipo);
    return found?.label ?? e.proyecto.tipo;
  }
  return 'TFG';
}

function iniciales(nombre: string) {
  return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// Modal genérico de selección
function PickerModal({
  titulo,
  opciones,
  seleccionado,
  onSeleccionar,
  onCerrar,
  placeholder,
}: {
  titulo: string;
  opciones: string[];
  seleccionado: string;
  onSeleccionar: (v: string) => void;
  onCerrar: () => void;
  placeholder: string;
}) {
  const [busq, setBusq] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCerrar]);

  const filtradas = useMemo(() => {
    const q = busq.trim().toLowerCase();
    return q ? opciones.filter((o) => o.toLowerCase().includes(q)) : opciones;
  }, [opciones, busq]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="flex w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl">
        {/* Cabecera modal */}
        <div className="flex items-center justify-between border-b border-ucr-outline-variant px-6 py-4">
          <h2 className="font-brand-heading text-lg font-bold text-ucr-on-surface">{titulo}</h2>
          <button type="button" onClick={onCerrar} className="rounded-full p-1 hover:bg-ucr-surface-container">
            <span className="material-symbols-outlined text-ucr-outline">close</span>
          </button>
        </div>

        {/* Búsqueda dentro del modal */}
        <div className="px-6 pt-4">
          <input
            ref={inputRef}
            type="text"
            placeholder={`Buscar ${titulo.toLowerCase()}…`}
            value={busq}
            onChange={(e) => setBusq(e.target.value)}
            className="w-full rounded-xl border border-ucr-outline-variant bg-ucr-surface-container px-4 py-2.5 text-sm text-ucr-on-surface placeholder:text-ucr-outline focus:border-ucr-celeste focus:outline-none"
          />
        </div>

        {/* Lista de opciones */}
        <ul className="mt-3 max-h-72 overflow-y-auto px-3 pb-4">
          {/* Opción "Todos" */}
          <li>
            <button
              type="button"
              onClick={() => { onSeleccionar(''); onCerrar(); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-ucr-surface-container ${seleccionado === '' ? 'font-semibold text-ucr-primary bg-ucr-secondary-container/20' : 'text-ucr-on-surface-variant'}`}
            >
              {seleccionado === '' && <span className="material-symbols-outlined text-base text-ucr-primary">check</span>}
              {placeholder}
            </button>
          </li>
          {filtradas.length === 0 && (
            <li className="py-4 text-center text-sm text-ucr-outline">Sin resultados</li>
          )}
          {filtradas.map((op) => (
            <li key={op}>
              <button
                type="button"
                onClick={() => { onSeleccionar(op); onCerrar(); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-ucr-surface-container ${seleccionado === op ? 'font-semibold text-ucr-primary bg-ucr-secondary-container/20' : 'text-ucr-on-surface'}`}
              >
                {seleccionado === op && <span className="material-symbols-outlined text-base text-ucr-primary">check</span>}
                {op}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Botón de filtro con chip activo
function FiltroBtn({ label, valor, placeholder, onClick }: { label: string; valor: string; placeholder: string; onClick: () => void }) {
  const activo = Boolean(valor);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-ucr-outline">{label}</span>
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
          activo
            ? 'border-ucr-secondary bg-ucr-secondary/10 font-semibold text-ucr-secondary'
            : 'border-ucr-outline-variant bg-ucr-surface-container text-ucr-on-surface hover:border-ucr-secondary/50'
        }`}
      >
        <span className="max-w-[140px] truncate">{valor || placeholder}</span>
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>
    </div>
  );
}

function EstudiantesPageContent() {
  const router = useRouter();
  const { token, loading: authLoading, signOut } = useAuth();
  const [lista, setLista] = useState<Estudiante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [catCarreras, setCatCarreras] = useState<string[]>([]);
  const [catSedes, setCatSedes] = useState<string[]>([]);

  // Filtros pendientes (antes de aplicar)
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroSede, setFiltroSede] = useState('');
  const [filtroApoyo, setFiltroApoyo] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroAreaInteres, setFiltroAreaInteres] = useState('');
  // Filtros aplicados (los que filtran el grid)
  const [filtrosAplicados, setFiltrosAplicados] = useState({ carrera: '', area: '', sede: '', apoyo: '', tipo: '', areaInteres: '' });
  // Modal abierto
  const [modalAbierto, setModalAbierto] = useState<'carrera' | 'area' | 'sede' | 'apoyo' | 'tipo' | 'areaInteres' | null>(null);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try {
        const [resEstudiantes, resCarreras, resSedes] = await Promise.all([
          obtenerDirectorioEstudiantes(token).catch(() => null),
          apiFetch('/carreras', { token }).catch(() => null),
          apiFetch('/sedes-ucr', { token }).catch(() => null),
        ]);
        if (!activo) return;
        setLista(resEstudiantes?.data ?? []);
        const carrerasApi = (resCarreras?.data ?? []).map((c: { nombre: string }) => c.nombre).filter(Boolean);
        setCatCarreras(carrerasApi.length > 0 ? carrerasApi.sort() : CARRERAS_UCR);
        const sedesApi = (resSedes?.data ?? []).map((s: { nombre: string }) => s.nombre).filter(Boolean);
        setCatSedes(sedesApi.length > 0 ? sedesApi.sort() : SEDES_UCR);
      } catch {
        if (activo) setLista([]);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  const opcionesArea = useMemo(() => Array.from(new Set(lista.flatMap((e) => e.areas))).sort(), [lista]);
  const opcionesApoyo = BUSCA_LABEL.map((b) => b.label);
  const opcionesTipo = TIPOS_PROYECTO.map((t) => t.label);

  const filtrada = useMemo(() => {
    return lista.filter((e) => {
      if (filtrosAplicados.carrera && !e.carreras.includes(filtrosAplicados.carrera)) return false;
      if (filtrosAplicados.area && !e.areas.includes(filtrosAplicados.area)) return false;
      if (filtrosAplicados.sede && e.sede !== filtrosAplicados.sede) return false;
      if (filtrosAplicados.apoyo) {
        const encontrado = BUSCA_LABEL.find((b) => b.label === filtrosAplicados.apoyo);
        if (encontrado && !e.busca[encontrado.clave]) return false;
      }
      if (filtrosAplicados.tipo) {
        const tipoReal = getTipoBadge(e);
        if (tipoReal !== filtrosAplicados.tipo) return false;
      }
      if (filtrosAplicados.areaInteres && !e.areas.includes(filtrosAplicados.areaInteres)) return false;
      return true;
    });
  }, [lista, filtrosAplicados]);

  function aplicarFiltros() {
    setFiltrosAplicados({ carrera: filtroCarrera, area: filtroArea, sede: filtroSede, apoyo: filtroApoyo, tipo: filtroTipo, areaInteres: filtroAreaInteres });
  }

  function limpiarFiltros() {
    setFiltroCarrera(''); setFiltroArea(''); setFiltroSede(''); setFiltroApoyo(''); setFiltroTipo(''); setFiltroAreaInteres('');
    setFiltrosAplicados({ carrera: '', area: '', sede: '', apoyo: '', tipo: '', areaInteres: '' });
  }

  async function pedirContacto(id: string) {
    setEnviando(id);
    try {
      await solicitarContacto(token as string, id, '');
      setLista((l) => l.map((e) => (e.id === id ? { ...e, solicitud: 'pendiente' } : e)));
    } catch { /* simple */ } finally {
      setEnviando(null);
    }
  }

  function handleSignOut() { signOut(); router.replace('/login'); }

  if (authLoading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ucr-surface font-brand-body text-ucr-on-surface">
        Cargando…
      </div>
    );
  }

  const hayFiltros = Object.values(filtrosAplicados).some(Boolean);

  return (
    <div className="min-h-screen bg-ucr-surface font-brand-body text-ucr-on-surface">
      <StudentNav onSignOut={handleSignOut} />

      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-ucr-primary to-ucr-secondary p-8 text-white shadow-sm">
          <h1 className="font-ucr-display text-3xl font-bold tracking-tight sm:text-4xl">Directorio de Estudiantes</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Descubre proyectos activos y conecta con estudiantes que necesitan tu apoyo para culminar su camino académico con éxito.
          </p>
        </section>

        {/* Filtros con modales */}
        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <FiltroBtn label="Carrera" valor={filtroCarrera} placeholder="Todas las carreras" onClick={() => setModalAbierto('carrera')} />
            <FiltroBtn label="Área temática" valor={filtroArea} placeholder="Todos los temas" onClick={() => setModalAbierto('area')} />
            <FiltroBtn label="Áreas de interés" valor={filtroAreaInteres} placeholder="Cualquier área" onClick={() => setModalAbierto('areaInteres')} />
            <FiltroBtn label="Tipo de proyecto" valor={filtroTipo} placeholder="Todos los tipos" onClick={() => setModalAbierto('tipo')} />
            <FiltroBtn label="Sede" valor={filtroSede} placeholder="Cualquier sede" onClick={() => setModalAbierto('sede')} />
            <FiltroBtn label="Tipo de apoyo" valor={filtroApoyo} placeholder="Cualquiera" onClick={() => setModalAbierto('apoyo')} />

            <div className="flex gap-2 self-end">
              <button type="button" onClick={aplicarFiltros} className="rounded-xl bg-ucr-secondary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                Aplicar filtros
              </button>
              {hayFiltros && (
                <button type="button" onClick={limpiarFiltros} className="rounded-xl border border-ucr-outline-variant px-4 py-2 text-sm font-medium text-ucr-on-surface-variant transition hover:bg-ucr-surface-container">
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className="mt-6">
          {cargando ? (
            <p className="py-16 text-center text-sm text-ucr-on-surface-variant">Cargando directorio…</p>
          ) : filtrada.length === 0 ? (
            <p className="py-16 text-center text-sm text-ucr-on-surface-variant">
              {hayFiltros ? 'No hay estudiantes que coincidan con los filtros.' : 'Aún no hay estudiantes con perfil completo en el directorio.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {filtrada.map((e) => {
                const badge = getTipoBadge(e);
                return (
                  <article key={e.id} className="flex flex-col rounded-3xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ucr-secondary-container/40 font-ucr-display text-lg font-bold text-ucr-primary">
                        {iniciales(e.nombre)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-brand-heading text-base font-bold text-ucr-on-surface">{e.nombre}</h3>
                          {e.nivel_academico && (
                            <span className="shrink-0 rounded-full bg-ucr-secondary/10 px-2 py-0.5 text-xs font-semibold text-ucr-secondary">{e.nivel_academico}</span>
                          )}
                        </div>
                        <p className="truncate text-xs text-ucr-on-surface-variant">
                          {e.carreras[0] || '—'}{e.facultades[0] ? ` · ${e.facultades[0]}` : ''}{e.sede ? ` · ${e.sede}` : ''}
                        </p>
                      </div>
                    </div>

                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ucr-outline">Proyecto</p>
                    <p className="mb-1 line-clamp-2 text-sm font-medium leading-snug text-ucr-on-surface">{e.proyecto.titulo}</p>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-ucr-secondary/10 px-2 py-0.5 text-xs font-semibold text-ucr-secondary">{badge}</span>
                      {e.proyecto.area_tematica && (
                        <span className="rounded-full bg-ucr-celeste/10 px-2 py-0.5 text-xs font-semibold text-ucr-secondary">{e.proyecto.area_tematica}</span>
                      )}
                    </div>

                    <div className="mb-1 flex items-center justify-between text-xs text-ucr-on-surface-variant">
                      <span>Avance del proyecto</span>
                      <span className="font-semibold text-ucr-esmeralda">{e.proyecto.avance}%</span>
                    </div>
                    <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-ucr-surface-container">
                      <span className="block h-full rounded-full bg-gradient-to-r from-ucr-secondary to-ucr-esmeralda" style={{ width: `${e.proyecto.avance}%` }} />
                    </div>

                    {e.areas.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {e.areas.slice(0, 3).map((a) => (
                          <span key={a} className="rounded-full bg-ucr-surface-container px-2.5 py-0.5 text-xs text-ucr-on-surface-variant">#{a}</span>
                        ))}
                      </div>
                    )}

                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {BUSCA_LABEL.filter((b) => e.busca[b.clave]).map((b) => (
                        <span key={b.clave} className="rounded-full border border-ucr-celeste/40 bg-ucr-celeste/10 px-2.5 py-0.5 text-xs font-medium text-ucr-secondary">{b.label}</span>
                      ))}
                    </div>

                    <div className="mt-auto">
                      {e.solicitud === 'aceptada' ? (
                        <div className="rounded-2xl bg-ucr-esmeralda/10 p-3 text-sm">
                          <p className="font-semibold text-ucr-esmeralda">Contacto revelado</p>
                          <p><strong>Beca:</strong> {e.beca}</p>
                          <p><a href={`mailto:${e.correo}`} className="text-ucr-secondary underline">{e.correo}</a></p>
                        </div>
                      ) : e.solicitud === 'pendiente' ? (
                        <span className="flex items-center gap-2 text-sm text-ucr-outline">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          Solicitud enviada · pendiente de respuesta
                        </span>
                      ) : e.solicitud === 'rechazada' ? (
                        <span className="text-sm text-ucr-outline">Solicitud no aceptada</span>
                      ) : (
                        <button type="button" onClick={() => pedirContacto(e.id)} disabled={enviando === e.id}
                          className="w-full rounded-2xl border border-ucr-outline-variant py-2 text-sm font-semibold text-ucr-on-surface transition hover:border-ucr-secondary hover:text-ucr-secondary disabled:opacity-60">
                          {enviando === e.id ? 'Enviando…' : 'Ofrecer apoyo'}
                        </button>
                      )}
                    </div>

                    <div className="mt-3 flex justify-end border-t border-ucr-outline-variant pt-2">
                      <ReportarPerfil idReportado={e.id} nombre={e.nombre} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modales de selección */}
      {modalAbierto === 'carrera' && (
        <PickerModal titulo="Carrera" opciones={catCarreras} seleccionado={filtroCarrera}
          onSeleccionar={setFiltroCarrera} onCerrar={() => setModalAbierto(null)} placeholder="Todas las carreras" />
      )}
      {modalAbierto === 'area' && (
        <PickerModal titulo="Área temática" opciones={opcionesArea.length > 0 ? opcionesArea : AREAS_INTERES} seleccionado={filtroArea}
          onSeleccionar={setFiltroArea} onCerrar={() => setModalAbierto(null)} placeholder="Todos los temas" />
      )}
      {modalAbierto === 'sede' && (
        <PickerModal titulo="Sede" opciones={catSedes} seleccionado={filtroSede}
          onSeleccionar={setFiltroSede} onCerrar={() => setModalAbierto(null)} placeholder="Cualquier sede" />
      )}
      {modalAbierto === 'apoyo' && (
        <PickerModal titulo="Tipo de apoyo" opciones={opcionesApoyo} seleccionado={filtroApoyo}
          onSeleccionar={setFiltroApoyo} onCerrar={() => setModalAbierto(null)} placeholder="Cualquiera" />
      )}
      {modalAbierto === 'tipo' && (
        <PickerModal titulo="Tipo de proyecto" opciones={opcionesTipo} seleccionado={filtroTipo}
          onSeleccionar={setFiltroTipo} onCerrar={() => setModalAbierto(null)} placeholder="Todos los tipos" />
      )}
      {modalAbierto === 'areaInteres' && (
        <PickerModal titulo="Áreas de interés" opciones={AREAS_INTERES} seleccionado={filtroAreaInteres}
          onSeleccionar={setFiltroAreaInteres} onCerrar={() => setModalAbierto(null)} placeholder="Cualquier área" />
      )}
    </div>
  );
}

export default function EstudiantesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-ucr-surface font-brand-body text-ucr-on-surface">
        Cargando…
      </div>
    }>
      <EstudiantesPageContent />
    </Suspense>
  );
}
