'use client';

// Publicar una posición de empleo/pasantía (RF-10). Solo exalumnos.
// La posición queda activa y aparece en el directorio /posiciones hasta su fecha
// límite (el BE la cierra automáticamente al vencer).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/common/AlumniLogo';
import { crearPosicion, obtenerAreas } from '@/lib/matching/posiciones';
import styles from './nueva.module.css';

interface Area { id: number | string; nombre: string }

const TIPOS = ['empleo', 'pasantía'];
const MODALIDADES = ['presencial', 'remoto', 'híbrido'];
const JORNADAS = ['tiempo completo', 'medio tiempo', 'por horas'];

export default function NuevaPosicionPage() {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const [form, setForm] = useState({
    titulo_puesto: '',
    empresa: '',
    tipo: 'empleo',
    modalidad: 'remoto',
    jornada: 'tiempo completo',
    lugar_trabajo: '',
    fecha_limite: '',
    habilidades: '',
    descripcion: '',
    contexto: '',
  });
  const [areasSel, setAreasSel] = useState<Set<number | string>>(new Set());

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try { setAreas(await obtenerAreas(token)); } catch { /* opcional */ }
    })();
  }, [token]);

  const setCampo = (campo: keyof typeof form, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));
  const toggleArea = (id: number | string) => setAreasSel((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const valido = useMemo(() => form.titulo_puesto.trim().length > 0, [form]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!valido || !user?.id) return;
    setEnviando(true);
    setError('');
    try {
      await crearPosicion(token as string, {
        id_usuario: user.id,
        titulo_puesto: form.titulo_puesto.trim(),
        empresa: form.empresa.trim() || null,
        tipo: form.tipo,
        modalidad: form.modalidad,
        jornada: form.jornada,
        lugar_trabajo: form.lugar_trabajo.trim() || null,
        fecha_limite: form.fecha_limite || null,
        habilidades: form.habilidades.trim() || null,
        descripcion: form.descripcion.trim() || null,
        contexto: form.contexto.trim() || null,
        estado: 'activo',
        pausada: false,
        eliminada: false,
        areas_interes: Array.from(areasSel),
      });
      setExito(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar la posición.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerLinks}>
          <Link href="/mis-posiciones" className={styles.back}>Mis posiciones</Link>
          <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Publicar una posición</h1>
        <p className={styles.heroText}>
          Compartí una oportunidad de empleo o pasantía con los estudiantes de la UCR.
          Estará visible hasta la fecha límite que indiques.
        </p>
      </section>

      <main className={styles.main}>
        {exito ? (
          <div className={styles.exito}>
            <span className={styles.exitoIcon}>✓</span>
            <h2 className={styles.exitoTitle}>¡Posición publicada!</h2>
            <p className={styles.exitoText}>Ya aparece en el directorio de posiciones para los estudiantes.</p>
            <div className={styles.exitoAcciones}>
              <Link href="/mis-posiciones" className={styles.btnPrimary}>Ver mis posiciones</Link>
              <Link href="/posiciones" className={styles.btnGhost}>Ir al directorio</Link>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={enviar}>
            {error && <p className={styles.error}>{error}</p>}

            <label className={styles.campo}>
              Título del puesto *
              <input type="text" required placeholder="Ej. Desarrollador Frontend Jr."
                value={form.titulo_puesto} onChange={(e) => setCampo('titulo_puesto', e.target.value)} />
            </label>

            <div className={styles.fila}>
              <label className={styles.campo}>
                Empresa
                <input type="text" placeholder="Nombre de la empresa" value={form.empresa} onChange={(e) => setCampo('empresa', e.target.value)} />
              </label>
              <label className={styles.campo}>
                Lugar de trabajo
                <input type="text" placeholder="Ej. San José" value={form.lugar_trabajo} onChange={(e) => setCampo('lugar_trabajo', e.target.value)} />
              </label>
            </div>

            <div className={styles.fila}>
              <label className={styles.campo}>
                Tipo
                <select value={form.tipo} onChange={(e) => setCampo('tipo', e.target.value)}>
                  {TIPOS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </label>
              <label className={styles.campo}>
                Modalidad
                <select value={form.modalidad} onChange={(e) => setCampo('modalidad', e.target.value)}>
                  {MODALIDADES.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </label>
              <label className={styles.campo}>
                Jornada
                <select value={form.jornada} onChange={(e) => setCampo('jornada', e.target.value)}>
                  {JORNADAS.map((j) => <option key={j} value={j}>{j.charAt(0).toUpperCase() + j.slice(1)}</option>)}
                </select>
              </label>
            </div>

            <label className={styles.campo}>
              Fecha límite para aplicar
              <input type="date" value={form.fecha_limite} onChange={(e) => setCampo('fecha_limite', e.target.value)} />
            </label>

            <label className={styles.campo}>
              Habilidades requeridas
              <input type="text" placeholder="Ej. React, TypeScript, trabajo en equipo"
                value={form.habilidades} onChange={(e) => setCampo('habilidades', e.target.value)} />
            </label>

            <label className={styles.campo}>
              Descripción
              <textarea rows={4} placeholder="Describí el rol, responsabilidades y requisitos…"
                value={form.descripcion} onChange={(e) => setCampo('descripcion', e.target.value)} />
            </label>

            <label className={styles.campo}>
              Contexto del equipo (opcional)
              <input type="text" placeholder="Ej. Equipo de 6 personas, startup en crecimiento"
                value={form.contexto} onChange={(e) => setCampo('contexto', e.target.value)} />
            </label>

            {areas.length > 0 && (
              <div className={styles.campo}>
                Áreas temáticas
                <div className={styles.areas}>
                  {areas.map((a) => (
                    <button key={a.id} type="button"
                      className={`${styles.areaChip} ${areasSel.has(a.id) ? styles.areaChipOn : ''}`}
                      aria-pressed={areasSel.has(a.id)} onClick={() => toggleArea(a.id)}>
                      {a.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.acciones}>
              <Link href="/mis-posiciones" className={styles.btnGhost}>Cancelar</Link>
              <button type="submit" className={styles.btnPrimary} disabled={!valido || enviando}>
                {enviando ? 'Publicando…' : 'Publicar posición'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
