'use client';

// Perfil de Exalumno (RF-02): 5 secciones, validaciones, campos condicionales,
// indicador de % de completitud y guardado. Diseño de marca; estilos en
// perfil-exalumno.module.css.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRequireRole } from '@/lib/useRequireRole';
import AlumniLogo from '@/components/AlumniLogo';
import {
  obtenerCatalogos,
  obtenerMiPerfilExalumno,
  guardarMiPerfilExalumno,
} from '@/lib/perfilExalumno';
import styles from './perfil-exalumno.module.css';

const ANIO_ACTUAL = new Date().getFullYear();
const MONEDAS = ['CRC', 'USD'];
const FOTO_MAX_BYTES = 2 * 1024 * 1024;
const FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

interface Cat { id: number; nombre: string; id_facultad?: number }
type Form = {
  foto_perfil: string;
  pais: string; ciudad: string; url_linkedin: string; biografia: string;
  escuela_facultad: string; anio_graduacion: string | number;
  carreras: number[];
  empresa: string; cargo: string; anos_experiencia: string | number; sectores: number[];
  areas: number[];
  ofrece_mentoria: boolean; horas_disponibles_mes: string | number;
  ofrece_empleo: boolean; ofrece_pasantia: boolean; ofrece_colaboracion: boolean;
  ofrece_donacion: boolean; monto_maximo_donacion: string | number; moneda: string;
};

const VACIO: Form = {
  foto_perfil: '', pais: '', ciudad: '', url_linkedin: '', biografia: '',
  escuela_facultad: '', anio_graduacion: '', carreras: [],
  empresa: '', cargo: '', anos_experiencia: '', sectores: [],
  areas: [],
  ofrece_mentoria: false, horas_disponibles_mes: '',
  ofrece_empleo: false, ofrece_pasantia: false, ofrece_colaboracion: false,
  ofrece_donacion: false, monto_maximo_donacion: '', moneda: 'CRC',
};

