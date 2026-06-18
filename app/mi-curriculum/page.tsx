'use client';

// Currículum Vitae del estudiante (RF-11) — editor.
// Gestiona las 4 secciones del CV: académica (desde el perfil), experiencia,
// habilidades e idiomas, y certificaciones. Muestra un indicador de completitud
// y enlaza a la vista imprimible (/mi-curriculum/preview) para exportar a PDF.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StudentNav from '@/components/StudentNav';
import {
  obtenerMiCurriculum, calcularCompletitud, parseJsonArray, toJsonString,
  crearExperiencia, actualizarExperiencia, eliminarExperiencia,
  guardarHabilidades, crearCertificacion, actualizarCertificacion, eliminarCertificacion,
  obtenerVersionesCv, eliminarVersionCv,
} from '@/lib/curriculum';
import styles from './mi-curriculum.module.css';

interface Experiencia {
  id?: number | string; tipo: string; titulo: string; organizacion: string;
  fecha_inicio: string; fecha_fin: string; descripcion: string; bullets: string | null;
}
interface Certificacion {
  id?: number | string; nombre: string; institucion: string; fecha: string; url_verificacion: string;
}
interface Tecnica { nombre: string; nivel: string }
interface Idioma { idioma: string; nivel: string }

const TIPOS_EXP = ['práctica', 'pasantía', 'proyecto', 'voluntariado', 'empleo'];
const NIVELES_TEC = ['Básico', 'Intermedio', 'Avanzado'];
const NIVELES_IDIOMA = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];
const EXP_VACIA: Experiencia = { tipo: 'proyecto', titulo: '', organizacion: '', fecha_inicio: '', fecha_fin: '', descripcion: '', bullets: null };
const CERT_VACIA: Certificacion = { nombre: '', institucion: '', fecha: '', url_verificacion: '' };

const fmtMes = (f: string) => (f ? new Date(f + 'T00:00:00').toLocaleDateString('es-CR', { month: 'short', year: 'numeric' }) : '');

