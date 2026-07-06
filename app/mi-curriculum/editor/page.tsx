'use client';

// Editor de CV paso a paso (adaptado del Stitch). 3 columnas: secciones +
// progreso, formulario de la sección activa (conectado a la fuente única), y
// vista previa en vivo con guardado automático. Pantalla completa (sin sidebar)
// para dar espacio al editor.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AlumniLogo from '@/components/AlumniLogo';
import AvatarUploader from '@/components/student/AvatarUploader';
import CvDocumento from '@/components/student/CvDocumento';
import PasosCV from '@/components/student/PasosCV';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante, type Experiencia } from '@/context/PerfilEstudianteContext';
import { useAuth } from '@/context/AuthContext';
import { limpiarTexto, tituloCaso, formatearTelefono } from '@/lib/texto';
import { apiFetch } from '@/lib/api';

const SECCIONES = [
  { key: 'datos', label: 'Datos personales' },
  { key: 'contacto', label: 'Información de contacto' },
  { key: 'experiencia', label: 'Experiencia laboral' },
  { key: 'habilidades', label: 'Habilidades' },
  { key: 'educacion', label: 'Educación' },
  { key: 'resumen', label: 'Resumen profesional' },
];

const CONSEJOS_SECCION: Record<string, { titulo: string; tips: string[]; recomendacionRapida: string }> = {
  datos: {
    titulo: 'Datos personales',
    tips: [
      'El "Cargo deseado" debe ser conciso y directo, alineado con las vacantes a las que apuntas (ej: "Desarrollador Full Stack Junior", "Asistente de Farmacia").',
      'Tu nombre debe figurar completo y legible. La foto es opcional, pero si la incluyes, asegúrate de que sea profesional (fondo neutro, buena iluminación).'
    ],
    recomendacionRapida: '💡 Revisa que el cargo deseado corresponda a tu área académica para mejorar el emparejamiento con mentores.'
  },
  contacto: {
    titulo: 'Información de contacto',
    tips: [
      'Usa un correo institucional o profesional. Tu correo de la UCR (@ucr.ac.cr) es ideal para destacar tu origen académico.',
      'En "Ubicación", basta con indicar "San José, Costa Rica" o tu provincia. No coloques dirección física exacta por seguridad.',
      'Agrega tu perfil de LinkedIn. Asegúrate de que esté actualizado.'
    ],
    recomendacionRapida: '💡 Un perfil de LinkedIn bien estructurado aumenta las de contacto por reclutadores en un 40%.'
  },
  experiencia: {
    titulo: 'Experiencia laboral y proyectos',
    tips: [
      'Aplica la metodología STAR (Situación, Tarea, Acción, Resultado) para redactar tus responsabilidades y logros.',
      'Usa verbos de acción en infinitivo (ej: Desarrollar, Implementar, Diseñar, Liderar, Organizar) en lugar de frases débiles.',
      'Si no tienes experiencia laboral formal, ¡no te preocupes! Agrega tus proyectos de curso, voluntariados, TCU o tutorías.'
    ],
    recomendacionRapida: '💡 Redacta logros cuantitativos (ej: "Optimicé un proceso en un 20%") en lugar de solo listar tareas mecánicas.'
  },
  habilidades: {
    titulo: 'Habilidades e idiomas',
    tips: [
      'Lista tus herramientas y lenguajes técnicos separados por coma para que sean leídos fácilmente por sistemas automáticos (ATS).',
      'Separa claramente tus habilidades técnicas (ej. Python, Excel) de tus habilidades blandas (ej. Liderazgo, Trabajo en equipo).',
      'Indica tus idiomas con su nivel respectivo (ej: Inglés (B2), Español (Nativo)).'
    ],
    recomendacionRapida: '💡 Las habilidades técnicas en la sección de Habilidades deben coincidir exactamente con los keywords de las ofertas.'
  },
  educacion: {
    titulo: 'Educación y formación',
    tips: [
      'Coloca tu carrera actual de la UCR. Menciona tu sede académica (ej. Sede de Occidente, Sede Rodrigo Facio).',
      'Coloca el nivel de tu grado académico actual (Bachillerato, Licenciatura, Maestría).',
      'Si tienes un promedio de notas destacado (superior a 80/100), es recomendable mencionarlo en tu perfil.'
    ],
    recomendacionRapida: '💡 Coloca primero tu educación universitaria actual. El mercado laboral costarricense valora el sello UCR.'
  },
  resumen: {
    titulo: 'Resumen profesional',
    tips: [
      'Redacta un párrafo corto (de 3 a 5 líneas) en primera persona implícita (ej: "Estudiante de Farmacia enfocado en...", no "Yo soy estudiante...").',
      'Menciona tu carrera, tus habilidades más fuertes (hard skills) y tu principal motivación profesional.',
      'Adapta el resumen según la industria o tipo de vacante que buscas.'
    ],
    recomendacionRapida: '💡 El resumen es el primer gancho del currículum. Evita frases genéricas como "Persona altamente motivada". Sé específico.'
  }
};

