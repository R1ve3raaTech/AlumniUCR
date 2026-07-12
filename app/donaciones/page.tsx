'use client';

// Donaciones del exalumno (RF-07). Formulario para registrar una donación a un
// proyecto de graduación. La donación queda en estado 'pendiente' hasta que el
// admin la confirme desde /admin/donaciones (RF-08.2).
//
// Contrato del BE (POST /donaciones): exige id_usuario_exalumno, id_tipo_pago,
// monto>0, id_proyecto, moneda, fecha_hora_transferencia y numero_referencia.
// comprobante (URL) y mensaje son opcionales.
//
// Pendiente de BE (Adri): subida de comprobante a Storage (hoy es URL de texto),
// "fondo general" (id_proyecto opcional) y email al admin al crear. El FE ya está
// listo para enchufar cuando el BE lo soporte.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRequireRole } from '@/lib/auth/useRequireRole';
import AlumniLogo from '@/components/common/AlumniLogo';
import { crearDonacion, obtenerTiposPago, obtenerProyectos, subirComprobante } from '@/lib/donaciones/donaciones';
import CargandoGirasol from '@/components/common/CargandoGirasol';
import styles from './donaciones.module.css';

interface Opcion { id: number | string; label: string }

const arr = (res: unknown) => (Array.isArray(res) ? res : (res as { data?: unknown[] })?.data ?? []);

