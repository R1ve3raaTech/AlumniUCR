'use client';

// Panel del administrador: lista los exalumnos cuya cuenta quedó en estado
// 'pendiente' (RF-01) y permite aprobarlos o rechazarlos (RF-08). Usa los
// endpoints existentes GET /users y PUT /users/:id (cambia `estado`). Si el
// usuario no es administrador, el endpoint responde 403 y el bloque se oculta.

import React, { useEffect, useState } from 'react';
import { obtenerUsuarios, cambiarEstadoUsuario } from '@/lib/admin/usuarios';
import styles from './AdminSolicitudes.module.css';

interface Usuario {
  id: string;
  nombre?: string;
  correo_electronico?: string;
  estado?: string;
  roles?: { nombre?: string } | null;
  rol?: string;
}

const esExalumno = (u: Usuario) =>
  (u.roles?.nombre || u.rol || '').toLowerCase().trim() === 'exalumno';
const estaPendiente = (u: Usuario) =>
  (u.estado || '').toLowerCase().trim() === 'pendiente';

export default function AdminExalumnosPendientes({ token }: { token: string }) {
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);
  const [pendientes, setPendientes] = useState<Usuario[]>([]);
  const [guardando, setGuardando] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const lista = await obtenerUsuarios(token);
        if (!activo) return;
        setPendientes((lista as Usuario[]).filter((u) => esExalumno(u) && estaPendiente(u)));
        setEsAdmin(true);
      } catch {
        if (activo) setEsAdmin(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  if (!esAdmin) return null;

  const resolver = async (id: string, estado: 'activo' | 'rechazado') => {
    setGuardando(id);
    try {
      await cambiarEstadoUsuario(token, id, estado);
      // Sale de la cola al aprobar/rechazar.
      setPendientes((lista) => lista.filter((u) => u.id !== id));
    } catch {
      // se mantiene simple
    } finally {
      setGuardando(null);
    }
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.count}>
        {pendientes.length} exalumno(s) por aprobar
      </span>

      {pendientes.length === 0 ? (
        <p className={styles.empty}>No hay exalumnos pendientes de aprobación.</p>
      ) : (
        <div className={styles.list}>
          {pendientes.map((u) => (
            <article key={u.id} className={styles.item}>
              <div className={styles.itemHead}>
                <div>
                  <h3 className={styles.itemName}>{u.nombre || 'Exalumno'}</h3>
                  <p className={styles.itemMeta}>{u.correo_electronico || '—'}</p>
                </div>
                <span className={`${styles.estado} ${styles.estado_pendiente ?? ''}`}>
                  pendiente
                </span>
              </div>

              <div className={styles.acciones}>
                <button
                  type="button"
                  className={styles.generar}
                  onClick={() => resolver(u.id, 'activo')}
                  disabled={guardando === u.id}
                >
                  {guardando === u.id ? 'Guardando…' : 'Aprobar'}
                </button>
                <button
                  type="button"
                  className={styles.rechazar}
                  onClick={() => resolver(u.id, 'rechazado')}
                  disabled={guardando === u.id}
                >
                  Rechazar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
