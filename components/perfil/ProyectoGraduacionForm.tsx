'use client';

// Formulario de la Sección 3 (Proyecto de Graduación) del perfil de estudiante,
// RF-03. Carga los catálogos (tipos de proyecto, áreas temáticas, necesidades
// específicas), precarga el proyecto del estudiante si ya existe, y guarda los
// cambios contra el backend (tablas proyecto_graduacion, areas_interes_proyecto
// y proyecto_necesidades en Supabase).

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  obtenerTiposProyecto,
  obtenerAreasInteres,
  obtenerNecesidadesEspecificas,
  obtenerProyectoDelEstudiante,
  guardarProyectoGraduacion,
  obtenerAreasDelProyecto,
  agregarAreaInteresProyecto,
  obtenerNecesidadesDelProyecto,
  agregarNecesidadProyecto,
} from '@/lib/proyectoGraduacion';
import {
  validarTituloProyecto,
  validarDescripcionProyecto,
  validarPorcentajeAvance,
} from '@/lib/validaciones';
import styles from './proyectoGraduacion.module.css';

interface OpcionCatalogo {
  id: number | string;
  nombre: string;
}

interface ErroresFormulario {
  titulo?: string;
  descripcion?: string;
  areas?: string;
  tipo?: string;
  porcentaje?: string;
  necesidades?: string;
}

