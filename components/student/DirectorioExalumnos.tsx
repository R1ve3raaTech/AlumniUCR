'use client';

// Directorio de Exalumnos para el estudiante (RF-04): tarjetas filtrables con
// el mismo diseño que el Directorio de Estudiantes (hero + barra de filtros +
// grid). Muestra los campos públicos del exalumno (foto, nombre, carrera,
// sectores, áreas, tipos de apoyo) y permite conectar (motor RF-06).
// Ordenado por score de afinidad con el perfil del estudiante.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import StudentShell from '@/components/student/StudentShell';
import ReportarPerfil from '@/components/ReportarPerfil';
import ProgressBar from '@/components/ui/ProgressBar';
import { notificar } from '@/components/student/Toast';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
import { obtenerDirectorio } from '@/lib/perfilExalumno';
import { puntuar, obtenerMisMatches, conectarConExalumno } from '@/lib/matchesEstudiante';

interface Exalumno {
  id: string;
  nombre: string;
  foto_perfil: string | null;
  pais: string;
  ciudad: string;
  anio_graduacion: number | null;
  carreras: string[];
  facultades: string[];
  sectores: string[];
  areas: string[];
  apoyo: { mentoria: boolean; empleo: boolean; pasantia: boolean; colaboracion: boolean; donacion: boolean };
  score: number;
  comunes: string[];
}

const APOYO_LABEL: { clave: keyof Exalumno['apoyo']; label: string }[] = [
  { clave: 'mentoria', label: 'Mentoría' },
  { clave: 'empleo', label: 'Empleo' },
  { clave: 'pasantia', label: 'Pasantía' },
  { clave: 'colaboracion', label: 'Proyecto' },
  { clave: 'donacion', label: 'Donación' },
];