export default function PerfilExalumnoPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const { verificando, autorizado } = useRequireRole(['exalumno']);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [catalogos, setCatalogos] = useState<{ sectores: Cat[]; areas: Cat[]; facultades: Cat[]; carreras: Cat[] }>({ sectores: [], areas: [], facultades: [], carreras: [] });
  const [form, setForm] = useState<Form>(VACIO);

  useEffect(() => {
    if (!token || !autorizado) return;
    let activo = true;
    (async () => {
      try {
        const [cat, perfil] = await Promise.all([
          obtenerCatalogos(token),
          obtenerMiPerfilExalumno(token),
        ]);
        if (!activo) return;
        setCatalogos(cat.data);
        const p = perfil.data.perfil;
        setForm({ ...VACIO, ...p });
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudo cargar el perfil.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [token, autorizado]);

  const set = <K extends keyof Form>(campo: K, valor: Form[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setOk(false);
  };
  const toggleEn = (campo: 'carreras' | 'sectores' | 'areas', id: number) =>
    setForm((f) => ({ ...f, [campo]: f[campo].includes(id) ? f[campo].filter((x) => x !== id) : [...f[campo], id] }));

  // Facultad seleccionada (por nombre) → filtra las carreras de esa facultad.
  const facultadId = useMemo(
    () => catalogos.facultades.find((f) => f.nombre === form.escuela_facultad)?.id ?? null,
    [catalogos.facultades, form.escuela_facultad],
  );
  const carrerasDeFacultad = useMemo(
    () => (facultadId ? catalogos.carreras.filter((c) => c.id_facultad === facultadId) : catalogos.carreras),
    [catalogos.carreras, facultadId],
  );

  // Cálculo de completitud en vivo (espejo de las reglas del backend).
  const completitud = useMemo(() => {
    const req: boolean[] = [];
    const t = (v: unknown) => typeof v === 'string' && v.trim() !== '';
    req.push(t(form.pais), t(form.ciudad), t(form.url_linkedin), t(form.biografia));
    req.push(form.carreras.length > 0, t(form.escuela_facultad), !!form.anio_graduacion);
    req.push(t(form.empresa), t(form.cargo), form.sectores.length > 0, form.anos_experiencia !== '');
    req.push(form.areas.length > 0);
    if (form.ofrece_mentoria) req.push(Number(form.horas_disponibles_mes) > 0);
    if (form.ofrece_donacion) req.push(Number(form.monto_maximo_donacion) > 0 && !!form.moneda);
    const total = req.length;
    const hechos = req.filter(Boolean).length;
    return Math.round((hechos / total) * 100);
  }, [form]);

  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!FOTO_TIPOS.includes(file.type)) { setError('La foto debe ser JPG, PNG o WEBP.'); return; }
    if (file.size > FOTO_MAX_BYTES) { setError('La foto no puede superar los 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setError(null); set('foto_perfil', String(reader.result)); };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    (async () => {
      try {
        const res = await guardarMiPerfilExalumno(token as string, {
          ...form,
          anio_graduacion: Number(form.anio_graduacion),
          anos_experiencia: Number(form.anos_experiencia),
          horas_disponibles_mes: form.horas_disponibles_mes === '' ? null : Number(form.horas_disponibles_mes),
          monto_maximo_donacion: form.monto_maximo_donacion === '' ? null : Number(form.monto_maximo_donacion),
        });
        setForm({ ...VACIO, ...res.data.perfil });
        setOk(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil.');
      } finally {
        setGuardando(false);
      }
    })();
  }

  if (authLoading || verificando || !autorizado || cargando) {
    return <div className={styles.cargando}>Cargando tu perfil…</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <Link href="/dashboard" className={styles.back}>Volver al panel</Link>
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.tag}>Perfil de Exalumno</span>
          <h1 className={styles.title}>Completa tu perfil</h1>
          <p className={styles.subtitle}>
            Tu perfil aparece en el directorio solo cuando está al 100%. Puedes editar
            cualquier campo en cualquier momento.
          </p>

          {/* Indicador de progreso */}
          <div className={styles.progresoWrap}>
            <div className={styles.progresoHead}>
              <span>Progreso del perfil</span>
              <strong>{completitud}%</strong>
            </div>
            <div className={styles.progresoBar}>
              <span className={styles.progresoFill} style={{ width: `${completitud}%` }} />
            </div>
            <p className={styles.progresoNota}>
              {completitud === 100
                ? '✓ Perfil completo: ya apareces en el directorio.'
                : 'Completa los campos obligatorios para llegar al 100% y aparecer en el directorio.'}
            </p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.formError}>{error}</div>}
          {ok && <div className={styles.formOk}>✓ Tu perfil fue guardado correctamente.</div>}

          {/* ── Sección 1: Información Personal ── */}
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>1 · Información personal</h2>
            <div className={styles.grid}>
              <div className={`${styles.campo} ${styles.full}`}>
                <label className={styles.label}>Foto de perfil <span className={styles.opcional}>(opcional · JPG/PNG/WEBP, máx 2MB)</span></label>
                <div className={styles.fotoRow}>
                  {form.foto_perfil
                    ? <img src={form.foto_perfil} alt="Foto de perfil" className={styles.fotoPrev} />
                    : <span className={styles.fotoPlaceholder} aria-hidden>—</span>}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFoto} className={styles.file} />
                </div>
              </div>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="pais">País de residencia *</label>
                <input id="pais" className={styles.input} value={form.pais} onChange={(e) => set('pais', e.target.value)} placeholder="Costa Rica" required />
              </div>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="ciudad">Ciudad de residencia *</label>
                <input id="ciudad" className={styles.input} value={form.ciudad} onChange={(e) => set('ciudad', e.target.value)} placeholder="San José" required />
              </div>
              <div className={`${styles.campo} ${styles.full}`}>
                <label className={styles.label} htmlFor="linkedin">URL de LinkedIn *</label>
                <input id="linkedin" className={styles.input} type="url" value={form.url_linkedin} onChange={(e) => set('url_linkedin', e.target.value)} placeholder="https://www.linkedin.com/in/tu-perfil" required />
                <span className={styles.hint}>Ayuda a verificar tu identidad profesional (disuasivo anti-fraude).</span>
              </div>
              <div className={`${styles.campo} ${styles.full}`}>
                <label className={styles.label} htmlFor="bio">Biografía profesional *</label>
                <textarea id="bio" className={`${styles.input} ${styles.textarea}`} maxLength={500} rows={4} value={form.biografia} onChange={(e) => set('biografia', e.target.value)} placeholder="Cuéntanos tu trayectoria…" required />
                <span className={styles.hint}>{String(form.biografia).length}/500 caracteres</span>
              </div>
            </div>
          </section>

          {/* ── Sección 2: Historial Académico UCR ── */}
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>2 · Historial académico UCR</h2>
            <div className={styles.grid}>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="facultad">Escuela o Facultad *</label>
                <select id="facultad" className={styles.input} value={form.escuela_facultad} onChange={(e) => set('escuela_facultad', e.target.value)} required>
                  <option value="" disabled>Selecciona…</option>
                  {catalogos.facultades.map((f) => <option key={f.id} value={f.nombre}>{f.nombre}</option>)}
                </select>
              </div>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="anio">Año de graduación *</label>
                <input id="anio" className={styles.input} type="number" min={1940} max={ANIO_ACTUAL} value={form.anio_graduacion} onChange={(e) => set('anio_graduacion', e.target.value)} placeholder={`1940 – ${ANIO_ACTUAL}`} required />
              </div>
              <div className={`${styles.campo} ${styles.full}`}>
                <label className={styles.label}>Carrera(s) cursada(s) en la UCR * <span className={styles.opcional}>({form.carreras.length})</span></label>
                <div className={styles.checkBox}>
                  {carrerasDeFacultad.map((c) => (
                    <label key={c.id} className={styles.checkItem}>
                      <input type="checkbox" checked={form.carreras.includes(c.id)} onChange={() => toggleEn('carreras', c.id)} />
                      <span>{c.nombre}</span>
                    </label>
                  ))}
                </div>
                {!form.escuela_facultad && <span className={styles.hint}>Elige primero la facultad para ver sus carreras.</span>}
              </div>
            </div>
          </section>

          {/* ── Sección 3: Información Profesional Actual ── */}
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>3 · Información profesional actual</h2>
            <div className={styles.grid}>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="empresa">Empresa o institución actual *</label>
                <input id="empresa" className={styles.input} value={form.empresa} onChange={(e) => set('empresa', e.target.value)} required />
              </div>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="cargo">Cargo actual *</label>
                <input id="cargo" className={styles.input} value={form.cargo} onChange={(e) => set('cargo', e.target.value)} required />
              </div>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="exp">Años de experiencia *</label>
                <input id="exp" className={styles.input} type="number" min={0} max={70} value={form.anos_experiencia} onChange={(e) => set('anos_experiencia', e.target.value)} required />
              </div>
              <div className={`${styles.campo} ${styles.full}`}>
                <label className={styles.label}>Sector / Industria * <span className={styles.opcional}>({form.sectores.length})</span></label>
                <div className={styles.checkBox}>
                  {catalogos.sectores.map((s) => (
                    <label key={s.id} className={styles.checkItem}>
                      <input type="checkbox" checked={form.sectores.includes(s.id)} onChange={() => toggleEn('sectores', s.id)} />
                      <span>{s.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Sección 4: Áreas de interés ── */}
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>4 · Áreas de interés donde puedes ayudar</h2>
            <p className={styles.seccionNota}>Va más allá de tu carrera formal: permite emparejamientos interdisciplinarios.</p>
            <div className={styles.chips}>
              {catalogos.areas.map((a) => {
                const activa = form.areas.includes(a.id);
                return (
                  <button type="button" key={a.id} className={`${styles.chip} ${activa ? styles.chipOn : ''}`} onClick={() => toggleEn('areas', a.id)}>
                    {a.nombre}
                  </button>
                );
              })}
            </div>
            <span className={styles.hint}>Selecciona al menos una ({form.areas.length} seleccionada(s)).</span>
          </section>

          {/* ── Sección 5: Tipo de Apoyo Ofrecido ── */}
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>5 · Tipo de apoyo ofrecido</h2>
            <div className={styles.apoyoGrid}>
              <label className={styles.apoyoItem}>
                <input type="checkbox" checked={form.ofrece_mentoria} onChange={(e) => set('ofrece_mentoria', e.target.checked)} />
                <span>¿Ofreces mentoría?</span>
              </label>
              {form.ofrece_mentoria && (
                <div className={styles.condicional}>
                  <label className={styles.label} htmlFor="horas">Horas disponibles por mes * (1–40)</label>
                  <input id="horas" className={styles.input} type="number" min={1} max={40} value={form.horas_disponibles_mes} onChange={(e) => set('horas_disponibles_mes', e.target.value)} />
                </div>
              )}

              <label className={styles.apoyoItem}>
                <input type="checkbox" checked={form.ofrece_empleo} onChange={(e) => set('ofrece_empleo', e.target.checked)} />
                <span>¿Ofreces empleo?</span>
              </label>
              <label className={styles.apoyoItem}>
                <input type="checkbox" checked={form.ofrece_pasantia} onChange={(e) => set('ofrece_pasantia', e.target.checked)} />
                <span>¿Ofreces pasantía?</span>
              </label>
              <label className={styles.apoyoItem}>
                <input type="checkbox" checked={form.ofrece_colaboracion} onChange={(e) => set('ofrece_colaboracion', e.target.checked)} />
                <span>¿Ofreces colaboración en proyecto empresarial?</span>
              </label>
              <label className={styles.apoyoItem}>
                <input type="checkbox" checked={form.ofrece_donacion} onChange={(e) => set('ofrece_donacion', e.target.checked)} />
                <span>¿Ofreces donación económica?</span>
              </label>
              {form.ofrece_donacion && (
                <div className={styles.condicional}>
                  <div className={styles.grid2}>
                    <div className={styles.campo}>
                      <label className={styles.label} htmlFor="monto">Monto máximo de donación *</label>
                      <input id="monto" className={styles.input} type="number" min={1} value={form.monto_maximo_donacion} onChange={(e) => set('monto_maximo_donacion', e.target.value)} />
                    </div>
                    <div className={styles.campo}>
                      <label className={styles.label} htmlFor="moneda">Moneda *</label>
                      <select id="moneda" className={styles.input} value={form.moneda} onChange={(e) => set('moneda', e.target.value)}>
                        {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <span className={styles.hint}>El monto es privado: solo lo ven tú y la administración.</span>
                </div>
              )}
            </div>
          </section>

          <div className={styles.acciones}>
            <button type="submit" className={styles.guardar} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar perfil'}
            </button>
            <Link href="/directorio" className={styles.verDirectorio}>Ver directorio</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