export default function ProyectoGraduacionForm() {
  const { token, user } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const [tiposProyecto, setTiposProyecto] = useState<OpcionCatalogo[]>([]);
  const [areasInteres, setAreasInteres] = useState<OpcionCatalogo[]>([]);
  const [necesidades, setNecesidades] = useState<OpcionCatalogo[]>([]);

  // IDs de los registros ya guardados, para saber si hay que crear o actualizar.
  const [idProyecto, setIdProyecto] = useState<number | string | null>(null);
  const [areasGuardadas, setAreasGuardadas] = useState<Set<string>>(new Set());
  const [necesidadesGuardadas, setNecesidadesGuardadas] = useState<Set<string>>(new Set());

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<Set<string>>(new Set());
  const [idTipoProyecto, setIdTipoProyecto] = useState('');
  const [porcentajeAvance, setPorcentajeAvance] = useState('0');
  const [proyectoFinalizado, setProyectoFinalizado] = useState(false);
  const [necesidadesSeleccionadas, setNecesidadesSeleccionadas] = useState<Set<string>>(new Set());

  const [errores, setErrores] = useState<ErroresFormulario>({});

  // Carga catálogos y, si ya existe, el proyecto del estudiante autenticado.
  useEffect(() => {
    if (!token || !user?.id) return;
    let activo = true;

    (async () => {
      try {
        const [tipos, areas, catalogoNecesidades, proyecto] = await Promise.all([
          obtenerTiposProyecto(token),
          obtenerAreasInteres(token),
          obtenerNecesidadesEspecificas(token),
          obtenerProyectoDelEstudiante(token, user.id),
        ]);
        if (!activo) return;

        setTiposProyecto(tipos ?? []);
        setAreasInteres(areas ?? []);
        setNecesidades(catalogoNecesidades ?? []);

        if (proyecto) {
          setIdProyecto(proyecto.id);
          setTitulo(proyecto.titulo_proyecto ?? '');
          setDescripcion(proyecto.descripcion ?? '');
          setIdTipoProyecto(
            proyecto.id_tipo_proyecto != null ? String(proyecto.id_tipo_proyecto) : '',
          );
          setPorcentajeAvance(
            proyecto.porcentaje_avance != null ? String(proyecto.porcentaje_avance) : '0',
          );
          setProyectoFinalizado(Boolean(proyecto.proyecto_finalizado));

          const [areasProyecto, necesidadesProyecto] = await Promise.all([
            obtenerAreasDelProyecto(token, proyecto.id),
            obtenerNecesidadesDelProyecto(token, proyecto.id),
          ]);
          if (!activo) return;

          const idsAreas = new Set<string>(
            (areasProyecto ?? []).map((rel: { id_area_tematica: number | string }) =>
              String(rel.id_area_tematica),
            ),
          );
          setAreasGuardadas(idsAreas);
          setAreasSeleccionadas(new Set(idsAreas));

          const idsGuardados = new Set<string>(
            (necesidadesProyecto ?? []).map((rel: { id_necesidad: number | string }) =>
              String(rel.id_necesidad),
            ),
          );
          setNecesidadesGuardadas(idsGuardados);
          setNecesidadesSeleccionadas(new Set(idsGuardados));
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la información.');
        }
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [token, user?.id]);

  function alternarNecesidad(id: string) {
    setNecesidadesSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (errores.necesidades) setErrores((e) => ({ ...e, necesidades: undefined }));
  }

  function alternarArea(id: string) {
    setAreasSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (errores.areas) setErrores((e) => ({ ...e, areas: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user?.id) return;

    const nuevosErrores: ErroresFormulario = {
      titulo: validarTituloProyecto(titulo) ?? undefined,
      descripcion: validarDescripcionProyecto(descripcion) ?? undefined,
      areas: areasSeleccionadas.size > 0 ? undefined : 'Selecciona al menos un área de interés.',
      tipo: idTipoProyecto ? undefined : 'Selecciona el tipo de proyecto.',
      porcentaje: validarPorcentajeAvance(porcentajeAvance) ?? undefined,
      necesidades:
        necesidadesSeleccionadas.size > 0
          ? undefined
          : 'Selecciona al menos una necesidad específica.',
    };
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    const porcentaje = Number(porcentajeAvance);

    // Criterio de aceptación: si el avance llega a 100%, se pregunta si se
    // desea marcar el proyecto como finalizado (no se asume automáticamente).
    let finalizado = proyectoFinalizado;
    if (porcentaje >= 100 && !proyectoFinalizado) {
      finalizado = window.confirm(
        'Tu proyecto llegó al 100% de avance. ¿Deseas marcarlo como finalizado?',
      );
      setProyectoFinalizado(finalizado);
    } else if (porcentaje < 100 && proyectoFinalizado) {
      finalizado = false;
      setProyectoFinalizado(false);
    }

    setGuardando(true);
    setError(null);
    setExito(false);
    try {
      const proyectoGuardado = await guardarProyectoGraduacion(
        token,
        {
          id_estudiante: user.id,
          titulo_proyecto: titulo.trim(),
          descripcion: descripcion.trim(),
          id_tipo_proyecto: Number(idTipoProyecto),
          porcentaje_avance: porcentaje,
          proyecto_finalizado: finalizado,
        },
        idProyecto,
      );

      const idProyectoActual = proyectoGuardado?.id ?? idProyecto;
      if (!idProyectoActual) {
        throw new Error('No se pudo determinar el proyecto guardado.');
      }
      setIdProyecto(idProyectoActual);

      const areasNuevas = Array.from(areasSeleccionadas).filter(
        (id) => !areasGuardadas.has(id),
      );
      for (const idArea of areasNuevas) {
        await agregarAreaInteresProyecto(token, idProyectoActual, Number(idArea));
      }
      setAreasGuardadas(new Set(areasSeleccionadas));

      const necesidadesNuevas = Array.from(necesidadesSeleccionadas).filter(
        (id) => !necesidadesGuardadas.has(id),
      );
      for (const idNecesidad of necesidadesNuevas) {
        await agregarNecesidadProyecto(token, idProyectoActual, Number(idNecesidad));
      }
      setNecesidadesGuardadas(new Set(necesidadesSeleccionadas));

      setExito(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el proyecto.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className={styles.cargando}>Cargando datos del proyecto…</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <div className={styles.formError}>{error}</div>}
      {exito && <div className={styles.formExito}>Proyecto guardado correctamente.</div>}

      <div className={styles.field}>
        <label htmlFor="titulo" className={styles.label}>
          Título del proyecto
        </label>
        <input
          id="titulo"
          className={`${styles.input} ${errores.titulo ? styles.inputError : ''}`}
          value={titulo}
          maxLength={200}
          onChange={(e) => {
            setTitulo(e.target.value);
            if (errores.titulo) setErrores((er) => ({ ...er, titulo: undefined }));
          }}
          placeholder="Ej. Sistema de gestión de prácticas profesionales"
          required
        />
        {errores.titulo && <span className={styles.fieldError}>{errores.titulo}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="descripcion" className={styles.label}>
          Descripción del proyecto
        </label>
        <textarea
          id="descripcion"
          className={`${styles.textarea} ${errores.descripcion ? styles.inputError : ''}`}
          value={descripcion}
          maxLength={1000}
          rows={5}
          onChange={(e) => {
            setDescripcion(e.target.value);
            if (errores.descripcion) setErrores((er) => ({ ...er, descripcion: undefined }));
          }}
          placeholder="Describe brevemente el objetivo y alcance del proyecto."
          required
        />
        <span className={styles.contador}>{descripcion.length}/1000</span>
        {errores.descripcion && <span className={styles.fieldError}>{errores.descripcion}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="tipoProyecto" className={styles.label}>
          Tipo de proyecto
        </label>
        <select
          id="tipoProyecto"
          className={`${styles.select} ${errores.tipo ? styles.inputError : ''}`}
          value={idTipoProyecto}
          onChange={(e) => {
            setIdTipoProyecto(e.target.value);
            if (errores.tipo) setErrores((er) => ({ ...er, tipo: undefined }));
          }}
          required
        >
          <option value="">Selecciona un tipo</option>
          {tiposProyecto.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
        {errores.tipo && <span className={styles.fieldError}>{errores.tipo}</span>}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Áreas de interés del proyecto</span>
        <span className={styles.ayuda}>
          Selecciona todas las áreas relacionadas con tu proyecto (mínimo 1). Esto permite
          encontrar colaboradores de otras disciplinas.
        </span>
        <div className={styles.checkboxGrid}>
          {areasInteres.map((area) => (
            <label key={area.id} className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={areasSeleccionadas.has(String(area.id))}
                onChange={() => alternarArea(String(area.id))}
              />
              {area.nombre}
            </label>
          ))}
        </div>
        {errores.areas && <span className={styles.fieldError}>{errores.areas}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="porcentaje" className={styles.label}>
          Porcentaje de avance
        </label>
        <input
          id="porcentaje"
          type="number"
          min={0}
          max={100}
          className={`${styles.input} ${errores.porcentaje ? styles.inputError : ''}`}
          value={porcentajeAvance}
          onChange={(e) => {
            setPorcentajeAvance(e.target.value);
            if (errores.porcentaje) setErrores((er) => ({ ...er, porcentaje: undefined }));
          }}
          required
        />
        {errores.porcentaje && <span className={styles.fieldError}>{errores.porcentaje}</span>}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Necesidades específicas</span>
        <div className={styles.checkboxGrid}>
          {necesidades.map((necesidad) => (
            <label key={necesidad.id} className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={necesidadesSeleccionadas.has(String(necesidad.id))}
                onChange={() => alternarNecesidad(String(necesidad.id))}
              />
              {necesidad.nombre}
            </label>
          ))}
        </div>
        {errores.necesidades && <span className={styles.fieldError}>{errores.necesidades}</span>}
      </div>

      <button type="submit" className={`btn-primary ${styles.submit}`} disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar proyecto de graduación'}
      </button>
    </form>
  );
}
