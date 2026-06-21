'use client';

// Panel del administrador: cola de donaciones pendientes de confirmación con
// alerta SLA (RF-07/RF-08.2). Es un RESUMEN con alerta de antigüedad; la
// confirmación/rechazo con visor de comprobante vive en /admin/donaciones.
// Usa el endpoint existente GET /api/admin/donaciones/pendientes. Si el usuario
// no es admin, responde 403 y el bloque se oculta.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerDonacionesPendientes } from '@/lib/usuarios';
import styles from './AdminSolicitudes.module.css';

interface DonacionPendiente {
  id: string;
  monto?: number;
  moneda?: string;
  created_at?: string;
  alerta_48h?: boolean;
  usuarios?: { nombre?: string; correo_electronico?: string } | null;
  proyecto_graduacion?: { titulo_proyecto?: string } | null;
  tipo_pago?: { descripcion?: string } | null;
}

const formatoMonto = (monto?: number, moneda?: string) =>
  typeof monto === 'number'
    ? `${moneda === 'USD' ? '$' : '₡'}${monto.toLocaleString('es-CR')}`
    : '—';

export default function AdminDonacionesPendientes({ token }: { token: string }) {
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);
  const [donaciones, setDonaciones] = useState<DonacionPendiente[]>([]);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const lista = await obtenerDonacionesPendientes(token);
        if (!activo) return;
        setDonaciones(lista as DonacionPendiente[]);
        setEsAdmin(true);
      } catch {
        if (activo) setEsAdmin(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  if (!esAdmin) return null;

  const vencidas = donaciones.filter((d) => d.alerta_48h).length;

  return (
    <div className={styles.wrap}>
      <span className={styles.count}>
        {donaciones.length} pendiente(s)
        {vencidas > 0 ? ` · ${vencidas} vencida(s) > 48 h` : ''}
      </span>

      {donaciones.length === 0 ? (
        <p className={styles.empty}>No hay donaciones pendientes de confirmación.</p>
      ) : (
        <>
          <div className={styles.list}>
            {donaciones.map((d) => (
              <article key={d.id} className={styles.item}>
                <div className={styles.itemHead}>
                  <div>
                    <h3 className={styles.itemName}>
                      {formatoMonto(d.monto, d.moneda)} · {d.usuarios?.nombre || 'Exalumno'}
                    </h3>
                    <p className={styles.itemMeta}>
                      {d.proyecto_graduacion?.titulo_proyecto || 'Fondo general'}
                      {d.created_at ? ` · ${new Date(d.created_at).toLocaleDateString('es-CR')}` : ''}
                    </p>
                  </div>
                  <span
                    className={`${styles.estado} ${
                      d.alerta_48h ? styles.estado_rechazado : styles.estado_pendiente
                    }`}
                  >
                    {d.alerta_48h ? 'vencida > 48 h' : 'pendiente'}
                  </span>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.acciones}>
            <Link href="/admin/donaciones" className={styles.generar}>
              Confirmar en donaciones
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
