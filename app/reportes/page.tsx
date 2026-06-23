'use client';

// Reportes del estudiante: denuncias, quejas o sugerencias sobre estudiantes o
// exalumnos. Se envían al administrador (file store en el BE) y se podrán ver en
// el panel admin. Diseño de marca, creativo y responsivo.

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentShell from '@/components/student/StudentShell';
import { notificar } from '@/components/student/Toast';
import { useAuth } from '@/context/AuthContext';
import { enviarReporte, misReportes } from '@/lib/reportesAnomalias';

const TIPOS = [
  { key: 'Denuncia', desc: 'Conducta grave o que viola las normas.', icon: 'gavel', cls: 'border-error/40 bg-error/5', act: 'border-error bg-error/10 ring-2 ring-error', ic: 'text-error' },
  { key: 'Queja', desc: 'Inconformidad o mala experiencia.', icon: 'sentiment_dissatisfied', cls: 'border-secondary/40 bg-secondary/5', act: 'border-secondary bg-secondary/10 ring-2 ring-secondary', ic: 'text-secondary' },
  { key: 'Sugerencia', desc: 'Idea para mejorar la comunidad.', icon: 'lightbulb', cls: 'border-tertiary/40 bg-tertiary/5', act: 'border-tertiary bg-tertiary/10 ring-2 ring-tertiary', ic: 'text-tertiary' },
];
const MOTIVOS = ['Acoso o intimidación', 'Conducta inapropiada', 'Fraude o plagio', 'Suplantación de identidad', 'Información falsa', 'Otro'];

const input = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30';
const label = 'mb-1.5 block text-sm font-body-semibold text-primary';

const chipEstado: Record<string, string> = {
  nueva: 'bg-secondary-container text-on-secondary-container',
  en_revision: 'bg-amber-100 text-amber-800',
  resuelta: 'bg-emerald-100 text-emerald-700',
};

