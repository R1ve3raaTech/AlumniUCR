'use client';

// Panel del administrador: lista las solicitudes de colaboradores ("Otros")
// y permite otorgar acceso a los paneles de Proyectos, Mentorías y Estudiantes.
// Si el usuario no es administrador, el endpoint responde 403 y no se muestra.

import React, { useEffect, useState } from 'react';
import {
  listarSolicitudesVoluntarios,
  actualizarAccesosVoluntario,
} from '@/lib/voluntarios';
import styles from './AdminSolicitudes.module.css';

interface Solicitud {
  id: string;
  nombre: string;
  correo_electronico: string;
  telefono: string;
  organizacion: string;
  area_colaboracion: string;
  disponibilidad: string;
  mensaje: string;
  estado: string;
  acceso_proyectos: boolean;
  acceso_mentorias: boolean;
  acceso_estudiantes: boolean;
  created_at: string;
}

type Accesos = Pick<Solicitud, 'acceso_proyectos' | 'acceso_mentorias' | 'acceso_estudiantes'>;

const PANELES: { clave: keyof Accesos; label: string }[] = [
  { clave: 'acceso_proyectos', label: 'Proyectos' },
  { clave: 'acceso_mentorias', label: 'Mentorías' },
  { clave: 'acceso_estudiantes', label: 'Estudiantes' },
];

export default function AdminSolicitudes({ token }: { token: string }) {
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [edits, setEdits] = useState<Record<string, Accesos>>({});
  const [guardando, setGuardando] = useState<string | null>(null);
  const [guardadoOk, setGuardadoOk] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await listarSolicitudesVoluntarios(token);
        if (!activo) return;
        const data: Solicitud[] = res?.data ?? [];
        setSolicitudes(data);
        setEdits(
          Object.fromEntries(
            data.map((s) => [
              s.id,
              {
                acceso_proyectos: s.acceso_proyectos,
                acceso_mentorias: s.acceso_mentorias,
                acceso_estudiantes: s.acceso_estudiantes,
              },
            ]),
          ),
        );
        setEsAdmin(true);
      } catch {
        // 403 u otro error: el usuario no es administrador → no se muestra el panel.
        if (activo) setEsAdmin(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [token]);

  if (!esAdmin) return null;

  const toggle = (id: string, clave: keyof Accesos) => {
    setEdits((e) => ({ ...e, [id]: { ...e[id], [clave]: !e[id][clave] } }));
    setGuardadoOk(null);
  };

  const generarAcceso = async (id: string) => {
    setGuardando(id);
    setGuardadoOk(null);
    try {
      const res = await actualizarAccesosVoluntario(token, id, edits[id]);
      const actualizado: Solicitud = res.data;
      setSolicitudes((lista) => lista.map((s) => (s.id === id ? actualizado : s)));
      setGuardadoOk(id);
    } catch {
      // El error global se podría mostrar; aquí se mantiene simple.
    } finally {
      setGuardando(null);
    }
  };

  return (
    <section className={`glass-card ${styles.panel}`}>
      <div className={styles.head}>
        <h2 className={styles.title}>Solicitudes de colaboración</h2>
        <span className={styles.count}>{solicitudes.length}</span>
      </div>

      {solicitudes.length === 0 ? (
        <p className={styles.empty}>Aún no hay solicitudes de colaboradores.</p>
      ) : (
        <div className={styles.list}>
          {solicitudes.map((s) => (
            <article key={s.id} className={styles.item}>
              <div className={styles.itemHead}>
                <div>
                  <h3 className={styles.itemName}>{s.nombre}</h3>
                  <p className={styles.itemMeta}>
                    {s.area_colaboracion} · {s.disponibilidad}
                  </p>
                </div>
                <span className={`${styles.estado} ${styles[`estado_${s.estado}`] ?? ''}`}>
                  {s.estado}
                </span>
              </div>

              <div className={styles.datos}>
                <span><strong>Correo:</strong> {s.correo_electronico}</span>
                <span><strong>Teléfono:</strong> {s.telefono}</span>
                <span><strong>Organización:</strong> {s.organizacion}</span>
              </div>

              <p className={styles.mensaje}>{s.mensaje}</p>

              <div className={styles.accesos}>
                <span className={styles.accesosLabel}>Otorgar acceso a:</span>
                <div className={styles.checks}>
                  {PANELES.map((p) => (
                    <label key={p.clave} className={styles.check}>
                      <input
                        type="checkbox"
                        checked={edits[s.id]?.[p.clave] ?? false}
                        onChange={() => toggle(s.id, p.clave)}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
                <div className={styles.acciones}>
                  <button
                    type="button"
                    className={styles.generar}
                    onClick={() => generarAcceso(s.id)}
                    disabled={guardando === s.id}
                  >
                    {guardando === s.id ? 'Guardando…' : 'Generar acceso'}
                  </button>
                  {guardadoOk === s.id && <span className={styles.ok}>✓ Accesos actualizados</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