export default function DonacionesPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { verificando, autorizado } = useRequireRole(['exalumno', 'voluntario']);

  const [tiposPago, setTiposPago] = useState<Opcion[]>([]);
  const [proyectos, setProyectos] = useState<Opcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const [form, setForm] = useState({
    monto: '',
    moneda: 'CRC',
    id_tipo_pago: '',
    id_proyecto: '',
    fecha_hora_transferencia: '',
    numero_referencia: '',
    mensaje: '',
  });
  const [archivo, setArchivo] = useState<File | null>(null);

  useEffect(() => {
    if (!token || !autorizado) return;
    let activo = true;
    (async () => {
      try {
        const [tp, pr] = await Promise.all([obtenerTiposPago(token), obtenerProyectos(token)]);
        if (!activo) return;
        setTiposPago(arr(tp).map((t: { id: number | string; descripcion?: string }) => ({ id: t.id, label: t.descripcion || `Método ${t.id}` })));
        setProyectos(arr(pr).map((p: { id: number | string; titulo_proyecto?: string }) => ({ id: p.id, label: p.titulo_proyecto || `Proyecto ${p.id}` })));
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar los catálogos.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token, autorizado]);

  const setCampo = (campo: keyof typeof form, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  // id_proyecto es opcional: vacío = "fondo general". El comprobante (archivo) es obligatorio.
  const valido = useMemo(() =>
    Number(form.monto) > 0 && form.id_tipo_pago && form.moneda &&
    form.fecha_hora_transferencia && form.numero_referencia.trim() && !!archivo, [form, archivo]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!valido || !user?.id || !archivo) return;
    setEnviando(true);
    setError('');
    try {
      // 1) Subir el comprobante a Storage y obtener su ruta.
      const rutaComprobante = await subirComprobante(token as string, archivo);
      // 2) Crear la donación con esa ruta.
      await crearDonacion(token as string, {
        id_usuario_exalumno: user.id,
        id_tipo_pago: form.id_tipo_pago,
        monto: Number(form.monto),
        id_proyecto: form.id_proyecto || null,
        moneda: form.moneda,
        fecha_hora_transferencia: form.fecha_hora_transferencia,
        numero_referencia: form.numero_referencia.trim(),
        comprobante: rutaComprobante,
        mensaje: form.mensaje.trim() || null,
      });
      setExito(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la donación.');
    } finally {
      setEnviando(false);
    }
  }

  if (verificando || !autorizado) {
    return <CargandoGirasol />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerLinks}>
          <Link href="/mis-donaciones" className={styles.back}>Mis donaciones</Link>
          <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Registrar una donación</h1>
        <p className={styles.heroText}>
          Apoyá un proyecto de graduación con tu aporte. Tu donación quedará en revisión
          hasta que la administración confirme el comprobante.
        </p>
      </section>

      <main className={styles.main}>
        {exito ? (
          <div className={styles.exito}>
            <span className={styles.exitoIcon}>✓</span>
            <h2 className={styles.exitoTitle}>¡Gracias por tu aporte!</h2>
            <p className={styles.exitoText}>
              Tu donación quedó registrada en estado <strong>pendiente</strong>. La administración
              la revisará y confirmará. Podés ver su estado en “Mis donaciones”.
            </p>
            <div className={styles.exitoAcciones}>
              <Link href="/mis-donaciones" className={styles.btnPrimary}>Ver mis donaciones</Link>
              <button
                className={styles.btnGhost}
                onClick={() => {
                  setExito(false);
                  setForm({ monto: '', moneda: 'CRC', id_tipo_pago: '', id_proyecto: '', fecha_hora_transferencia: '', numero_referencia: '', mensaje: '' });
                  setArchivo(null);
                }}
              >
                Registrar otra
              </button>
            </div>
          </div>
        ) : cargando ? (
          <p className={styles.vacio}>Cargando…</p>
        ) : (
          <form className={styles.form} onSubmit={enviar}>
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.fila}>
              <label className={styles.campo}>
                Monto *
                <input type="number" min="1" step="0.01" required placeholder="0.00"
                  value={form.monto} onChange={(e) => setCampo('monto', e.target.value)} />
              </label>
              <label className={styles.campo}>
                Moneda *
                <select value={form.moneda} onChange={(e) => setCampo('moneda', e.target.value)}>
                  <option value="CRC">Colones (CRC)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </label>
            </div>

            <label className={styles.campo}>
              Proyecto a apoyar
              <select value={form.id_proyecto} onChange={(e) => setCampo('id_proyecto', e.target.value)}>
                <option value="">Fondo general (sin proyecto específico)</option>
                {proyectos.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <span className={styles.ayuda}>
                Si no elegís un proyecto, tu aporte va al fondo general de la Fundación.
              </span>
            </label>

            <div className={styles.fila}>
              <label className={styles.campo}>
                Método de pago *
                <select required value={form.id_tipo_pago} onChange={(e) => setCampo('id_tipo_pago', e.target.value)}>
                  <option value="">Seleccioná…</option>
                  {tiposPago.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </label>
              <label className={styles.campo}>
                Fecha y hora de la transferencia *
                <input type="datetime-local" required
                  value={form.fecha_hora_transferencia} onChange={(e) => setCampo('fecha_hora_transferencia', e.target.value)} />
              </label>
            </div>

            <label className={styles.campo}>
              Número de referencia *
              <input type="text" required placeholder="Ej. 0012345678"
                value={form.numero_referencia} onChange={(e) => setCampo('numero_referencia', e.target.value)} />
            </label>

            <label className={styles.campo}>
              Comprobante *
              <input type="file" required accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
              <span className={styles.ayuda}>
                Subí una imagen (JPG/PNG) o PDF del comprobante. Máximo 5MB.
                {archivo ? ` — Seleccionado: ${archivo.name}` : ''}
              </span>
            </label>

            <label className={styles.campo}>
              Mensaje (opcional)
              <textarea rows={3} placeholder="Un mensaje para el estudiante o la administración…"
                value={form.mensaje} onChange={(e) => setCampo('mensaje', e.target.value)} />
            </label>

            <div className={styles.acciones}>
              <Link href="/dashboard" className={styles.btnGhost}>Cancelar</Link>
              <button type="submit" className={styles.btnPrimary} disabled={!valido || enviando}>
                {enviando ? 'Registrando…' : 'Registrar donación'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
