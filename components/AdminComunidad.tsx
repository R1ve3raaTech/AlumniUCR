'use client';

// Panel del administrador: modera los blogs pendientes de la comunidad y gestiona
// los eventos (crear / ocultar). Si no es admin, el endpoint responde 403 y el
// bloque se oculta. Reutiliza AdminSolicitudes.module.css.

import React, { useEffect, useState } from 'react';
import { panelComunidad, moderarBlog, crearEvento, moderarEvento } from '@/lib/comunidad';
import styles from './AdminSolicitudes.module.css';

export default function AdminComunidad({ token }: { token: string }) {
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState({ titulo: '', descripcion: '', fecha: '', hora: '', lugar: '' });

  const cargar = () => {
    panelComunidad(token)
      .then((d) => { setBlogs(d.blogsPendientes || []); setEventos(d.eventos || []); setEsAdmin(true); })
      .catch(() => setEsAdmin(false));
  };
  useEffect(cargar, [token]);

  if (!esAdmin) return null;

  const modBlog = async (id: string, estado: string) => {
    setGuardando(id);
    try { await moderarBlog(token, id, estado); setBlogs((l) => l.filter((b) => b.id !== id)); } finally { setGuardando(null); }
  };
  const modEvento = async (id: string, estado: string) => {
    setGuardando(id);
    try { await moderarEvento(token, id, estado); cargar(); } finally { setGuardando(null); }
  };
  const agregarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.titulo.trim() || !nuevo.descripcion.trim() || !nuevo.fecha || !nuevo.lugar.trim()) return;
    setGuardando('nuevo');
    try {
      await crearEvento(token, nuevo);
      setNuevo({ titulo: '', descripcion: '', fecha: '', hora: '', lugar: '' });
      cargar();
    } finally { setGuardando(null); }
  };

  const inp = 'rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-sm focus:border-secondary focus:outline-none';

  return (
    <div className={styles.wrap}>
      <span className={styles.count}>{blogs.length} aporte(s) por revisar · {eventos.filter((e) => e.estado === 'aprobado').length} evento(s) activos</span>

      {/* Blogs pendientes */}
      {blogs.length === 0 ? (
        <p className={styles.empty}>No hay aportes pendientes de aprobación.</p>
      ) : (
        <div className={styles.list}>
          {blogs.map((b) => (
            <article key={b.id} className={styles.item}>
              <div className={styles.itemHead}>
                <div>
                  <h3 className={styles.itemName}>{b.titulo}</h3>
                  <p className={styles.itemMeta}>{b.autor_nombre} · {b.autor_rol} · {b.tipo} · {new Date(b.created_at).toLocaleString('es-CR')}</p>
                </div>
                <span className={styles.estado}>pendiente</span>
              </div>
              <p className={styles.mensaje}>{b.contenido}</p>
              <div className={styles.acciones}>
                <button type="button" className={styles.rechazar} onClick={() => modBlog(b.id, 'rechazado')} disabled={guardando === b.id}>Rechazar</button>
                <button type="button" className={styles.generar} onClick={() => modBlog(b.id, 'aprobado')} disabled={guardando === b.id}>{guardando === b.id ? 'Guardando…' : 'Aprobar'}</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Crear evento */}
      <form onSubmit={agregarEvento} style={{ marginTop: '1.5rem', display: 'grid', gap: '0.6rem' }}>
        <strong style={{ color: 'var(--ucr-primary, #003445)' }}>Crear evento</strong>
        <div style={{ display: 'grid', gap: '0.6rem', gridTemplateColumns: '1fr 1fr' }}>
          <input className={inp} placeholder="Título" value={nuevo.titulo} onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })} />
          <input className={inp} placeholder="Lugar" value={nuevo.lugar} onChange={(e) => setNuevo({ ...nuevo, lugar: e.target.value })} />
          <input className={inp} type="date" value={nuevo.fecha} onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })} />
          <input className={inp} type="time" value={nuevo.hora} onChange={(e) => setNuevo({ ...nuevo, hora: e.target.value })} />
        </div>
        <textarea className={inp} placeholder="Descripción del evento" value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} />
        <button type="submit" className={styles.generar} disabled={guardando === 'nuevo'} style={{ justifySelf: 'start' }}>
          {guardando === 'nuevo' ? 'Guardando…' : 'Publicar evento'}
        </button>
      </form>

      {/* Eventos existentes */}
      {eventos.filter((e) => e.estado === 'aprobado').length > 0 && (
        <div className={styles.list} style={{ marginTop: '1rem' }}>
          {eventos.filter((e) => e.estado === 'aprobado').map((ev) => (
            <article key={ev.id} className={styles.item}>
              <div className={styles.itemHead}>
                <div>
                  <h3 className={styles.itemName}>{ev.titulo}</h3>
                  <p className={styles.itemMeta}>{ev.fecha}{ev.hora ? ` · ${String(ev.hora).slice(0, 5)}` : ''} · {ev.lugar}</p>
                </div>
              </div>
              <div className={styles.acciones}>
                <button type="button" className={styles.rechazar} onClick={() => modEvento(ev.id, 'rechazado')} disabled={guardando === ev.id}>Ocultar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
