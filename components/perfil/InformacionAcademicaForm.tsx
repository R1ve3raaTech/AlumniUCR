'use client';

// Formulario de las Secciones 1 (Información Académica) y 2 (Situación
// Socioeconómica) del perfil de estudiante, RF-03. Crea/actualiza la fila del
// estudiante en informacion_estudiante (carné, año de ingreso, nivel
// académico, promedio, beca) y su relación carrera/sede/año de graduación en
// carreras_usuario. Este registro es requisito (FK) para las Secciones 3 y 4.

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  obtenerFacultades,
  obtenerCarreras,
  obtenerSedesUcr,
  obtenerNivelesAcademicos,
  obtenerBecasSocioeconomicas,
  obtenerInformacionEstudiante,
  guardarInformacionEstudiante,
  obtenerCarreraDelEstudiante,
  guardarCarreraEstudiante,
} from '@/lib/perfilAcademico';
import {
  validarCarneUCR,
  validarAnoIngreso,
  validarPromedioPonderado,
  validarAnoGraduacion,
} from '@/lib/validaciones';
import styles from './perfil.module.css';

interface OpcionCatalogo {
  id: number | string;
  nombre: string;
}

interface Carrera extends OpcionCatalogo {
  id_facultad: number | string;
}

interface ErroresFormulario {
  carne?: string;
  facultad?: string;
  carrera?: string;
  sede?: string;
  anoIngreso?: string;
  nivelAcademico?: string;
  promedio?: string;
  anoGraduacion?: string;
  apoyo?: string;
}

interface InformacionAcademicaFormProps {
  onGuardado?: () => void;
}