export default function ReportesPage() {
  const router = useRouter();
  const { token, loading } = useAuth();

  const [tipo, setTipo] = useState('Denuncia');
  const [personaTipo, setPersonaTipo] = useState('Estudiante');
  const [personaNombre, setPersonaNombre] = useState('');
  const [personaId, setPersonaId] = useState('');
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [descripcion, setDescripcion] = useState('');
  const [anonimo, setAnonimo] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !token) router.replace('/login');
  }, [loading, token, router]);

  const cargar = useCallback(async () => {
    if (token) setHistorial(await misReportes(token));
  }, [token]);
  useEffect(() => { cargar(); }, [cargar]);

  const esSugerencia = tipo === 'Sugerencia';

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!descripcion.trim()) return setError('Contanos qué pasó en la descripción.');
    if (!esSugerencia && !personaNombre.trim()) return setError('Indicá a la persona involucrada.');
    setEnviando(true);
    try {
      await enviarReporte(token as string, {
        tipo,
        persona_tipo: esSugerencia ? 'General' : personaTipo,
        persona_nombre: esSugerencia ? '' : personaNombre.trim(),
        persona_identificador: esSugerencia ? '' : personaId.trim(),
        motivo: esSugerencia ? '' : motivo,
        descripcion: descripcion.trim(),
        anonimo,
      });
      setOk(true);
      setPersonaNombre(''); setPersonaId(''); setDescripcion('');
      notificar('✅ Reporte enviado al administrador');
      cargar();
      setTimeout(() => setOk(false), 4000);
    } catch {
      setError('No se pudo enviar el reporte. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <StudentShell active="reportes">
      <div className="mx-auto max-w-[1100px] p-8">
        {/* Encabezado */}
        <header className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 text-on-primary">
          <span className="material-symbols-outlined mb-2 text-4xl">flag</span>
          <h1 className="font-headline-md text-2xl sm:text-3xl">Reportes</h1>
          <p className="mt-2 max-w-2xl text-on-primary/85">
            Reportá anomalías con estudiantes o exalumnos: denuncias, quejas o sugerencias. Tu reporte llega
            <strong> directo al administrador</strong>.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Formulario */}
          <form onSubmit={enviar} className="space-y-6 lg:col-span-2">
            {/* Tipo */}
            <div>
              <label className={label}>Tipo de reporte</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {TIPOS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTipo(t.key)}
                    className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all ${tipo === t.key ? t.act : `${t.cls} hover:-translate-y-0.5`}`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${t.ic}`}>{t.icon}</span>
                    <span className="font-body-semibold text-primary">{t.key}</span>
                    <span className="text-xs text-on-surface-variant">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Persona involucrada (no aplica a sugerencia) */}
            {!esSugerencia && (
              <div className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
                <div>
                  <label className={label}>¿A quién reportás?</label>
                  <div className="flex gap-2">
                    {['Estudiante', 'Exalumno'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPersonaTipo(p)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${personaTipo === p ? 'bg-primary text-on-primary' : 'border border-outline-variant bg-surface-container-low text-on-surface-variant'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className={label}>Nombre de la persona</label><input className={input} value={personaNombre} onChange={(e) => setPersonaNombre(e.target.value)} placeholder="Nombre y apellidos" /></div>
                  <div><label className={label}>Carné / correo (opcional)</label><input className={input} value={personaId} onChange={(e) => setPersonaId(e.target.value)} placeholder="Para identificarla mejor" /></div>
                </div>
                <div>
                  <label className={label}>Motivo</label>
                  <select className={input} value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                    {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className={label}>{esSugerencia ? 'Tu sugerencia' : 'Describí lo ocurrido'}</label>
              <textarea
                className={`${input} min-h-[140px]`}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder={esSugerencia ? 'Compartí tu idea para mejorar la comunidad…' : 'Detallá qué pasó, cuándo y cualquier dato relevante…'}
              />
            </div>

            {/* Anónimo */}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <input type="checkbox" className="h-5 w-5 accent-secondary" checked={anonimo} onChange={(e) => setAnonimo(e.target.checked)} />
              <span className="text-sm text-on-surface">
                <span className="font-body-semibold text-primary">Enviar de forma anónima.</span> La persona reportada nunca sabrá quién la reportó.
              </span>
            </label>

            {error && (
              <p className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-sm font-semibold text-error">
                <span className="material-symbols-outlined text-base">error</span> {error}
              </p>
            )}
            {ok && (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                <span className="material-symbols-outlined text-base">check_circle</span> ¡Enviado! El administrador lo revisará.
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-4 font-bold text-on-primary shadow-md transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 sm:w-auto sm:px-10"
            >
              <span className="material-symbols-outlined">send</span> {enviando ? 'Enviando…' : 'Enviar reporte'}
            </button>
          </form>

          {/* Lateral: confidencialidad + historial */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5">
              <div className="mb-2 flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined">shield</span>
                <h3 className="font-body-semibold">Confidencial y seguro</h3>
              </div>
              <ul className="space-y-2 text-xs leading-relaxed text-on-surface-variant">
                <li>• Tu identidad es <strong>confidencial</strong>; el reportado nunca la conoce.</li>
                <li>• <strong>3 reportes</strong> sobre un mismo perfil generan una suspensión temporal automática.</li>
                <li>• Llega <strong>directo al administrador</strong> para su revisión.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
              <h3 className="mb-3 font-body-semibold text-primary">Mis reportes</h3>
              {historial.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Aún no enviaste reportes.</p>
              ) : (
                <ul className="space-y-3">
                  {historial.map((r) => (
                    <li key={r.id} className="rounded-xl border border-outline-variant/40 p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-sm font-body-semibold text-primary">{r.tipo}{r.persona_nombre ? ` · ${r.persona_nombre}` : ''}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${chipEstado[r.estado] || 'bg-surface-container text-on-surface-variant'}`}>
                          {String(r.estado).replace('_', ' ')}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-on-surface-variant">{r.descripcion}</p>
                      <p className="mt-1 text-[10px] text-on-surface-variant">{new Date(r.created_at).toLocaleDateString('es-CR')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </StudentShell>
  );
}
