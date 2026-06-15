'use client';

// Solicitudes de contacto recibidas por el estudiante (RF-03). Al aceptar, se
// revela su nivel de beca y correo al exalumno solicitante.

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { obtenerSolicitudesRecibidas, responderSolicitudContacto } from '@/lib/directorioEstudiantes';

interface Solicitud {
  id: string;
  nombre_exalumno: string;
  mensaje: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  created_at: string;
}

const ESTILO_ESTADO: Record<Solicitud['estado'], string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  aceptada: 'bg-emerald-100 text-emerald-700',
  rechazada: 'bg-red-100 text-red-700',
};

export default function SolicitudesContacto() {
  const { token } = useAuth();
  const [lista, setLista] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    obtenerSolicitudesRecibidas(token)
      .then((res) => { if (activo) setLista(res?.data ?? []); })
      .catch(() => { if (activo) setLista([]); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [token]);

  async function responder(id: string, aceptar: boolean) {
    setProcesando(id);
    try {
      const res = await responderSolicitudContacto(token as string, id, aceptar);
      const actualizada: Solicitud = res.data;
      setLista((l) => l.map((s) => (s.id === id ? actualizada : s)));
    } catch {
      /* simple */
    } finally {
      setProcesando(null);
    }
  }

  return (
    <section id="solicitudes" className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-12">
      <div className="mb-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-ucr-secondary">mail</span>
        <h2 className="font-brand-heading text-xl font-bold text-ucr-on-surface">
          Solicitudes de contacto
        </h2>
      </div>
      <p className="mb-4 text-sm text-ucr-on-surface-variant">
        Exalumnos interesados en tu proyecto. Si aceptas, se les revela tu correo y tu nivel
        de beca para coordinar el apoyo.
      </p>

      {cargando ? (
        <p className="text-sm text-ucr-on-surface-variant">Cargando…</p>
      ) : lista.length === 0 ? (
        <p className="text-sm text-ucr-on-surface-variant">Aún no tienes solicitudes de contacto.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((s) => (
            <li key={s.id} className="rounded-2xl border border-ucr-outline-variant p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-ucr-on-surface">{s.nombre_exalumno}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${ESTILO_ESTADO[s.estado]}`}>
                  {s.estado}
                </span>
              </div>
              {s.mensaje && <p className="mt-2 text-sm text-ucr-on-surface-variant">{s.mensaje}</p>}
              {s.estado === 'pendiente' && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => responder(s.id, true)}
                    disabled={procesando === s.id}
                    className="rounded-xl bg-ucr-esmeralda px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => responder(s.id, false)}
                    disabled={procesando === s.id}
                    className="rounded-xl border border-ucr-outline-variant px-4 py-2 text-sm font-semibold text-ucr-on-surface-variant transition hover:border-red-400 hover:text-red-600 disabled:opacity-60"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
