'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AlumniLogo from '@/components/AlumniLogo';
import { enviarSolicitudVoluntario } from '@/lib/voluntarios';
import { useAuthForm } from '@/hooks/useAuthForm';
import styles from './otros.module.css';

// ─── Íconos SVG inline ────────────────────────────────────────────────
const IArrowBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7 7-7-7 7-7" /></svg>
);
const ISpinner = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
const ICheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);

const AREAS = ['Proyectos', 'Mentorías', 'Estudiantes', 'Varios'];
const DISPONIBILIDAD = ['Tiempo completo', 'Medio tiempo', 'Por horas', 'Puntual / por proyecto'];

const VACIO = {
  nombre: '',
  correo: '',
  telefono: '',
  organizacion: '',
  area_colaboracion: '',
  disponibilidad: '',
  mensaje: '',
};

export default function OtrosPage() {
  const { error, loading, run } = useAuthForm();
  const [form, setForm] = useState(VACIO);
  const [enviado, setEnviado] = useState(false);

  const set = (campo: keyof typeof VACIO) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await enviarSolicitudVoluntario(form);
      setEnviado(true);
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden>
        <span className={styles.bgCircle} />
        <span className={styles.bgBlock} />
      </div>

      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio"><AlumniLogo height={38} /></Link>
        <Link href="/registro" className={styles.backLink}>
          <IArrowBack /> Volver al Registro
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.panel}>
          {enviado ? (
            <div className={styles.success}>
              <span className={styles.successIcon}><ICheck /></span>
              <h1 className={styles.title}>¡Formulario entregado con éxito!</h1>
              <p className={styles.successText}>
                Gracias por tu interés en colaborar. Tu solicitud fue enviada al
                administrador, quien la revisará y habilitará los accesos
                correspondientes. Te contactaremos al correo indicado.
              </p>
              <Link href="/" className={styles.submit}>Volver al inicio</Link>
            </div>
          ) : (
            <>
              <div className={styles.intro}>
                <span className={styles.tag}>Colaborador / Voluntario</span>
                <h1 className={styles.title}>Postúlate para colaborar</h1>
                <p className={styles.subtitle}>
                  Cuéntanos sobre ti y cómo te gustaría aportar. El administrador
                  revisará tu solicitud y habilitará tu acceso. Todos los campos son
                  obligatorios.
                </p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {error && <div className={styles.formError}>{error}</div>}

                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="nombre">Nombre completo</label>
                    <input id="nombre" className={styles.input} type="text" placeholder="Ej: María González" value={form.nombre} onChange={set('nombre')} required />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="correo">Correo electrónico</label>
                    <input id="correo" className={styles.input} type="email" placeholder="tucorreo@dominio.com" value={form.correo} onChange={set('correo')} required />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="telefono">Teléfono</label>
                    <input id="telefono" className={styles.input} type="tel" placeholder="Ej: 8888-8888" value={form.telefono} onChange={set('telefono')} required />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="organizacion">Organización / Afiliación</label>
                    <input id="organizacion" className={styles.input} type="text" placeholder="Empresa, ONG, independiente…" value={form.organizacion} onChange={set('organizacion')} required />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="area">Área en la que deseas colaborar</label>
                    <select id="area" className={styles.input} value={form.area_colaboracion} onChange={set('area_colaboracion')} required>
                      <option value="" disabled>Selecciona un área…</option>
                      {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="disponibilidad">Disponibilidad</label>
                    <select id="disponibilidad" className={styles.input} value={form.disponibilidad} onChange={set('disponibilidad')} required>
                      <option value="" disabled>Selecciona tu disponibilidad…</option>
                      {DISPONIBILIDAD.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label} htmlFor="mensaje">¿Cómo te gustaría ayudar?</label>
                    <textarea id="mensaje" className={`${styles.input} ${styles.textarea}`} rows={4} placeholder="Describe tu experiencia, intereses y la forma en que podrías aportar." value={form.mensaje} onChange={set('mensaje')} required />
                  </div>
                </div>

                <button type="submit" className={styles.submit} disabled={loading}>
                  {loading ? (<><ISpinner className={styles.spinner} /> Enviando…</>) : 'Enviar solicitud'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <AlumniLogo height={32} />
        <div className={styles.footerCopy}>© 2026 Alumni UCR. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}
