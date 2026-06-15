'use client';

// Formulario de la Sección 6 (Habilidades) del perfil de estudiante, RF-03.
// Guarda las habilidades técnicas como una lista de etiquetas (tags) en la
// tabla habilidades_estudiante (campo "tecnicas", texto separado por comas).

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { obtenerHabilidadesDelEstudiante, guardarHabilidades } from '@/lib/habilidades';
import styles from './perfil.module.css';

export default function HabilidadesForm({ onGuardado }: { onGuardado?: () => void }) {
  const { token, user } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const [idHabilidad, setIdHabilidad] = useState<number | string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [entrada, setEntrada] = useState('');

  useEffect(() => {
    if (!token || !user?.id) return;
    let activo = true;

    obtenerHabilidadesDelEstudiante(token, user.id)
      .then((registro) => {
        if (!activo) return;
        if (registro) {
          setIdHabilidad(registro.id);
          const tecnicas = (registro.tecnicas ?? '')
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean);
          setTags(tecnicas);
        }
      })
      .catch((err) => {
        if (activo) setError(err instanceof Error ? err.message : 'No se pudo cargar la información.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [token, user?.id]);

  function agregarTag() {
    const valor = entrada.trim();
    if (!valor) return;
    if (!tags.includes(valor)) {
      setTags((prev) => [...prev, valor]);
    }
    setEntrada('');
  }

  function quitarTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      agregarTag();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user?.id) return;

    // Incluye lo que esté escrito en el campo aunque no se haya confirmado
    // con Enter/coma (p. ej. si el usuario hace clic directo en "Guardar").
    const pendiente = entrada.trim();
    const tagsFinales =
      pendiente && !tags.includes(pendiente) ? [...tags, pendiente] : tags;

    // Campo opcional: si no hay registro previo ni etiquetas, no hay nada que guardar.
    if (!idHabilidad && tagsFinales.length === 0) {
      setExito(true);
      setError(null);
      return;
    }

    setGuardando(true);
    setError(null);
    setExito(false);
    try {
      const guardado = await guardarHabilidades(
        token,
        {
          id_usuario: user.id,
          tecnicas: tagsFinales.join(', '),
        },
        idHabilidad,
      );
      if (guardado?.id) setIdHabilidad(guardado.id);
      setTags(tagsFinales);
      setEntrada('');
      setExito(true);
      onGuardado?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar tus habilidades.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className={styles.cargando}>Cargando habilidades…</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <div className={styles.formError}>{error}</div>}
      {exito && <div className={styles.formExito}>Habilidades guardadas correctamente.</div>}

      <div className={styles.field}>
        <label htmlFor="habilidades" className={styles.label}>
          Habilidades técnicas
        </label>
        <input
          id="habilidades"
          className={styles.input}
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={agregarTag}
          placeholder="Ej. Python (Enter o coma para agregar)"
        />
        <span className={styles.ayuda}>
          Opcional. Ej: Python, AutoCAD, SPSS, diseño UX.
        </span>
        {tags.length > 0 && (
          <div className={styles.checkboxGrid}>
            {tags.map((tag) => (
              <span key={tag} className={styles.checkboxOption}>
                {tag}
                <button
                  type="button"
                  onClick={() => quitarTag(tag)}
                  aria-label={`Quitar ${tag}`}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className={`btn-primary ${styles.submit}`} disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar habilidades'}
      </button>
    </form>
  );
}
