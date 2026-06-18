'use client';

// Botón "Reportar perfil" + modal (RF-09.1). Reutilizable en cualquier tarjeta de
// perfil público (directorios, matches). Envía a POST /reportes-usuarios con el
// emisor = usuario logueado. Garantiza anonimato (el reportado nunca ve quién fue).

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { crearReporte, MOTIVOS_REPORTE } from '@/lib/reportes';
import styles from './ReportarPerfil.module.css';

export default function ReportarPerfil({ idReportado, nombre }: { idReportado: string; nombre?: string }) {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  // Solo usuarios autenticados pueden reportar (RF-09.1). Y no a sí mismos.
  if (!token || !user?.id) return null;
  if (user.id === idReportado) return null;

  async function enviar() {
    if (!motivo || !token || !user?.id) return;
    setEnviando(true);
    setError('');
    try {
      await crearReporte(token, {
        id_usuario_reportado: idReportado,
        id_usuario_emisor: user.id,
        motivo,
        descripcion,
      });
      setEnviado(true);
    } catch {
      setError('No se pudo enviar el reporte. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  function cerrar() {
    setOpen(false);
    setMotivo('');
    setDescripcion('');
    setEnviado(false);
    setError('');
  }

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)} title="Reportar perfil">
        <span aria-hidden>⚑</span> Reportar
      </button>

      {open && (
        <div className={styles.bg} onClick={cerrar}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.head}>
              <span>Reportar perfil{nombre ? ` · ${nombre}` : ''}</span>
              <button className={styles.x} onClick={cerrar}>✕</button>
            </div>

            {enviado ? (
              <div className={styles.body}>
                <p className={styles.ok}>✓ Reporte enviado. Gracias, la administración lo revisará.</p>
                <p className={styles.nota}>Tu reporte es anónimo: el usuario reportado no sabrá quién lo reportó.</p>
                <div className={styles.acciones}>
                  <button className={styles.btnPrimary} onClick={cerrar}>Cerrar</button>
                </div>
              </div>
            ) : (
              <div className={styles.body}>
                <label className={styles.label}>Motivo</label>
                <select className={styles.select} value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                  <option value="">Seleccioná un motivo…</option>
                  {MOTIVOS_REPORTE.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>

                <label className={styles.label}>Descripción (opcional)</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Detalles adicionales…"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />

                <p className={styles.nota}>Tu reporte es anónimo. Con 3 reportes, el perfil se suspende automáticamente.</p>
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.acciones}>
                  <button className={styles.btnGhost} onClick={cerrar}>Cancelar</button>
                  <button className={styles.btnPrimary} disabled={!motivo || enviando} onClick={enviar}>
                    {enviando ? 'Enviando…' : 'Enviar reporte'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