const input = 'w-full rounded-xl border border-outline-variant bg-surface-container-low p-3.5 text-sm focus:border-transparent focus:ring-2 focus:ring-secondary';
const label = 'mb-1.5 block text-sm font-body-semibold text-primary';

export default function EditorCurriculumPage() {
  const router = useRouter();
  const { perfil, actualizar } = usePerfilEstudiante();
  const { user, token } = useAuth();
  const [activa, setActiva] = useState('datos');
  const [guardando, setGuardando] = useState(false);
  const [editorFoto, setEditorFoto] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const centroRef = useRef<HTMLDivElement>(null);

  // Estados del Rediseño
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Mapeo de consejos contextuales discretos para campos
  const CONSEJOS_CAMPOS: Record<string, string> = {
    nombre: 'Asegúrate de que tu nombre completo coincida con tus credenciales académicas y sea legible.',
    apellidos: 'Tus apellidos completos para asegurar coherencia en tu perfil profesional.',
    cargoDeseado: 'El "Cargo deseado" debe ser conciso y directo, alineado con las vacantes a las que apuntas (ej: "Desarrollador Full Stack Junior", "Asistente de Farmacia"). Revisa que corresponda a tu área académica.',
    telefono: 'Ingresa un número telefónico actualizado (ej: 8888 8888) donde te puedan contactar los reclutadores.',
    ubicacion: 'Indica únicamente tu ciudad y país (ej: "San José, Costa Rica"). Por seguridad personal, no coloques tu dirección exacta.',
    linkedin: 'Agrega tu perfil de LinkedIn. Un perfil bien estructurado y actualizado incrementa los contactos de reclutadores en un 40%.',
    puesto: 'Describe tu puesto con un nombre estándar del sector (ej: "Auxiliar Farmacéutico", "Desarrollador React").',
    empresa: 'Nombre oficial de la empresa o institución donde laboraste o desarrollaste tus proyectos.',
    periodo: 'Indica el periodo de tiempo en que laboraste (ej: "2023 - Presente" o "Ene 2022 - Dic 2022").',
    descripcion: 'Aplica la metodología STAR (Situación, Tarea, Acción, Resultado). Redacta logros cuantitativos (ej: "Reduje mermas en 12%" o "Automaticé procesos") con verbos de acción fuertes.',
    habilidadesTecnicas: 'Lista tus herramientas y lenguajes técnicos separados por coma. Estas palabras clave ayudan a superar los filtros automáticos (ATS).',
    habilidadesBlandas: 'Separa tus habilidades técnicas de tus habilidades interpersonales (ej: Comunicación, Liderazgo, Trabajo en equipo).',
    idiomas: 'Indica los idiomas que dominas y tu nivel respectivo (ej: Inglés (B2), Español (Nativo)).',
    carrera: 'Ingresa la carrera oficial que cursas. El mercado laboral costarricense valora altamente el sello UCR.',
    nivel: 'Coloca tu grado académico universitario actual (ej: Bachillerato, Licenciatura, Maestría).',
    anioIngreso: 'Año en el que ingresaste formalmente a la carrera.',
    sede: 'Coloca la sede académica correspondiente a tus estudios (ej: Rodrigo Facio, Occidente, etc.).',
    resumen: 'Redacta un párrafo corto (de 3 a 5 líneas) en primera persona implícita (ej: "Estudiante de Farmacia enfocado en...", no "Yo soy estudiante..."). Evita frases genéricas.'
  };

  // Renderiza consejos sutiles debajo de los inputs al enfocarlos
  const renderConsejo = (field: string) => {
    let consejoKey = field;
    if (field.startsWith('experiencia_')) {
      const parts = field.split('_');
      consejoKey = parts[2];
    }
    
    const consejoText = CONSEJOS_CAMPOS[consejoKey];
    if (!consejoText || focusedField !== field) return null;

    return (
      <div className="mt-2 text-[11px] text-secondary bg-secondary/5 border border-secondary/15 rounded-lg p-2.5 flex items-start gap-2 animate-fade-in transition-all duration-300">
        <span className="material-symbols-outlined text-[14px] mt-0.5 text-secondary shrink-0">lightbulb</span>
        <span className="leading-relaxed">{consejoText}</span>
      </div>
    );
  };

  const idx = SECCIONES.findIndex((s) => s.key === activa);
  const irA = (delta: number) => {
    const sig = SECCIONES[idx + delta];
    if (sig) setActiva(sig.key);
  };
  const finalizar = () => {
    notificar('✅ ¡CV completo! Lo guardamos automáticamente.');
    router.push('/mi-curriculum');
  };

  // Al cambiar de sección, vuelve al inicio del formulario.
  useEffect(() => {
    centroRef.current?.scrollTo({ top: 0 });
  }, [activa]);

  // Guarda en la fuente única y muestra el indicador de "guardado automático".
  const set = (parcial: Parameters<typeof actualizar>[0]) => {
    actualizar(parcial);
    setGuardando(true);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setGuardando(false), 900);
  };

  const correo = user?.email || '';

  // % de CV completado (campos clave del CV).
  const progreso = useMemo(() => {
    const checks = [
      perfil.nombre, perfil.apellidos, perfil.cargoDeseado, perfil.telefono,
      perfil.carrera, perfil.habilidadesTecnicas, perfil.resumen,
      perfil.experiencias.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [perfil]);

  // Indica si una sección particular ya está completada con datos básicos
  const isSeccionCompletada = (key: string) => {
    if (key === 'datos') return !!perfil.nombre && !!perfil.apellidos && !!perfil.cargoDeseado;
    if (key === 'contacto') return !!perfil.telefono && !!perfil.ubicacion;
    if (key === 'experiencia') return perfil.experiencias.length > 0;
    if (key === 'habilidades') return !!perfil.habilidadesTecnicas;
    if (key === 'educacion') return !!perfil.carrera;
    if (key === 'resumen') return !!perfil.resumen;
    return false;
  };

  // ── Experiencias ──
  const addExp = () => set({ experiencias: [...perfil.experiencias, { puesto: '', empresa: '', periodo: '', descripcion: '' }] });
  const updExp = (i: number, campo: keyof Experiencia, valor: string) =>
    set({ experiencias: perfil.experiencias.map((e, j) => (j === i ? { ...e, [campo]: valor } : e)) });
  const delExp = (i: number) => set({ experiencias: perfil.experiencias.filter((_, j) => j !== i) });

  return (
    <>
    <div className="flex h-screen flex-col overflow-hidden bg-background font-body-base text-on-background print:hidden">
      {/* Barra superior */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-6">
        <div className="flex items-center gap-4">
          <Link href="/mi-curriculum/plantillas" className="flex items-center gap-1 text-sm font-bold text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined text-base">arrow_back</span> Plantillas
          </Link>
          <span className="h-6 w-px bg-outline-variant" />
          <AlumniLogo height={28} />
        </div>
        <span className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
          <span className={`h-1.5 w-1.5 rounded-full ${guardando ? 'bg-amber-500' : 'animate-pulse bg-emerald-500'}`} />
          {guardando ? 'Guardando…' : 'Guardado automático'}
        </span>
      </header>

      {/* Indicador de pasos (compartido) */}
      <div className="shrink-0 border-b border-outline-variant bg-surface py-3">
        <PasosCV activo={2} />
      </div>

      <div className="flex min-h-0 flex-1">
        <div 
          ref={centroRef} 
          className="flex-1 overflow-y-auto bg-background p-10 transition-all duration-300"
        >
          <div className="mx-auto max-w-2xl">
            
            {/* Barra de pestañas de progreso interactiva (Rediseñada) */}
            <div className="flex overflow-x-auto border-b border-outline-variant bg-surface-container-low p-1.5 rounded-xl gap-1 mb-8 scrollbar-none shadow-inner">
              {SECCIONES.map((s, i) => {
                const isActive = activa === s.key;
                const isCompleted = isSeccionCompletada(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActiva(s.key)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] ${
                      isActive 
                        ? 'bg-white text-primary font-bold' 
                        : isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-outline-variant/60 text-on-surface-variant'
                    }`}>
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cabecera de Sección */}
            <header className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-2xl text-primary">{SECCIONES.find((s) => s.key === activa)?.label}</h2>
                <p className="mt-1 text-on-surface-variant">Completa los campos. Se guarda solo y la IA te asiste.</p>
              </div>
              <Link
                href="/mi-curriculum/advisor"
                className="flex items-center gap-1.5 rounded-xl bg-secondary/10 px-3.5 py-2 text-xs font-bold text-secondary border border-secondary/20 hover:bg-secondary/20 active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span> Asistente de IA
              </Link>
            </header>

            {/* Contenedor del Formulario con Transición Suave */}
            <div key={activa} className="space-y-6 animate-fade-in">
              {activa === 'datos' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className={label}>Nombre</label>
                      <input 
                        className={input} 
                        value={perfil.nombre} 
                        onChange={(e) => set({ nombre: e.target.value })} 
                        onBlur={(e) => set({ nombre: tituloCaso(e.target.value) })} 
                        onFocus={() => setFocusedField('nombre')}
                      />
                      {renderConsejo('nombre')}
                    </div>
                    <div>
                      <label className={label}>Apellidos</label>
                      <input 
                        className={input} 
                        value={perfil.apellidos} 
                        onChange={(e) => set({ apellidos: e.target.value })} 
                        onBlur={(e) => set({ apellidos: tituloCaso(e.target.value) })} 
                        onFocus={() => setFocusedField('apellidos')}
                      />
                      {renderConsejo('apellidos')}
                    </div>
                  </div>
                  <div>
                    <label className={label}>Cargo deseado</label>
                    <input 
                      className={input} 
                      value={perfil.cargoDeseado} 
                      onChange={(e) => set({ cargoDeseado: e.target.value })} 
                      onBlur={(e) => set({ cargoDeseado: limpiarTexto(e.target.value) })} 
                      onFocus={() => setFocusedField('cargoDeseado')}
                      placeholder="Ej: Desarrolladora Full Stack" 
                    />
                    {renderConsejo('cargoDeseado')}
                  </div>
                  <div>
                    <label className={label}>Foto de perfil</label>
                    <div className="flex items-center gap-6">
                      {perfil.foto ? (
                        <img src={perfil.foto} alt="" className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md" />
                      ) : (
                        <div className="grid h-24 w-24 place-items-center rounded-2xl bg-surface-container text-on-surface-variant"><span className="material-symbols-outlined text-3xl">add_a_photo</span></div>
                      )}
                      <button type="button" onClick={() => setEditorFoto(true)} className="rounded-lg border border-secondary/20 bg-secondary/10 px-6 py-2 text-sm font-body-semibold text-secondary hover:bg-secondary/20">
                        Cambiar foto
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activa === 'contacto' && (
                <div className="space-y-6">
                  <div>
                    <label className={label}>Correo</label>
                    <input 
                      className={`${input} opacity-70`} 
                      value={correo} 
                      readOnly 
                      onFocus={() => setFocusedField('correo')}
                    />
                    {renderConsejo('correo')}
                  </div>
                  <div>
                    <label className={label}>Teléfono</label>
                    <input 
                      className={input} 
                      value={perfil.telefono} 
                      onChange={(e) => set({ telefono: e.target.value })} 
                      onBlur={(e) => set({ telefono: formatearTelefono(e.target.value) })} 
                      onFocus={() => setFocusedField('telefono')}
                      placeholder="8888 8888" 
                    />
                    {renderConsejo('telefono')}
                  </div>
                  <div>
                    <label className={label}>Ubicación</label>
                    <input 
                      className={input} 
                      value={perfil.ubicacion} 
                      onChange={(e) => set({ ubicacion: e.target.value })} 
                      onBlur={(e) => set({ ubicacion: limpiarTexto(e.target.value) })} 
                      onFocus={() => setFocusedField('ubicacion')}
                      placeholder="San José, Costa Rica" 
                    />
                    {renderConsejo('ubicacion')}
                  </div>
                  <div>
                    <label className={label}>LinkedIn</label>
                    <input 
                      className={input} 
                      value={perfil.linkedin} 
                      onChange={(e) => set({ linkedin: e.target.value })} 
                      onFocus={() => setFocusedField('linkedin')}
                      placeholder="linkedin.com/in/…" 
                    />
                    {renderConsejo('linkedin')}
                  </div>
                </div>
              )}

              {activa === 'experiencia' && (
                <div className="space-y-4">
                  {perfil.experiencias.length === 0 && <p className="text-sm text-on-surface-variant">Aún no agregaste experiencia. Sumá tu primer registro.</p>}
                  {perfil.experiencias.map((exp, i) => (
                    <div key={i} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-on-surface-variant">Experiencia {i + 1}</span>
                        <button type="button" onClick={() => delExp(i)} className="text-error hover:opacity-70"><span className="material-symbols-outlined text-base">delete</span></button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <input 
                            className={input} 
                            value={exp.puesto} 
                            onChange={(e) => updExp(i, 'puesto', e.target.value)} 
                            onBlur={(e) => updExp(i, 'puesto', tituloCaso(e.target.value))} 
                            onFocus={() => setFocusedField(`experiencia_${i}_puesto`)}
                            placeholder="Puesto" 
                          />
                          {renderConsejo(`experiencia_${i}_puesto`)}
                        </div>
                        <div>
                          <input 
                            className={input} 
                            value={exp.empresa} 
                            onChange={(e) => updExp(i, 'empresa', e.target.value)} 
                            onBlur={(e) => updExp(i, 'empresa', tituloCaso(e.target.value))} 
                            onFocus={() => setFocusedField(`experiencia_${i}_empresa`)}
                            placeholder="Empresa" 
                          />
                          {renderConsejo(`experiencia_${i}_empresa`)}
                        </div>
                      </div>
                      <div>
                        <input 
                          className={input} 
                          value={exp.periodo} 
                          onChange={(e) => updExp(i, 'periodo', e.target.value)} 
                          onFocus={() => setFocusedField(`experiencia_${i}_periodo`)}
                          placeholder="Período (ej: 2023 - Presente)" 
                        />
                        {renderConsejo(`experiencia_${i}_periodo`)}
                      </div>
                      <div>
                        <textarea 
                          className={`${input} min-h-[70px]`} 
                          value={exp.descripcion} 
                          onChange={(e) => updExp(i, 'descripcion', e.target.value)} 
                          onBlur={(e) => updExp(i, 'descripcion', limpiarTexto(e.target.value))} 
                          onFocus={() => setFocusedField(`experiencia_${i}_descripcion`)}
                          placeholder="Logros y responsabilidades…" 
                        />
                        {renderConsejo(`experiencia_${i}_descripcion`)}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addExp} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-outline py-3 text-sm font-body-semibold text-primary hover:bg-primary/5">
                    <span className="material-symbols-outlined text-base">add</span> Agregar experiencia
                  </button>
                </div>
              )}

              {activa === 'habilidades' && (
                <div className="space-y-6">
                  <div>
                    <label className={label}>Técnicas (separadas por coma)</label>
                    <input 
                      className={input} 
                      value={perfil.habilidadesTecnicas} 
                      onChange={(e) => set({ habilidadesTecnicas: e.target.value })} 
                      onFocus={() => setFocusedField('habilidadesTecnicas')}
                      placeholder="React, Python, SQL…" 
                    />
                    {renderConsejo('habilidadesTecnicas')}
                  </div>
                  <div>
                    <label className={label}>Blandas</label>
                    <input 
                      className={input} 
                      value={perfil.habilidadesBlandas} 
                      onChange={(e) => set({ habilidadesBlandas: e.target.value })} 
                      onFocus={() => setFocusedField('habilidadesBlandas')}
                      placeholder="Liderazgo, comunicación…" 
                    />
                    {renderConsejo('habilidadesBlandas')}
                  </div>
                  <div>
                    <label className={label}>Idiomas</label>
                    <input 
                      className={input} 
                      value={perfil.idiomas} 
                      onChange={(e) => set({ idiomas: e.target.value })} 
                      onFocus={() => setFocusedField('idiomas')}
                      placeholder="Español (nativo), Inglés (B2)" 
                    />
                    {renderConsejo('idiomas')}
                  </div>
                </div>
              )}

              {activa === 'educacion' && (
                <div className="space-y-6">
                  <div>
                    <label className={label}>Carrera</label>
                    <input 
                      className={input} 
                      value={perfil.carrera} 
                      onChange={(e) => set({ carrera: e.target.value })} 
                      onBlur={(e) => set({ carrera: tituloCaso(e.target.value) })} 
                      onFocus={() => setFocusedField('carrera')}
                    />
                    {renderConsejo('carrera')}
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className={label}>Nivel</label>
                      <input 
                        className={input} 
                        value={perfil.nivel} 
                        onChange={(e) => set({ nivel: e.target.value })} 
                        onFocus={() => setFocusedField('nivel')}
                        placeholder="Bachillerato" 
                      />
                      {renderConsejo('nivel')}
                    </div>
                    <div>
                      <label className={label}>Año de ingreso</label>
                      <input 
                        className={input} 
                        value={perfil.anioIngreso} 
                        onChange={(e) => set({ anioIngreso: e.target.value })}
                        onFocus={() => setFocusedField('anioIngreso')}
                      />
                      {renderConsejo('anioIngreso')}
                    </div>
                  </div>
                  <div>
                    <label className={label}>Sede</label>
                    <input 
                      className={input} 
                      value={perfil.sede} 
                      onChange={(e) => set({ sede: e.target.value })}
                      onFocus={() => setFocusedField('sede')}
                    />
                    {renderConsejo('sede')}
                  </div>
                </div>
              )}

              {activa === 'resumen' && (
                <div className="space-y-2">
                  <label className={label}>Resumen profesional</label>
                  <textarea 
                    className={`${input} min-h-[160px]`} 
                    value={perfil.resumen} 
                    onChange={(e) => set({ resumen: e.target.value })} 
                    onBlur={(e) => set({ resumen: limpiarTexto(e.target.value) })} 
                    onFocus={() => setFocusedField('resumen')}
                    placeholder="Un párrafo que resuma tu perfil, fortalezas y objetivos." 
                  />
                  {renderConsejo('resumen')}
                </div>
              )}
            </div>

            {/* Navegación entre secciones */}
            <div className="mt-10 flex items-center justify-between border-t border-outline-variant pt-6">
              <button
                type="button"
                onClick={() => irA(-1)}
                disabled={idx === 0}
                className="flex items-center gap-2 font-body-semibold text-primary transition-transform hover:-translate-x-1 disabled:opacity-40 disabled:hover:translate-x-0"
              >
                <span className="material-symbols-outlined">arrow_back</span> Anterior
              </button>
              {idx < SECCIONES.length - 1 ? (
                <button
                  type="button"
                  onClick={() => irA(1)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-10 py-4 font-body-semibold text-on-primary shadow-md transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  Siguiente <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finalizar}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-10 py-4 font-body-semibold text-on-primary shadow-md transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  <span className="material-symbols-outlined">check_circle</span> Finalizar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Derecha: Vista Previa Fija en Tiempo Real (Rediseñada) */}
        <aside className="hidden w-[520px] shrink-0 flex-col overflow-hidden border-l border-outline-variant bg-surface-container-high xl:flex">
          {/* Cabecera de la Vista Previa */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-5">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">visibility</span>
              Vista previa del CV
            </h3>
            
            <div className="flex items-center gap-2">
              <Link
                href="/mi-curriculum/advisor"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-3.5 py-2 text-xs font-bold text-on-primary shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xs animate-pulse">auto_awesome</span>
                Analizar con IA
              </Link>

              <Link href="/mi-curriculum/plantillas" className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined text-xs">palette</span> Plantilla
              </Link>
              
              <button
                type="button"
                onClick={() => window.print()}
                title="Exportar o imprimir solo el CV (Ctrl+P)"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-on-primary hover:bg-secondary transition-all"
              >
                <span className="material-symbols-outlined text-xs">download</span> Descargar
              </button>
            </div>
          </div>

          {/* Contenedor centralizado para la hoja de papel */}
          <div className="flex-1 overflow-y-auto p-8 bg-surface-container-highest flex justify-center scrollbar-thin">
            <div className="w-full max-w-[800px] shadow-2xl h-fit bg-white rounded-lg transition-transform duration-300">
              <CvDocumento />
            </div>
          </div>
        </aside>
      </div>

      <AvatarUploader abierto={editorFoto} fotoActual={perfil.foto} onGuardar={(foto) => set({ foto })} onCerrar={() => setEditorFoto(false)} />
    </div>

    {/* Versión solo para imprimir/exportar (fuera del aside responsive). */}
    <div id="cv-print" className="hidden bg-white print:block">
      <CvDocumento />
    </div>
    </>
  );
}