export default function InformacionAcademicaForm({ onGuardado }: InformacionAcademicaFormProps) {
  const { token, user } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const [facultades, setFacultades] = useState<OpcionCatalogo[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [sedes, setSedes] = useState<OpcionCatalogo[]>([]);
  const [niveles, setNiveles] = useState<OpcionCatalogo[]>([]);
  const [becas, setBecas] = useState<OpcionCatalogo[]>([]);

  const [informacionExiste, setInformacionExiste] = useState(false);
  const [relacionCarrera, setRelacionCarrera] = useState<{ id: number | string } | null>(null);

  const [carne, setCarne] = useState('');
  const [idFacultad, setIdFacultad] = useState('');
  const [idCarrera, setIdCarrera] = useState('');
  const [idSede, setIdSede] = useState('');
  const [anoIngreso, setAnoIngreso] = useState('');
  const [idNivelAcademico, setIdNivelAcademico] = useState('');
  const [promedioPonderado, setPromedioPonderado] = useState('');
  const [anoGraduacion, setAnoGraduacion] = useState('');
  const [idBeca, setIdBeca] = useState('');
  const [buscaFinanciamiento, setBuscaFinanciamiento] = useState(false);
  const [buscaMentoria, setBuscaMentoria] = useState(false);
  const [buscaEmpleo, setBuscaEmpleo] = useState(false);
  const [buscaPasantia, setBuscaPasantia] = useState(false);
  const [pausado, setPausado] = useState(false);

  const [errores, setErrores] = useState<ErroresFormulario>({});

  const carrerasFiltradas = carreras.filter((c) => String(c.id_facultad) === idFacultad);

  useEffect(() => {
    if (!token || !user?.id) return;
    let activo = true;

    (async () => {
      try {
        const [facultadesCat, carrerasCat, sedesCat, nivelesCat, becasCat, informacion] =
          await Promise.all([
            obtenerFacultades(token),
            obtenerCarreras(token),
            obtenerSedesUcr(token),
            obtenerNivelesAcademicos(token),
            obtenerBecasSocioeconomicas(token),
            obtenerInformacionEstudiante(token, user.id),
          ]);
        if (!activo) return;

        setFacultades(facultadesCat ?? []);
        setCarreras(carrerasCat ?? []);
        setSedes(sedesCat ?? []);
        setNiveles(nivelesCat ?? []);
        setBecas(becasCat ?? []);

        if (informacion) {
          setInformacionExiste(true);
          setCarne(informacion.carne ?? '');
          setAnoIngreso(
            informacion.ano_ingreso != null ? String(informacion.ano_ingreso) : '',
          );
          setIdNivelAcademico(
            informacion.id_nivel_academico != null ? String(informacion.id_nivel_academico) : '',
          );
          setPromedioPonderado(
            informacion.promedio_ponderado != null ? String(informacion.promedio_ponderado) : '',
          );
          setIdBeca(informacion.id_beca != null ? String(informacion.id_beca) : '');
          setBuscaFinanciamiento(Boolean(informacion.busca_financiamiento));
          setBuscaMentoria(Boolean(informacion.busca_mentoria));
          setBuscaEmpleo(Boolean(informacion.busca_empleo));
          setBuscaPasantia(Boolean(informacion.busca_pasantia));
          setPausado(Boolean(informacion.pausado));

          const carreraRelacion = await obtenerCarreraDelEstudiante(token, user.id);
          if (!activo) return;
          if (carreraRelacion) {
            setRelacionCarrera({ id: carreraRelacion.id });
            setIdCarrera(String(carreraRelacion.id_carrera));
            setIdSede(String(carreraRelacion.id_sede));
            setAnoGraduacion(
              carreraRelacion.ano_graduacion != null ? String(carreraRelacion.ano_graduacion) : '',
            );

            const carreraSeleccionada = (carrerasCat ?? []).find(
              (c: Carrera) => String(c.id) === String(carreraRelacion.id_carrera),
            );
            if (carreraSeleccionada) {
              setIdFacultad(String(carreraSeleccionada.id_facultad));
            }
          }
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

  function handleFacultadChange(valor: string) {
    setIdFacultad(valor);
    // Si la carrera elegida ya no pertenece a la nueva facultad, se limpia.
    const sigueValida = carreras.some(
      (c) => String(c.id_facultad) === valor && String(c.id) === idCarrera,
    );
    if (!sigueValida) setIdCarrera('');
    if (errores.facultad) setErrores((e) => ({ ...e, facultad: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user?.id) return;

    const nuevosErrores: ErroresFormulario = {
      carne: validarCarneUCR(carne) ?? undefined,
      facultad: idFacultad ? undefined : 'Selecciona tu escuela o facultad.',
      carrera: idCarrera ? undefined : 'Selecciona tu carrera.',
      sede: idSede ? undefined : 'Selecciona tu sede UCR.',
      anoIngreso: validarAnoIngreso(anoIngreso) ?? undefined,
      nivelAcademico: idNivelAcademico ? undefined : 'Selecciona tu nivel académico.',
      promedio: validarPromedioPonderado(promedioPonderado) ?? undefined,
      anoGraduacion: validarAnoGraduacion(anoGraduacion) ?? undefined,
      apoyo:
        buscaFinanciamiento || buscaMentoria || buscaEmpleo || buscaPasantia
          ? undefined
          : 'Selecciona al menos un tipo de apoyo buscado.',
    };
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    setGuardando(true);
    setError(null);
    setExito(false);
    try {
      await guardarInformacionEstudiante(
        token,
        {
          id_usuario: user.id,
          carne: carne.trim(),
          ano_ingreso: Number(anoIngreso),
          id_nivel_academico: Number(idNivelAcademico),
          promedio_ponderado: promedioPonderado ? Number(promedioPonderado) : null,
          id_beca: idBeca ? Number(idBeca) : null,
          busca_financiamiento: buscaFinanciamiento,
          busca_mentoria: buscaMentoria,
          busca_empleo: buscaEmpleo,
          busca_pasantia: buscaPasantia,
          pausado,
        },
        informacionExiste,
      );
      setInformacionExiste(true);

      const carreraGuardada = await guardarCarreraEstudiante(
        token,
        {
          id_usuario: user.id,
          id_carrera: Number(idCarrera),
          id_sede: Number(idSede),
          ano_graduacion: Number(anoGraduacion),
        },
        relacionCarrera,
      );
      if (carreraGuardada?.id) setRelacionCarrera({ id: carreraGuardada.id });

      setExito(true);
      onGuardado?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la información académica.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className={styles.cargando}>Cargando información académica…</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error && <div className={styles.formError}>{error}</div>}
      {exito && <div className={styles.formExito}>Información académica guardada correctamente.</div>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="carne" className={styles.label}>
            Carné UCR
          </label>
          <input
            id="carne"
            className={`${styles.input} ${errores.carne ? styles.inputError : ''}`}
            value={carne}
            maxLength={10}
            onChange={(e) => {
              setCarne(e.target.value);
              if (errores.carne) setErrores((er) => ({ ...er, carne: undefined }));
            }}
            placeholder="Ej. B12345"
            required
          />
          {errores.carne && <span className={styles.fieldError}>{errores.carne}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="anoIngreso" className={styles.label}>
            Año de ingreso
          </label>
          <input
            id="anoIngreso"
            type="number"
            className={`${styles.input} ${errores.anoIngreso ? styles.inputError : ''}`}
            value={anoIngreso}
            onChange={(e) => {
              setAnoIngreso(e.target.value);
              if (errores.anoIngreso) setErrores((er) => ({ ...er, anoIngreso: undefined }));
            }}
            required
          />
          {errores.anoIngreso && <span className={styles.fieldError}>{errores.anoIngreso}</span>}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="facultad" className={styles.label}>
            Escuela / Facultad
          </label>
          <select
            id="facultad"
            className={`${styles.select} ${errores.facultad ? styles.inputError : ''}`}
            value={idFacultad}
            onChange={(e) => handleFacultadChange(e.target.value)}
            required
          >
            <option value="">Selecciona una facultad</option>
            {facultades.map((facultad) => (
              <option key={facultad.id} value={facultad.id}>
                {facultad.nombre}
              </option>
            ))}
          </select>
          {errores.facultad && <span className={styles.fieldError}>{errores.facultad}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="carrera" className={styles.label}>
            Carrera
          </label>
          <select
            id="carrera"
            className={`${styles.select} ${errores.carrera ? styles.inputError : ''}`}
            value={idCarrera}
            onChange={(e) => {
              setIdCarrera(e.target.value);
              if (errores.carrera) setErrores((er) => ({ ...er, carrera: undefined }));
            }}
            disabled={!idFacultad}
            required
          >
            <option value="">
              {idFacultad ? 'Selecciona una carrera' : 'Primero selecciona una facultad'}
            </option>
            {carrerasFiltradas.map((carrera) => (
              <option key={carrera.id} value={carrera.id}>
                {carrera.nombre}
              </option>
            ))}
          </select>
          {errores.carrera && <span className={styles.fieldError}>{errores.carrera}</span>}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="sede" className={styles.label}>
            Sede UCR
          </label>
          <select
            id="sede"
            className={`${styles.select} ${errores.sede ? styles.inputError : ''}`}
            value={idSede}
            onChange={(e) => {
              setIdSede(e.target.value);
              if (errores.sede) setErrores((er) => ({ ...er, sede: undefined }));
            }}
            required
          >
            <option value="">Selecciona una sede</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
          {errores.sede && <span className={styles.fieldError}>{errores.sede}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="nivelAcademico" className={styles.label}>
            Nivel académico
          </label>
          <select
            id="nivelAcademico"
            className={`${styles.select} ${errores.nivelAcademico ? styles.inputError : ''}`}
            value={idNivelAcademico}
            onChange={(e) => {
              setIdNivelAcademico(e.target.value);
              if (errores.nivelAcademico) setErrores((er) => ({ ...er, nivelAcademico: undefined }));
            }}
            required
          >
            <option value="">Selecciona un nivel</option>
            {niveles.map((nivel) => (
              <option key={nivel.id} value={nivel.id}>
                {nivel.nombre}
              </option>
            ))}
          </select>
          {errores.nivelAcademico && (
            <span className={styles.fieldError}>{errores.nivelAcademico}</span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="promedio" className={styles.label}>
            Promedio ponderado
          </label>
          <input
            id="promedio"
            type="number"
            step="0.01"
            min={0}
            max={100}
            className={`${styles.input} ${errores.promedio ? styles.inputError : ''}`}
            value={promedioPonderado}
            onChange={(e) => {
              setPromedioPonderado(e.target.value);
              if (errores.promedio) setErrores((er) => ({ ...er, promedio: undefined }));
            }}
            placeholder="Opcional"
          />
          <span className={styles.ayuda}>
            Privado: solo se usa para matching avanzado, no aparece en tu perfil público.
          </span>
          {errores.promedio && <span className={styles.fieldError}>{errores.promedio}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="anoGraduacion" className={styles.label}>
            Año esperado de graduación
          </label>
          <input
            id="anoGraduacion"
            type="number"
            className={`${styles.input} ${errores.anoGraduacion ? styles.inputError : ''}`}
            value={anoGraduacion}
            onChange={(e) => {
              setAnoGraduacion(e.target.value);
              if (errores.anoGraduacion) setErrores((er) => ({ ...er, anoGraduacion: undefined }));
            }}
            required
          />
          {errores.anoGraduacion && (
            <span className={styles.fieldError}>{errores.anoGraduacion}</span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="beca" className={styles.label}>
          Nivel de beca socioeconómica
        </label>
        <select
          id="beca"
          className={styles.select}
          value={idBeca}
          onChange={(e) => setIdBeca(e.target.value)}
        >
          <option value="">Sin beca / no indicar</option>
          {becas.map((beca) => (
            <option key={beca.id} value={beca.id}>
              {beca.nombre}
            </option>
          ))}
        </select>
        <span className={styles.ayuda}>
          Privado: no se muestra en tu perfil público ni en el directorio. Solo se revela a un
          exalumno cuando aceptas su solicitud de contacto.
        </span>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Tipo de apoyo buscado</span>
        <span className={styles.ayuda}>Selecciona al menos una opción.</span>
        <div className={styles.checkboxGrid}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={buscaFinanciamiento}
              onChange={(e) => {
                setBuscaFinanciamiento(e.target.checked);
                if (errores.apoyo) setErrores((er) => ({ ...er, apoyo: undefined }));
              }}
            />
            Financiamiento económico
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={buscaMentoria}
              onChange={(e) => {
                setBuscaMentoria(e.target.checked);
                if (errores.apoyo) setErrores((er) => ({ ...er, apoyo: undefined }));
              }}
            />
            Mentoría técnica
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={buscaEmpleo}
              onChange={(e) => {
                setBuscaEmpleo(e.target.checked);
                if (errores.apoyo) setErrores((er) => ({ ...er, apoyo: undefined }));
              }}
            />
            Empleo mientras estudia
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={buscaPasantia}
              onChange={(e) => {
                setBuscaPasantia(e.target.checked);
                if (errores.apoyo) setErrores((er) => ({ ...er, apoyo: undefined }));
              }}
            />
            Pasantía relacionada
          </label>
        </div>
        {errores.apoyo && <span className={styles.fieldError}>{errores.apoyo}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxOption}>
          <input
            type="checkbox"
            checked={pausado}
            onChange={(e) => setPausado(e.target.checked)}
          />
          Pausar mi perfil temporalmente (no recibir contactos)
        </label>
      </div>

      <button type="submit" className={`btn-primary ${styles.submit}`} disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar información académica'}
      </button>
    </form>
  );
}