export default function MiCurriculumPage() {
  const router = useRouter();
  const { token, loading: authLoading, signOut } = useAuth();
  const [cv, setCv] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Modales de experiencia y certificación
  const [expEdit, setExpEdit] = useState<Experiencia | null>(null);
  const [certEdit, setCertEdit] = useState<Certificacion | null>(null);
  const [guardandoModal, setGuardandoModal] = useState(false);

  // Habilidades (estado editable local)
  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [blandas, setBlandas] = useState('');
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [habId, setHabId] = useState<number | string | undefined>(undefined);
  const [guardandoHab, setGuardandoHab] = useState(false);
  const [habGuardado, setHabGuardado] = useState(false);
  const [versiones, setVersiones] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !token) router.replace('/login');
  }, [authLoading, token, router]);

  async function recargar() {
    const [data, vers] = await Promise.all([
      obtenerMiCurriculum(token as string),
      obtenerVersionesCv(token as string).catch(() => []),
    ]);
    setCv(data);
    setVersiones(vers || []);
    const hab = data?.seccion3_habilidades;
    setHabId(hab?.id);
    setTecnicas(parseJsonArray(hab?.tecnicas));
    setIdiomas(parseJsonArray(hab?.idiomas));
    setBlandas(hab?.blandas || '');
  }

  async function borrarVersion(id: number | string) {
    try { await eliminarVersionCv(token as string, id); setVersiones((v) => v.filter((x) => x.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar la versión.'); }
  }

  useEffect(() => {
    if (!token) return;
    let activo = true;
    (async () => {
      try { if (activo) await recargar(); }
      catch (e) { if (activo) setError(e instanceof Error ? e.message : 'No se pudo cargar tu currículum.'); }
      finally { if (activo) setCargando(false); }
    })();
    return () => { activo = false; };
  }, [token]);

  const completitud = useMemo(() => calcularCompletitud(cv), [cv]);
  function handleSignOut() { signOut(); router.replace('/login'); }

  // ── Experiencia ──
  async function guardarExperiencia() {
    if (!expEdit || !expEdit.titulo.trim()) return;
    setGuardandoModal(true); setError('');
    const bulletsArr = (expEdit.bullets ? parseJsonArray(expEdit.bullets) : [])
      .map((b: string) => b.trim()).filter(Boolean).slice(0, 5);
    const payload = {
      tipo: expEdit.tipo, titulo: expEdit.titulo.trim(), organizacion: expEdit.organizacion.trim() || null,
      fecha_inicio: expEdit.fecha_inicio || null, fecha_fin: expEdit.fecha_fin || null,
      descripcion: expEdit.descripcion.trim() || null, bullets: toJsonString(bulletsArr),
    };
    try {
      if (expEdit.id) await actualizarExperiencia(token as string, expEdit.id, payload);
      else await crearExperiencia(token as string, payload);
      await recargar(); setExpEdit(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la experiencia.'); }
    finally { setGuardandoModal(false); }
  }
  async function borrarExperiencia(id: number | string) {
    try { await eliminarExperiencia(token as string, id); await recargar(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar.'); }
  }

  // ── Certificación ──
  async function guardarCertificacion() {
    if (!certEdit || !certEdit.nombre.trim()) return;
    setGuardandoModal(true); setError('');
    const payload = {
      nombre: certEdit.nombre.trim(), institucion: certEdit.institucion.trim() || null,
      fecha: certEdit.fecha || null, url_verificacion: certEdit.url_verificacion.trim() || null,
    };
    try {
      if (certEdit.id) await actualizarCertificacion(token as string, certEdit.id, payload);
      else await crearCertificacion(token as string, payload);
      await recargar(); setCertEdit(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la certificación.'); }
    finally { setGuardandoModal(false); }
  }
  async function borrarCertificacion(id: number | string) {
    try { await eliminarCertificacion(token as string, id); await recargar(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar.'); }
  }

  // ── Habilidades ──
  async function guardarHabilidadesBloque() {
    setGuardandoHab(true); setError(''); setHabGuardado(false);
    const payload = {
      tecnicas: toJsonString(tecnicas.filter((t) => t.nombre.trim())),
      blandas: blandas.trim() || null,
      idiomas: toJsonString(idiomas.filter((i) => i.idioma.trim())),
    };
    try {
      const guardado = await guardarHabilidades(token as string, payload, habId);
      if (guardado?.id) setHabId(guardado.id);
      setHabGuardado(true);
      setTimeout(() => setHabGuardado(false), 2500);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron guardar las habilidades.'); }
    finally { setGuardandoHab(false); }
  }

  const academica = cv?.seccion1_academica;
  const proyecto = cv?.seccion1_proyecto;
  const experiencias: Experiencia[] = cv?.seccion2_experiencias || [];
  const certificaciones: Certificacion[] = cv?.seccion4_certificaciones || [];

  return (
    <div className={styles.page}>
      <StudentNav onSignOut={handleSignOut} />

      <main className={styles.main}>
        <div className={styles.head}>
          <div>
            <h1 className={styles.titulo}>Mi currículum</h1>
            <p className={styles.subtitulo}>Construí tu CV profesional. Se usa al postularte a posiciones.</p>
          </div>
          <Link href="/mi-curriculum/preview" className={styles.cta}>Vista previa / PDF</Link>
        </div>

        {/* Indicador de completitud */}
        {!cargando && (
          <section className={styles.completitud}>
            <div className={styles.compTop}>
              <span className={styles.compLabel}>Completitud del CV</span>
              <span className={styles.compPct}>{completitud.porcentaje}%</span>
            </div>
            <div className={styles.barra}><span className={styles.barraFill} style={{ width: `${completitud.porcentaje}%` }} /></div>
            <div className={styles.compItems}>
              {completitud.items.map((i) => (
                <span key={i.clave} className={`${styles.compItem} ${i.ok ? styles.compOk : ''}`}>
                  {i.ok ? '✓' : '○'} {i.label}
                </span>
              ))}
            </div>
          </section>
        )}

        {error && <p className={styles.error}>{error}</p>}
        {cargando ? (
          <p className={styles.vacio}>Cargando tu currículum…</p>
        ) : (
          <>
            {/* Sección académica (desde el perfil) */}
            <section className={styles.seccion}>
              <div className={styles.seccionHead}>
                <h2 className={styles.seccionTitulo}>Información académica</h2>
                <Link href="/perfil-estudiante" className={styles.editarLink}>Editar en mi perfil</Link>
              </div>
              {academica ? (
                <div className={styles.academica}>
                  {academica.carne && <span><strong>Carné:</strong> {academica.carne}</span>}
                  {academica.ano_ingreso && <span><strong>Ingreso:</strong> {academica.ano_ingreso}</span>}
                  {academica.promedio_ponderado != null && <span><strong>Promedio:</strong> {academica.promedio_ponderado}</span>}
                  {academica.cursos_relevantes && <span className={styles.full}><strong>Cursos relevantes:</strong> {academica.cursos_relevantes}</span>}
                  {proyecto?.titulo_proyecto && <span className={styles.full}><strong>Proyecto:</strong> {proyecto.titulo_proyecto}</span>}
                </div>
              ) : (
                <p className={styles.placeholder}>Completá tu información académica en tu perfil para que aparezca aquí.</p>
              )}
            </section>

            {/* Experiencia */}
            <section className={styles.seccion}>
              <div className={styles.seccionHead}>
                <h2 className={styles.seccionTitulo}>Experiencia y proyectos</h2>
                <button className={styles.addBtn} onClick={() => setExpEdit({ ...EXP_VACIA })}>+ Agregar</button>
              </div>
              {experiencias.length === 0 ? (
                <p className={styles.placeholder}>Agregá prácticas, pasantías, proyectos o voluntariados.</p>
              ) : (
                <div className={styles.items}>
                  {experiencias.map((e) => {
                    const bullets = parseJsonArray(e.bullets);
                    return (
                      <div key={e.id} className={styles.item}>
                        <div className={styles.itemMain}>
                          <div className={styles.itemHead}>
                            <h3 className={styles.itemTitulo}>{e.titulo}</h3>
                            {e.tipo && <span className={styles.tipoChip}>{e.tipo}</span>}
                          </div>
                          <p className={styles.itemMeta}>
                            {[e.organizacion, [fmtMes(e.fecha_inicio), fmtMes(e.fecha_fin) || 'Actual'].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')}
                          </p>
                          {e.descripcion && <p className={styles.itemDesc}>{e.descripcion}</p>}
                          {bullets.length > 0 && (
                            <ul className={styles.bullets}>{bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}</ul>
                          )}
                        </div>
                        <div className={styles.itemAcc}>
                          <button className={styles.iconBtn} onClick={() => setExpEdit({ ...EXP_VACIA, ...e, organizacion: e.organizacion || '', descripcion: e.descripcion || '', fecha_inicio: e.fecha_inicio || '', fecha_fin: e.fecha_fin || '' })}>Editar</button>
                          <button className={styles.iconBtnDel} onClick={() => e.id && borrarExperiencia(e.id)}>Eliminar</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Habilidades e idiomas */}
            <section className={styles.seccion}>
              <div className={styles.seccionHead}>
                <h2 className={styles.seccionTitulo}>Habilidades e idiomas</h2>
                <button className={styles.addBtn} disabled={guardandoHab} onClick={guardarHabilidadesBloque}>
                  {guardandoHab ? 'Guardando…' : habGuardado ? '✓ Guardado' : 'Guardar'}
                </button>
              </div>

              <div className={styles.habGroup}>
                <label className={styles.habLabel}>Habilidades técnicas</label>
                {tecnicas.map((t, idx) => (
                  <div key={idx} className={styles.fila2}>
                    <input className={styles.input} placeholder="Ej. Python" value={t.nombre}
                      onChange={(e) => setTecnicas((a) => a.map((x, i) => i === idx ? { ...x, nombre: e.target.value } : x))} />
                    <select className={styles.input} value={t.nivel} onChange={(e) => setTecnicas((a) => a.map((x, i) => i === idx ? { ...x, nivel: e.target.value } : x))}>
                      {NIVELES_TEC.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <button className={styles.removeRow} onClick={() => setTecnicas((a) => a.filter((_, i) => i !== idx))}>✕</button>
                  </div>
                ))}
                <button className={styles.addRow} onClick={() => setTecnicas((a) => [...a, { nombre: '', nivel: 'Intermedio' }])}>+ Agregar habilidad</button>
              </div>

              <div className={styles.habGroup}>
                <label className={styles.habLabel}>Habilidades blandas</label>
                <input className={styles.input} placeholder="Ej. Trabajo en equipo, comunicación, liderazgo"
                  value={blandas} onChange={(e) => setBlandas(e.target.value)} />
              </div>

              <div className={styles.habGroup}>
                <label className={styles.habLabel}>Idiomas</label>
                {idiomas.map((it, idx) => (
                  <div key={idx} className={styles.fila2}>
                    <input className={styles.input} placeholder="Ej. Inglés" value={it.idioma}
                      onChange={(e) => setIdiomas((a) => a.map((x, i) => i === idx ? { ...x, idioma: e.target.value } : x))} />
                    <select className={styles.input} value={it.nivel} onChange={(e) => setIdiomas((a) => a.map((x, i) => i === idx ? { ...x, nivel: e.target.value } : x))}>
                      {NIVELES_IDIOMA.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <button className={styles.removeRow} onClick={() => setIdiomas((a) => a.filter((_, i) => i !== idx))}>✕</button>
                  </div>
                ))}
                <button className={styles.addRow} onClick={() => setIdiomas((a) => [...a, { idioma: '', nivel: 'Intermedio' }])}>+ Agregar idioma</button>
              </div>
            </section>

            {/* Certificaciones */}
            <section className={styles.seccion}>
              <div className={styles.seccionHead}>
                <h2 className={styles.seccionTitulo}>Certificaciones y logros</h2>
                <button className={styles.addBtn} onClick={() => setCertEdit({ ...CERT_VACIA })}>+ Agregar</button>
              </div>
              {certificaciones.length === 0 ? (
                <p className={styles.placeholder}>Agregá cursos, certificados o reconocimientos.</p>
              ) : (
                <div className={styles.items}>
                  {certificaciones.map((c) => (
                    <div key={c.id} className={styles.item}>
                      <div className={styles.itemMain}>
                        <h3 className={styles.itemTitulo}>{c.nombre}</h3>
                        <p className={styles.itemMeta}>{[c.institucion, c.fecha ? fmtMes(c.fecha) : ''].filter(Boolean).join(' · ')}</p>
                        {c.url_verificacion && <a className={styles.verLink} href={c.url_verificacion} target="_blank" rel="noreferrer">Verificar ↗</a>}
                      </div>
                      <div className={styles.itemAcc}>
                        <button className={styles.iconBtn} onClick={() => setCertEdit({ ...CERT_VACIA, ...c, institucion: c.institucion || '', fecha: c.fecha || '', url_verificacion: c.url_verificacion || '' })}>Editar</button>
                        <button className={styles.iconBtnDel} onClick={() => c.id && borrarCertificacion(c.id)}>Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Versiones adaptadas con IA (RF-12) */}
            {versiones.length > 0 && (
              <section className={styles.seccion}>
                <div className={styles.seccionHead}>
                  <h2 className={styles.seccionTitulo}>Versiones adaptadas con IA</h2>
                  <span className={styles.placeholder}>{versiones.length}/10</span>
                </div>
                <div className={styles.items}>
                  {versiones.map((v) => (
                    <div key={v.id} className={styles.item}>
                      <div className={styles.itemMain}>
                        <h3 className={styles.itemTitulo}>{v.nombre_version}</h3>
                        <p className={styles.itemMeta}>{v.puestos_empleo?.titulo_puesto || 'Posición'}{v.puestos_empleo?.empresa ? ` · ${v.puestos_empleo.empresa}` : ''}</p>
                      </div>
                      <div className={styles.itemAcc}>
                        {v.puestos_empleo?.id && <Link href={`/mi-curriculum/adaptar/${v.puestos_empleo.id}`} className={styles.iconBtn}>Readaptar</Link>}
                        <button className={styles.iconBtnDel} onClick={() => borrarVersion(v.id)}>Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Modal experiencia */}
      {expEdit && (
        <div className={styles.modalBg} onClick={() => setExpEdit(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}><span>{expEdit.id ? 'Editar' : 'Agregar'} experiencia</span><button className={styles.cerrar} onClick={() => setExpEdit(null)}>✕</button></div>
            <div className={styles.modalBody}>
              <label className={styles.campo}>Título *<input value={expEdit.titulo} onChange={(e) => setExpEdit({ ...expEdit, titulo: e.target.value })} placeholder="Ej. Práctica profesional en desarrollo web" /></label>
              <div className={styles.fila}>
                <label className={styles.campo}>Tipo
                  <select value={expEdit.tipo} onChange={(e) => setExpEdit({ ...expEdit, tipo: e.target.value })}>
                    {TIPOS_EXP.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </label>
                <label className={styles.campo}>Organización<input value={expEdit.organizacion} onChange={(e) => setExpEdit({ ...expEdit, organizacion: e.target.value })} /></label>
              </div>
              <div className={styles.fila}>
                <label className={styles.campo}>Inicio<input type="date" value={expEdit.fecha_inicio} onChange={(e) => setExpEdit({ ...expEdit, fecha_inicio: e.target.value })} /></label>
                <label className={styles.campo}>Fin (vacío = actual)<input type="date" value={expEdit.fecha_fin} onChange={(e) => setExpEdit({ ...expEdit, fecha_fin: e.target.value })} /></label>
              </div>
              <label className={styles.campo}>Descripción<textarea rows={2} value={expEdit.descripcion} onChange={(e) => setExpEdit({ ...expEdit, descripcion: e.target.value })} /></label>
              <label className={styles.campo}>Logros (uno por línea, máx 5)
                <textarea rows={3} placeholder={'Desarrollé X\nLideré Y'} value={parseJsonArray(expEdit.bullets).join('\n')}
                  onChange={(e) => setExpEdit({ ...expEdit, bullets: toJsonString(e.target.value.split('\n')) })} />
              </label>
            </div>
            <div className={styles.modalAcciones}>
              <button className={styles.btnGhost} onClick={() => setExpEdit(null)}>Cancelar</button>
              <button className={styles.btnPrimary} disabled={!expEdit.titulo.trim() || guardandoModal} onClick={guardarExperiencia}>{guardandoModal ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal certificación */}
      {certEdit && (
        <div className={styles.modalBg} onClick={() => setCertEdit(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}><span>{certEdit.id ? 'Editar' : 'Agregar'} certificación</span><button className={styles.cerrar} onClick={() => setCertEdit(null)}>✕</button></div>
            <div className={styles.modalBody}>
              <label className={styles.campo}>Nombre *<input value={certEdit.nombre} onChange={(e) => setCertEdit({ ...certEdit, nombre: e.target.value })} placeholder="Ej. Scrum Fundamentals" /></label>
              <label className={styles.campo}>Institución<input value={certEdit.institucion} onChange={(e) => setCertEdit({ ...certEdit, institucion: e.target.value })} /></label>
              <div className={styles.fila}>
                <label className={styles.campo}>Fecha<input type="date" value={certEdit.fecha} onChange={(e) => setCertEdit({ ...certEdit, fecha: e.target.value })} /></label>
                <label className={styles.campo}>URL de verificación<input type="url" value={certEdit.url_verificacion} onChange={(e) => setCertEdit({ ...certEdit, url_verificacion: e.target.value })} /></label>
              </div>
            </div>
            <div className={styles.modalAcciones}>
              <button className={styles.btnGhost} onClick={() => setCertEdit(null)}>Cancelar</button>
              <button className={styles.btnPrimary} disabled={!certEdit.nombre.trim() || guardandoModal} onClick={guardarCertificacion}>{guardandoModal ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
