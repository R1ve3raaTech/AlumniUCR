'use client';

// Formulario "Quiero ayudar" de /voluntariado. Los campos base son siempre
// los mismos; los campos dinámicos cambian según el tipo de ayuda elegido
// (donación → monto/frecuencia · pasantía → empresa/duración · mentoría o
// taller → tema). Envía al mismo endpoint que /registro/otros (POST /voluntarios),
// que ya distingue ambos formularios por la presencia de "tipo_ayuda".

import React, { useEffect, useRef, useState } from 'react';
import { enviarSolicitudVoluntario } from '@/lib/voluntariado/voluntarios';
import { useAuthForm } from '@/hooks/useAuthForm';

export type TipoAyuda = 'donacion' | 'pasantia' | 'mentoria' | 'taller';

const TIPOS: { value: TipoAyuda; label: string }[] = [
  { value: 'donacion', label: 'Donación' },
  { value: 'pasantia', label: 'Pasantía' },
  { value: 'mentoria', label: 'Mentoría' },
  { value: 'taller', label: 'Taller' },
];

const AREAS = [
  'Tecnología e Innovación', 'Salud y Bienestar', 'Educación y Pedagogía',
  'Medio Ambiente y Sostenibilidad', 'Arte y Cultura', 'Ciencias Sociales',
  'Agro y Alimentación', 'Emprendimiento y Negocios', 'Ingeniería y Construcción',
  'Derecho y Política Pública', 'Economía y Finanzas', 'Comunicación y Medios',
  'Turismo y Patrimonio', 'Investigación Científica',
];

const MODALIDADES = ['Presencial', 'Remoto', 'Híbrido'];
const FRECUENCIAS = ['Única vez', 'Mensual', 'Trimestral', 'Anual'];

const inputCls =
  'w-full rounded-xl border border-ucr-outline-variant bg-white px-4 py-2.5 text-sm text-ucr-on-surface placeholder:text-ucr-outline focus:border-ucr-secondary focus:outline-none focus:ring-2 focus:ring-ucr-secondary/20';
const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-ucr-on-surface-variant';

const VACIO = {
  nombre: '', correo: '', tipo_ayuda: '' as TipoAyuda | '', area: '', modalidad: '', mensaje: '',
  monto: '', frecuencia: '', empresa: '', duracion: '', tema: '',
};

