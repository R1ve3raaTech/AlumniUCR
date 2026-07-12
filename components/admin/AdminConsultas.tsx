'use client';

// Panel del administrador: lista las consultas de soporte enviadas desde el
// Centro de Ayuda por personas visitantes y permite marcarlas como atendidas.
// Si el usuario no es administrador, el endpoint responde 403 y no se muestra.

import React, { useEffect, useState } from 'react';
import { listarConsultasSoporte, marcarConsultaAtendida } from '@/lib/admin/consultasSoporte';
import styles from './AdminSolicitudes.module.css';

interface Consulta {
  id: string;
  nombre: string;
  apellidos: string;
  cedula: string;
  telefono: string;
  mensaje: string;
  estado: string;
  created_at: string;
}

export default function AdminConsultas({ token }: { token: string }) {
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [guardando, setGuardando] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await listarConsultasSoporte(token);
        if (!activo) return;
        setConsultas(res?.data ?? []);
        setEsAdmin(true);
      } catch {
        if (activo) setEsAdmin(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  if (!esAdmin) return null;

  const marcar = async (id: string) => {
    setGuardando(id);
    try {
      const res = await marcarConsultaAtendida(token, id);
      const actualizada: Consulta = res.data;
      setConsultas((lista) => lista.map((c) => (c.id === id ? actualizada : c)));
    } catch {
      // se mantiene simple
    } finally {
      setGuardando(null);
    }
  };

  const pendientes = consultas.filter((c) => c.estado !== 'atendida').length;

  return (
    <div className={styles.wrap}>
      <span className={styles.count}>
        {consultas.length} consulta(s){pendientes > 0 ? ` · ${pendientes} sin atender` : ''}
      </span>

      {consultas.length === 0 ? (
        <p className={styles.empty}>Aún no hay consultas de soporte.</p>
      ) : (
        <div className={styles.list}>
          {consultas.map((c) => (
            <article key={c.id} className={styles.item}>
              <div className={styles.itemHead}>
                <div>
                  <h3 className={styles.itemName}>{c.nombre} {c.apellidos}</h3>
                  <p className={styles.itemMeta}>
                    {new Date(c.created_at).toLocaleString('es-CR')}
                  </p>
                </div>
                <span className={`${styles.estado} ${styles[`estado_${c.estado}`] ?? ''}`}>
                  {c.estado}
                </span>
              </div>

              <div className={styles.datos}>
                <span><strong>Cédula / Doc.:</strong> {c.cedula}</span>
                <span><strong>Teléfono:</strong> {c.telefono}</span>
              </div>

              <p className={styles.mensaje}>{c.mensaje}</p>

              <div className={styles.acciones}>
                {c.estado === 'atendida' ? (
                  <span className={styles.ok}>✓ Atendida</span>
                ) : (
                  <button
                    type="button"
                    className={styles.generar}
                    onClick={() => marcar(c.id)}
                    disabled={guardando === c.id}
                  >
                    {guardando === c.id ? 'Guardando…' : 'Marcar como atendida'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
