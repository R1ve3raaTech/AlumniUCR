'use client';

// Adaptación del CV a una posición con IA (RF-12).
// El estudiante genera sugerencias (Claude), las revisa lado a lado (original vs
// sugerido), edita/acepta/descarta cada una y guarda el resultado como una
// versión del CV (máx 10). Punto de entrada desde /posiciones.

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlumniLogo from '@/components/AlumniLogo';
import { adaptarCvConIA, guardarVersionCv } from '@/lib/curriculum';
import styles from './adaptar.module.css';

interface Sugerencia {
  seccion: string; id_item: string | null; campo: string;
  original: string; sugerido: string; razon?: string;
}
interface SugEditable extends Sugerencia { aplicar: boolean; sugeridoEdit: string }

export default function AdaptarCvPage() {
  const router = useRouter();
  const params = useParams();
  const idPosicion = String(params.id);
  const { token, loading: authLoading } = useAuth();

  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [posicion, setPosicion] = useState<{ titulo_puesto?: string; empresa?: string } | null>(null);
  const [resumen, setResumen] = useState('');
  const [sugerencias, setSugerencias] = useState<SugEditable[] | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  if (!authLoading && !token) { router.replace('/login'); }

  async function generar() {
    setGenerando(true); setError(''); setGuardado(false);
    try {
      const res = await adaptarCvConIA(token as string, idPosicion);
      setPosicion(res?.posicion || null);
      const data = res?.sugerencias || {};
      setResumen(data.resumen || '');
      const lista: Sugerencia[] = Array.isArray(data.sugerencias) ? data.sugerencias : [];
      setSugerencias(lista.map((s) => ({ ...s, aplicar: true, sugeridoEdit: s.sugerido })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron generar las sugerencias.');
    } finally {
      setGenerando(false);
    }
  }

  function toggle(idx: number) {
    setSugerencias((l) => l!.map((s, i) => i === idx ? { ...s, aplicar: !s.aplicar } : s));
  }
  function editar(idx: number, valor: string) {
    setSugerencias((l) => l!.map((s, i) => i === idx ? { ...s, sugeridoEdit: valor } : s));
  }

  async function guardarVersion() {
    if (!sugerencias) return;
    setGuardando(true); setError('');
    const aplicadas = sugerencias.filter((s) => s.aplicar)
      .map(({ seccion, id_item, campo, original, sugeridoEdit, razon }) => ({ seccion, id_item, campo, original, sugerido: sugeridoEdit, razon }));
    try {
      await guardarVersionCv(token as string, {
        id_posicion: idPosicion,
        nombre_version: `CV para ${posicion?.titulo_puesto || 'la posición'}`.slice(0, 80),
        contenido_adaptado: { resumen, sugerencias_aplicadas: aplicadas },
        sugerencias_ia: { resumen, sugerencias },
      });
      setGuardado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la versión.');
    } finally {
      setGuardando(false);
    }
  }

  const aplicadasCount = sugerencias?.filter((s) => s.aplicar).length ?? 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <div className={styles.headerLinks}>
          <Link href="/mi-curriculum" className={styles.back}>← Mi currículum</Link>
          <Link href="/posiciones" className={styles.back}>Posiciones</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <span className={styles.badge}>✦ Asistente de IA</span>
        <h1 className={styles.heroTitle}>Adaptá tu CV a la posición</h1>
        <p className={styles.heroText}>
          La IA analiza tu currículum y la posición, y te sugiere mejoras concretas
          (sin inventar nada). Revisá, editá y guardá una versión adaptada.
        </p>
      </section>

      <main className={styles.main}>
        {error && <p className={styles.error}>{error}</p>}

        {!sugerencias ? (
          <div className={styles.startBox}>
            <p className={styles.startText}>
              Generá sugerencias personalizadas para esta posición. Esto consulta a la IA y
              puede tardar unos segundos.
            </p>
            <button className={styles.btnPrimary} disabled={generando} onClick={generar}>
              {generando ? 'Analizando con IA…' : 'Generar sugerencias con IA'}
            </button>
          </div>
        ) : (
          <>
            {posicion && (
              <div className={styles.posInfo}>
                Adaptando para: <strong>{posicion.titulo_puesto}</strong>{posicion.empresa ? ` · ${posicion.empresa}` : ''}
              </div>
            )}
            {resumen && (
              <div className={styles.resumen}>
                <h2 className={styles.resumenTitulo}>Resumen de la IA</h2>
                <p>{resumen}</p>
              </div>
            )}

            {sugerencias.length === 0 ? (
              <p className={styles.vacio}>La IA no encontró mejoras sugeridas. Tu CV ya está bien alineado. 👍</p>
            ) : (
              <div className={styles.sugerencias}>
                {sugerencias.map((s, idx) => (
                  <article key={idx} className={`${styles.sug} ${s.aplicar ? '' : styles.sugOff}`}>
                    <div className={styles.sugHead}>
                      <div className={styles.sugTags}>
                        <span className={styles.tag}>{s.seccion}</span>
                        <span className={styles.tagCampo}>{s.campo}</span>
                      </div>
                      <label className={styles.toggle}>
                        <input type="checkbox" checked={s.aplicar} onChange={() => toggle(idx)} /> Aplicar
                      </label>
                    </div>
                    <div className={styles.comparacion}>
                      <div className={styles.colOriginal}>
                        <span className={styles.colLabel}>Original</span>
                        <p className={styles.original}>{s.original || '—'}</p>
                      </div>
                      <div className={styles.colSugerido}>
                        <span className={styles.colLabel}>Sugerido (editable)</span>
                        <textarea className={styles.sugeridoInput} rows={2} value={s.sugeridoEdit}
                          onChange={(e) => editar(idx, e.target.value)} disabled={!s.aplicar} />
                      </div>
                    </div>
                    {s.razon && <p className={styles.razon}>💡 {s.razon}</p>}
                  </article>
                ))}
              </div>
            )}

            <div className={styles.acciones}>
              <button className={styles.btnGhost} disabled={generando} onClick={generar}>Regenerar</button>
              {guardado ? (
                <span className={styles.guardadoMsg}>✓ Versión guardada</span>
              ) : (
                <button className={styles.btnPrimary} disabled={guardando || aplicadasCount === 0} onClick={guardarVersion}>
                  {guardando ? 'Guardando…' : `Guardar versión (${aplicadasCount})`}
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