export default function FormularioAyuda({
  tipoPreseleccionado,
}: {
  tipoPreseleccionado: TipoAyuda | null;
}) {
  const { error, loading, run, reset } = useAuthForm();
  const [form, setForm] = useState(VACIO);
  const [enviado, setEnviado] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Al elegir una tarjeta en "Cómo puedes ayudar", se preselecciona el tipo y
  // se hace scroll hasta el formulario, para que la persona vea el cambio.
  useEffect(() => {
    if (!tipoPreseleccionado) return;
    setForm((f) => ({ ...f, tipo_ayuda: tipoPreseleccionado }));
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [tipoPreseleccionado]);

  const set = (campo: keyof typeof VACIO) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await enviarSolicitudVoluntario({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        tipo_ayuda: form.tipo_ayuda,
        area: form.area,
        modalidad: form.modalidad,
        mensaje: form.mensaje.trim(),
        ...(form.tipo_ayuda === 'donacion' ? { monto: form.monto, frecuencia: form.frecuencia } : {}),
        ...(form.tipo_ayuda === 'pasantia' ? { empresa: form.empresa.trim(), duracion: form.duracion } : {}),
        ...(form.tipo_ayuda === 'mentoria' || form.tipo_ayuda === 'taller' ? { tema: form.tema.trim() } : {}),
      });
      setEnviado(true);
    });
  }

  function otraSolicitud() {
    setForm(VACIO);
    setEnviado(false);
    reset();
  }

  return (
    <section id="formulario" ref={ref} className="bg-ucr-surface-container-lowest px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h2 className="font-brand-heading text-3xl font-bold text-ucr-primary">Quiero ayudar</h2>
          <p className="mt-2 text-ucr-on-surface-variant">
            Completá el formulario y la administración revisará tu solicitud.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-ucr-outline-variant bg-white p-6 shadow-[0_2px_16px_-6px_rgba(0,40,55,0.1)] sm:p-8">
          {enviado ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-ucr-esmeralda/10 text-ucr-esmeralda">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </span>
              <h3 className="font-brand-heading text-xl font-bold text-ucr-primary">¡Gracias por tu interés!</h3>
              <p className="max-w-sm text-sm text-ucr-on-surface-variant">
                Tu solicitud fue enviada a la administración, que la revisará y te contactará
                al correo indicado.
              </p>
              <button
                type="button"
                onClick={otraSolicitud}
                className="mt-2 rounded-full border border-ucr-outline-variant px-6 py-2 text-sm font-bold text-ucr-primary transition-colors hover:bg-ucr-surface-container"
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="nombre">Nombre completo</label>
                  <input id="nombre" className={inputCls} value={form.nombre} onChange={set('nombre')} placeholder="Ej: María González" required />
                </div>
                <div>
                  <label className={labelCls} htmlFor="correo">Correo electrónico</label>
                  <input id="correo" type="email" className={inputCls} value={form.correo} onChange={set('correo')} placeholder="tucorreo@dominio.com" required />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="tipo_ayuda">Tipo de ayuda</label>
                <select id="tipo_ayuda" className={inputCls} value={form.tipo_ayuda} onChange={set('tipo_ayuda')} required>
                  <option value="" disabled>Selecciona cómo querés ayudar…</option>
                  {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="area">Área</label>
                  <select id="area" className={inputCls} value={form.area} onChange={set('area')} required>
                    <option value="" disabled>Selecciona un área…</option>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="modalidad">Modalidad</label>
                  <select id="modalidad" className={inputCls} value={form.modalidad} onChange={set('modalidad')} required>
                    <option value="" disabled>Selecciona una modalidad…</option>
                    {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Campos dinámicos según el tipo de ayuda ── */}
              {form.tipo_ayuda === 'donacion' && (
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-ucr-secondary/5 p-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor="monto">Monto (₡)</label>
                    <input id="monto" type="number" min={1} className={inputCls} value={form.monto} onChange={set('monto')} placeholder="Ej: 25000" required />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="frecuencia">Frecuencia</label>
                    <select id="frecuencia" className={inputCls} value={form.frecuencia} onChange={set('frecuencia')} required>
                      <option value="" disabled>Selecciona…</option>
                      {FRECUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {form.tipo_ayuda === 'pasantia' && (
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-ucr-secondary/5 p-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor="empresa">Empresa</label>
                    <input id="empresa" className={inputCls} value={form.empresa} onChange={set('empresa')} placeholder="Nombre de tu empresa" required />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="duracion">Duración</label>
                    <input id="duracion" className={inputCls} value={form.duracion} onChange={set('duracion')} placeholder="Ej: 3 meses" required />
                  </div>
                </div>
              )}

              {(form.tipo_ayuda === 'mentoria' || form.tipo_ayuda === 'taller') && (
                <div className="rounded-2xl bg-ucr-secondary/5 p-4">
                  <label className={labelCls} htmlFor="tema">
                    {form.tipo_ayuda === 'mentoria' ? 'Tema de la mentoría' : 'Tema del taller'}
                  </label>
                  <input id="tema" className={inputCls} value={form.tema} onChange={set('tema')} placeholder="Ej: Desarrollo web, finanzas personales…" required />
                </div>
              )}

              <div>
                <label className={labelCls} htmlFor="mensaje">Contanos más</label>
                <textarea id="mensaje" rows={4} className={inputCls} value={form.mensaje} onChange={set('mensaje')} placeholder="Describe tu experiencia y cómo te gustaría aportar." required />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-ucr-naranja py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