function iniciales(nombre: string) {
  return (nombre || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// Modal genérico de selección (mismo patrón que el Directorio de Estudiantes).
function PickerModal({
  titulo, opciones, seleccionado, onSeleccionar, onCerrar, placeholder,
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
        <div className="flex items-center justify-between border-b border-ucr-outline-variant px-6 py-4">
          <h2 className="font-brand-heading text-lg font-bold text-ucr-on-surface">{titulo}</h2>
          <button type="button" onClick={onCerrar} className="rounded-full p-1 hover:bg-ucr-surface-container">
            <span className="material-symbols-outlined text-ucr-outline">close</span>
          </button>
        </div>

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

        <ul className="mt-3 max-h-72 overflow-y-auto px-3 pb-4">
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

// Botón de filtro con chip activo (mismo patrón que el Directorio de Estudiantes).
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

export default function DirectorioExalumnos() {
  const { token } = useAuth();
  const { perfil } = usePerfilEstudiante();

  const [lista, setLista] = useState<Exalumno[]>([]);
  const [misMatches, setMisMatches] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState<null | 'carrera' | 'sector' | 'area' | 'apoyo'>(null);

  // Filtros RF-04: carrera, sector, áreas de interés, tipo de apoyo, país/ciudad + nombre.
  const [busqNombre, setBusqNombre] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroSector, setFiltroSector] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroApoyo, setFiltroApoyo] = useState('');
  const [filtroLugar, setFiltroLugar] = useState('');
  const [aplicados, setAplicados] = useState({ nombre: '', carrera: '', sector: '', area: '', apoyo: '', lugar: '' });

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [res, mm] = await Promise.all([
          obtenerDirectorio(),
          token ? obtenerMisMatches(token) : Promise.resolve([]),
        ]);
        if (!activo) return;
        const exalumnos = (res?.data ?? [])
          .map((e: any) => ({ ...e, ...puntuar(perfil, e) }))
          .sort((a: Exalumno, b: Exalumno) => b.score - a.score); // RF-04: orden por score de match
        setLista(exalumnos);
        setMisMatches(mm);
      } catch {
        if (activo) setLista([]);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token, perfil]);

  // Estado del match por exalumno (para el bloque de estado de la tarjeta).
  const matchPorExalumno = useMemo(() => {
    const mapa = new Map<string, { estado: string; correo: string | null }>();
    for (const m of misMatches) {
      if (m.usuarios?.id) mapa.set(m.usuarios.id, { estado: m.estado, correo: m.usuarios.correo_electronico ?? null });
    }
    return mapa;
  }, [misMatches]);

  const opcionesCarrera = useMemo(() => Array.from(new Set(lista.flatMap((e) => e.carreras))).sort(), [lista]);
  const opcionesSector = useMemo(() => Array.from(new Set(lista.flatMap((e) => e.sectores))).sort(), [lista]);
  const opcionesArea = useMemo(() => Array.from(new Set(lista.flatMap((e) => e.areas))).sort(), [lista]);
  const opcionesApoyo = APOYO_LABEL.map((a) => a.label);

  // RF-04: los filtros se combinan con AND lógico; nombre con coincidencia parcial.
  const filtrada = useMemo(() => {
    const q = aplicados.nombre.trim().toLowerCase();
    const lugar = aplicados.lugar.trim().toLowerCase();
    return lista.filter((e) => {
      if (q && !e.nombre.toLowerCase().includes(q)) return false;
      if (aplicados.carrera && !e.carreras.includes(aplicados.carrera)) return false;
      if (aplicados.sector && !e.sectores.includes(aplicados.sector)) return false;
      if (aplicados.area && !e.areas.includes(aplicados.area)) return false;
      if (aplicados.apoyo) {
        const encontrado = APOYO_LABEL.find((a) => a.label === aplicados.apoyo);
        if (encontrado && !e.apoyo[encontrado.clave]) return false;
      }
      if (lugar && !`${e.pais} ${e.ciudad}`.toLowerCase().includes(lugar)) return false;
      return true;
    });
  }, [lista, aplicados]);

  function aplicarFiltros() {
    setAplicados({ nombre: busqNombre, carrera: filtroCarrera, sector: filtroSector, area: filtroArea, apoyo: filtroApoyo, lugar: filtroLugar });
  }

  function limpiarFiltros() {
    setBusqNombre(''); setFiltroCarrera(''); setFiltroSector(''); setFiltroArea(''); setFiltroApoyo(''); setFiltroLugar('');
    setAplicados({ nombre: '', carrera: '', sector: '', area: '', apoyo: '', lugar: '' });
  }

  // Inicia la conexión real (RF-06) y refresca el estado de la tarjeta.
  async function conectar(e: Exalumno) {
    if (!token || enviando) return;
    setEnviando(e.id);
    try {
      await conectarConExalumno(token, e.id, misMatches);
      const actualizados = await obtenerMisMatches(token);
      setMisMatches(actualizados);
      notificar(`✅ Le avisamos a ${e.nombre} que querés conectar.`);
    } catch {
      notificar('❌ No pudimos enviar la solicitud. Intentá de nuevo en un momento.');
    } finally {
      setEnviando(null);
    }
  }

  const hayFiltros = Object.values(aplicados).some(Boolean);

  return (
    <StudentShell active="directorio">
      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-ucr-primary to-ucr-secondary p-8 text-white shadow-sm">
          <h1 className="font-ucr-display text-3xl font-bold tracking-tight sm:text-4xl">Directorio de Exalumnos</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Descubrí egresados de la UCR dispuestos a apoyarte con mentoría, empleo, pasantías o financiamiento para tu proyecto de graduación.
          </p>
        </section>

        {/* Filtros (RF-04) */}
        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ucr-outline">Nombre</span>
              <input
                type="text"
                value={busqNombre}
                onChange={(e) => setBusqNombre(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') aplicarFiltros(); }}
                placeholder="Buscar por nombre…"
                className="rounded-xl border border-ucr-outline-variant bg-ucr-surface-container px-4 py-2 text-sm text-ucr-on-surface placeholder:text-ucr-outline focus:border-ucr-celeste focus:outline-none"
              />
            </div>
            <FiltroBtn label="Carrera UCR" valor={filtroCarrera} placeholder="Todas las carreras" onClick={() => setModalAbierto('carrera')} />
            <FiltroBtn label="Sector / Industria" valor={filtroSector} placeholder="Todos los sectores" onClick={() => setModalAbierto('sector')} />
            <FiltroBtn label="Áreas de interés" valor={filtroArea} placeholder="Cualquier área" onClick={() => setModalAbierto('area')} />
            <FiltroBtn label="Tipo de apoyo" valor={filtroApoyo} placeholder="Cualquiera" onClick={() => setModalAbierto('apoyo')} />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ucr-outline">País / Ciudad</span>
              <input
                type="text"
                value={filtroLugar}
                onChange={(e) => setFiltroLugar(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') aplicarFiltros(); }}
                placeholder="Ej: Costa Rica"
                className="w-36 rounded-xl border border-ucr-outline-variant bg-ucr-surface-container px-4 py-2 text-sm text-ucr-on-surface placeholder:text-ucr-outline focus:border-ucr-celeste focus:outline-none"
              />
            </div>

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
              {hayFiltros ? 'No hay exalumnos que coincidan con los filtros.' : 'Aún no hay exalumnos con perfil completo en el directorio.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {filtrada.map((e) => {
                const match = matchPorExalumno.get(e.id);
                return (
                  <article key={e.id} className="flex flex-col rounded-3xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                      {e.foto_perfil ? (
                        <img src={e.foto_perfil} alt={e.nombre} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ucr-secondary-container/40 font-ucr-display text-lg font-bold text-ucr-primary">
                          {iniciales(e.nombre)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-brand-heading text-base font-bold text-ucr-on-surface">{e.nombre}</h3>
                          {e.anio_graduacion && (
                            <span className="shrink-0 rounded-full bg-ucr-secondary/10 px-2 py-0.5 text-xs font-semibold text-ucr-secondary">UCR {e.anio_graduacion}</span>
                          )}
                        </div>
                        <p className="truncate text-xs text-ucr-on-surface-variant">
                          {e.carreras[0] || '—'}{e.facultades[0] ? ` · ${e.facultades[0]}` : ''}{e.ciudad ? ` · ${e.ciudad}` : ''}
                        </p>
                      </div>
                    </div>

                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ucr-outline">Sector / Industria</p>
                    <p className="mb-3 line-clamp-2 text-sm font-medium leading-snug text-ucr-on-surface">
                      {e.sectores.length ? e.sectores.join(', ') : 'Sin sector registrado'}
                    </p>

                    <div className="mb-3">
                      <ProgressBar value={e.score} label="Afinidad con tu perfil" showValue />
                    </div>

                    {e.areas.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {e.areas.slice(0, 3).map((a) => (
                          <span key={a} className="rounded-full bg-ucr-surface-container px-2.5 py-0.5 text-xs text-ucr-on-surface-variant">#{a}</span>
                        ))}
                      </div>
                    )}

                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {APOYO_LABEL.filter((a) => e.apoyo[a.clave]).map((a) => (
                        <span key={a.clave} className="rounded-full border border-ucr-celeste/40 bg-ucr-celeste/10 px-2.5 py-0.5 text-xs font-medium text-ucr-secondary">{a.label}</span>
                      ))}
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('open-global-chatbot', {
                            detail: { mensaje: `Analiza mi match con ${e.nombre}` },
                          }));
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ucr-secondary/10 py-2 text-sm font-semibold text-ucr-secondary transition hover:bg-ucr-secondary/20"
                      >
                        <span className="material-symbols-outlined text-base">psychology</span>
                        Ver Match Emocional (IA)
                      </button>

                      {match?.estado === 'activo' ? (
                        <div className="rounded-2xl bg-ucr-esmeralda/10 p-3 text-sm">
                          <p className="font-semibold text-ucr-esmeralda">¡Conectados!</p>
                          {match.correo && (
                            <p><a href={`mailto:${match.correo}`} className="text-ucr-secondary underline">{match.correo}</a></p>
                          )}
                        </div>
                      ) : match?.estado === 'contactado' ? (
                        <span className="flex items-center gap-2 text-sm text-ucr-outline">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          Solicitud enviada · pendiente de respuesta
                        </span>
                      ) : match?.estado === 'cerrado' ? (
                        <span className="text-sm text-ucr-outline">Conexión cerrada</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => conectar(e)}
                          disabled={enviando === e.id}
                          className="w-full rounded-2xl border border-ucr-outline-variant py-2 text-sm font-semibold text-ucr-on-surface transition hover:border-ucr-secondary hover:text-ucr-secondary disabled:opacity-60"
                        >
                          {enviando === e.id ? 'Enviando…' : 'Conectar'}
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

        {/* Modales de filtros */}
        {modalAbierto === 'carrera' && (
          <PickerModal titulo="Carrera UCR" opciones={opcionesCarrera} seleccionado={filtroCarrera} onSeleccionar={setFiltroCarrera} onCerrar={() => setModalAbierto(null)} placeholder="Todas las carreras" />
        )}
        {modalAbierto === 'sector' && (
          <PickerModal titulo="Sector / Industria" opciones={opcionesSector} seleccionado={filtroSector} onSeleccionar={setFiltroSector} onCerrar={() => setModalAbierto(null)} placeholder="Todos los sectores" />
        )}
        {modalAbierto === 'area' && (
          <PickerModal titulo="Áreas de interés" opciones={opcionesArea} seleccionado={filtroArea} onSeleccionar={setFiltroArea} onCerrar={() => setModalAbierto(null)} placeholder="Cualquier área" />
        )}
        {modalAbierto === 'apoyo' && (
          <PickerModal titulo="Tipo de apoyo" opciones={opcionesApoyo} seleccionado={filtroApoyo} onSeleccionar={setFiltroApoyo} onCerrar={() => setModalAbierto(null)} placeholder="Cualquiera" />
        )}
      </main>
    </StudentShell>
  );
}
