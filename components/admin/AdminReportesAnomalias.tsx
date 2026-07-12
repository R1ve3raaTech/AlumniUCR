'use client';

// Panel del administrador: reportes (denuncias / quejas / sugerencias) enviados
// por estudiantes sobre estudiantes o exalumnos. Si el usuario no es admin, el
// endpoint responde 403 y el bloque se oculta. Reutiliza AdminSolicitudes.module.css.

import React, { useEffect, useState } from 'react';
import { listarReportes, marcarReporte } from '@/lib/admin/reportesAnomalias';
import styles from './AdminSolicitudes.module.css';

interface Reporte {
  id: string;
  tipo: string;
  persona_tipo: string;
  persona_nombre: string;
  persona_identificador: string;
  motivo: string;
  descripcion: string;
  anonimo: boolean;
  reportado_por_nombre: string;
  estado: string;
  created_at: string;
}

const COLOR: Record<string, string> = {
  Denuncia: '#ba1a1a',
  Queja: '#006687',
  Sugerencia: '#007D67',
};

export default function AdminReportesAnomalias({ token }: { token: string }) {
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [guardando, setGuardando] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const data = await listarReportes(token);
        if (!activo) return;
        setReportes(data as Reporte[]);
        setEsAdmin(true);
      } catch {
        if (activo) setEsAdmin(false);
      }
    })();
    return () => { activo = false; };
  }, [token]);

  if (!esAdmin) return null;

  const marcar = async (id: string, estado: string) => {
    setGuardando(id);
    try {
      const res = await marcarReporte(token, id, estado);
      const actualizado: Reporte = res.data;
      setReportes((l) => l.map((r) => (r.id === id ? actualizado : r)));
    } catch {
      /* simple */
    } finally {
      setGuardando(null);
    }
  };

  const pendientes = reportes.filter((r) => r.estado !== 'resuelta').length;

  return (
    <div className={styles.wrap}>
      <span className={styles.count}>
        {reportes.length} reporte(s){pendientes > 0 ? ` · ${pendientes} sin resolver` : ''}
      </span>

      {reportes.length === 0 ? (
        <p className={styles.empty}>Aún no hay reportes.</p>
      ) : (
        <div className={styles.list}>
          {reportes.map((r) => (
            <article key={r.id} className={styles.item}>
              <div className={styles.itemHead}>
                <div>
                  <h3 className={styles.itemName}>
                    <span style={{ color: COLOR[r.tipo] || 'inherit' }}>{r.tipo}</span>
                    {r.persona_nombre ? ` · ${r.persona_nombre}` : ''}
                    {r.persona_tipo && r.persona_tipo !== 'General' ? ` (${r.persona_tipo})` : ''}
                  </h3>
                  <p className={styles.itemMeta}>
                    {new Date(r.created_at).toLocaleString('es-CR')}
                    {r.motivo ? ` · ${r.motivo}` : ''}
                  </p>
                </div>
                <span className={styles.estado}>{String(r.estado).replace('_', ' ')}</span>
              </div>

              <div className={styles.datos}>
                {r.persona_identificador && <span><strong>Identificador:</strong> {r.persona_identificador}</span>}
                <span><strong>Reportante:</strong> {r.anonimo ? 'Anónimo' : r.reportado_por_nombre || '—'}</span>
              </div>

              <p className={styles.mensaje}>{r.descripcion}</p>

              <div className={styles.acciones}>
                {r.estado === 'resuelta' ? (
                  <span className={styles.ok}>✓ Resuelta</span>
                ) : (
                  <>
                    {r.estado !== 'en_revision' && (
                      <button type="button" className={styles.rechazar} onClick={() => marcar(r.id, 'en_revision')} disabled={guardando === r.id}>
                        En revisión
                      </button>
                    )}
                    <button type="button" className={styles.generar} onClick={() => marcar(r.id, 'resuelta')} disabled={guardando === r.id}>
                      {guardando === r.id ? 'Guardando…' : 'Resolver'}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
