'use client';

// CV Advisor con IA — Página dedicada de optimización.
// Presenta un panel de chat conversacional amplio, un panel de sugerencias interactivas
// por sección para mejorar título, agregar métricas o palabras clave ATS, y una
// vista previa en vivo del currículum en formato de hoja de papel.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AlumniLogo from '@/components/AlumniLogo';
import CvDocumento from '@/components/student/CvDocumento';
import { notificar } from '@/components/student/Toast';
import { usePerfilEstudiante, type Experiencia } from '@/context/PerfilEstudianteContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const SECCIONES_ADVISOR = [
  { key: 'datos', label: 'Datos personales' },
  { key: 'experiencia', label: 'Experiencia laboral' },
  { key: 'habilidades', label: 'Habilidades' },
  { key: 'resumen', label: 'Resumen profesional' },
];

const label = 'mb-1.5 block text-xs font-bold text-primary uppercase tracking-wider';

export default function CvAdvisorPage() {
  const router = useRouter();
  const { perfil, actualizar } = usePerfilEstudiante();
  const { user, token } = useAuth();
  const [seccionActiva, setSeccionActiva] = useState('datos');
  const [guardando, setGuardando] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Estados del Asistente de IA (Chat)
  const [conversacion, setConversacion] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: '¡Hola! Bienvenido a tu **CV Advisor con IA** dedicado 🤖\n\nAquí tienes un espacio a pantalla completa para optimizar tu currículum. Puedes hacerme cualquier pregunta técnica en el chat de la izquierda, o utilizar el **Copiloto de Sugerencias** en el centro para actualizar directamente tus campos con un solo clic.\n\n¿En qué área te gustaría trabajar hoy?'
    }
  ]);
  const [mensajeChat, setMensajeChat] = useState('');
  const [cargandoChat, setCargandoChat] = useState(false);
  const [analizando, setAnalizando] = useState(false);

  // Base de datos de sugerencias contextuales con IA
  const SUGERENCIAS_IA: Record<string, {
    campo: string;
    tituloSugerido: string;
    consejoImpacto: string;
    keywordsFaltantes: string[];
    aplicarTitulo: string;
    aplicarImpacto: string;
  }> = {
    datos: {
      campo: 'cargoDeseado',
      tituloSugerido: 'Asistente de Farmacia Senior',
      consejoImpacto: 'Añade métricas y datos cuantificables para demostrar efectividad en tu puesto de farmacia.',
      keywordsFaltantes: ['Regencia Farmacéutica', 'Control de Inventario', 'Dispensación', 'Buenas Prácticas (BPM)'],
      aplicarTitulo: 'Asistente de Farmacia Senior',
      aplicarImpacto: ' enfocado en la gestión eficiente y optimización de despachos de medicamentos'
    },
    experiencia: {
      campo: 'descripcion',
      tituloSugerido: 'Descripción con logros',
      consejoImpacto: 'Aplica la metodología STAR. Recomienda agregar métricas y datos cuantificables (ej. "% de errores" o "optimización de procesos").',
      keywordsFaltantes: ['Control de Stock', 'Metodología FIFO', 'Atención a Pacientes'],
      aplicarTitulo: '',
      aplicarImpacto: ', logrando reducir en un 15% los errores de dispensación y un 10% en el tiempo de despacho'
    },
    habilidades: {
      campo: 'habilidadesTecnicas',
      tituloSugerido: 'Keywords del Sector',
      consejoImpacto: 'Escanea el texto y sugiere conceptos clave del sector para superar los filtros ATS de reclutamiento.',
      keywordsFaltantes: ['Farmacovigilancia', 'Buenas Prácticas (BPM)', 'Control de Caducidades', 'Gestión de Inventario'],
      aplicarTitulo: 'Farmacovigilancia, Gestión de Inventario, Buenas Prácticas de Manufactura (BPM)',
      aplicarImpacto: ''
    },
    resumen: {
      campo: 'resumen',
      tituloSugerido: 'Resumen optimizado',
      consejoImpacto: 'Redacta un perfil atractivo destacando tu principal motivación y el sello académico de la UCR.',
      keywordsFaltantes: ['Estudiante UCR', 'Gestión de Inventarios', 'Atención Farmacéutica'],
      aplicarTitulo: 'Estudiante avanzada de Licenciatura en Farmacia en la Universidad de Costa Rica (UCR), con experiencia práctica en regencia, gestión de inventarios y dispensación farmacéutica. Orientada a la precisión operativa y la farmacovigilancia.',
      aplicarImpacto: ''
    }
  };

  const activeSugerencia = useMemo(() => {
    return SUGERENCIAS_IA[seccionActiva] || SUGERENCIAS_IA['datos'];
  }, [seccionActiva]);

  // Guarda en la fuente única
  const set = (parcial: Parameters<typeof actualizar>[0]) => {
    actualizar(parcial);
    setGuardando(true);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setGuardando(false), 900);
  };

  const updExp = (i: number, campo: keyof Experiencia, valor: string) =>
    set({ experiencias: perfil.experiencias.map((e, j) => (j === i ? { ...e, [campo]: valor } : e)) });

  // Aplica sugerencias de IA
  const aplicarSugerenciaIa = (tipo: 'titulo' | 'impacto' | 'keyword', valorKeyword?: string) => {
    const sug = activeSugerencia;
    
    if (tipo === 'titulo') {
      const valor = sug.aplicarTitulo;
      if (!valor) return;
      
      if (sug.campo === 'descripcion' && perfil.experiencias.length > 0) {
        // Aplica al primer registro de experiencia como ejemplo
        updExp(0, 'puesto', valor);
      } else {
        set({ [sug.campo]: valor });
      }
      notificar(`✨ Campo "${sug.campo}" actualizado a: "${valor}"`);
    } else if (tipo === 'impacto') {
      const valor = sug.aplicarImpacto;
      if (!valor) return;
      
      if (sug.campo === 'descripcion') {
        if (perfil.experiencias.length > 0) {
          const descActual = perfil.experiencias[0].descripcion || '';
          updExp(0, 'descripcion', descActual + valor);
          notificar('✨ Logro de impacto añadido a la primera experiencia laboral.');
        } else {
          notificar('⚠️ Agrega primero una experiencia laboral en el editor.');
        }
      } else {
        const descActual = (perfil as any)[sug.campo] || '';
        set({ [sug.campo]: descActual + valor });
        notificar('✨ Logro de impacto añadido.');
      }
    } else if (tipo === 'keyword' && valorKeyword) {
      if (sug.campo === 'descripcion') {
        if (perfil.experiencias.length > 0) {
          const descActual = perfil.experiencias[0].descripcion || '';
          const nuevoValor = descActual ? `${descActual}, experto en ${valorKeyword}` : `Experto en ${valorKeyword}`;
          updExp(0, 'descripcion', nuevoValor);
        }
      } else {
        const actual = (perfil as any)[sug.campo] || '';
        const nuevoValor = actual ? `${actual}, ${valorKeyword}` : valorKeyword;
        set({ [sug.campo]: nuevoValor });
      }
      notificar(`✨ Palabra clave "${valorKeyword}" añadida.`);
    }
  };

  // Parsea negritas básicas y saltos de línea del markdown en React
  const formatearTextoMarkdown = (texto: string) => {
    const lineas = texto.split('\n');
    return lineas.map((linea, indexLinea) => {
      const partes = linea.split(/(\*\*.*?\*\*)/g);
      const lineaProcesada = partes.map((parte, indexParte) => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
          return <strong key={indexParte} className="font-bold text-secondary">{parte.slice(2, -2)}</strong>;
        }
        return parte;
      });

      return (
        <span key={indexLinea} className="block min-h-[1.2em]">
          {lineaProcesada}
        </span>
      );
    });
  };

  const enviarChat = async (mensajeCustom?: string) => {
    const texto = (mensajeCustom || mensajeChat).trim();
    if (!texto || cargandoChat) return;

    setMensajeChat('');
    const nuevoHistorial = [...conversacion, { role: 'user' as const, text: texto }];
    setConversacion(nuevoHistorial);
    setCargandoChat(true);

    try {
      const res = await apiFetch('/claude/chat', {
        method: 'POST',
        body: {
          historial: nuevoHistorial,
          contexto: {
            rol: 'estudiante',
            pathname: '/mi-curriculum/editor',
            perfil: perfil
          }
        },
        token: token || undefined
      });

      if (res && res.success) {
        setConversacion((prev) => [...prev, { role: 'assistant' as const, text: res.respuesta }]);
      } else {
        throw new Error();
      }
    } catch {
      setConversacion((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          text: 'Lo siento, ocurrió un problema al conectar con el Asistente de IA. Revisa tu conexión e intenta de nuevo.'
        }
      ]);
    } finally {
      setCargandoChat(false);
    }
  };

  const analizarCurriculumCompleto = async () => {
    if (analizando) return;
    setAnalizando(true);

    const consultaAnalisis = `Por favor, analiza mi currículum completo en tiempo real sección por sección y dame sugerencias concretas de optimización.`;
    
    try {
      const res = await apiFetch('/claude/chat', {
        method: 'POST',
        body: {
          historial: [
            { role: 'user', text: consultaAnalisis }
          ],
          contexto: {
            rol: 'estudiante',
            pathname: '/mi-curriculum/editor',
            perfil: perfil
          }
        },
        token: token || undefined
      });

      if (res && res.success) {
        setConversacion((prev) => [
          ...prev,
          { role: 'user' as const, text: '🔍 Analizar currículum completo con IA' },
          { role: 'assistant' as const, text: res.respuesta }
        ]);
      } else {
        throw new Error();
      }
    } catch {
      notificar('❌ No se pudo conectar con el Asistente de IA.');
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-body-base text-on-background print:hidden">
      {/* Barra superior */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="flex items-center gap-1 text-sm font-bold text-on-surface-variant hover:text-primary bg-transparent border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span> Volver
          </button>
          <span className="h-6 w-px bg-outline-variant" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">smart_toy</span>
            <span className="font-brand-heading font-extrabold text-sm text-primary tracking-wide">CV Advisor con IA</span>
          </div>
          <span className="h-6 w-px bg-outline-variant" />
          <AlumniLogo height={28} />
        </div>
        <span className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
          <span className={`h-1.5 w-1.5 rounded-full ${guardando ? 'bg-amber-500' : 'animate-pulse bg-emerald-500'}`} />
          {guardando ? 'Guardando…' : 'Sincronizado'}
        </span>
      </header>

      {/* Cuerpo principal de la página */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Columna Izquierda: Chat + Panel de Copiloto de Sugerencias */}
        <div className="flex-1 flex min-h-0 p-6 gap-6 bg-surface-container-low">
          {/* Sub-panel 1: Conversación con el Advisor */}
          <div className="flex-1 flex flex-col border border-outline-variant rounded-2xl bg-surface shadow-md overflow-hidden min-h-0">
            <div className="flex h-12 shrink-0 items-center justify-between bg-surface-container px-4 border-b border-outline-variant">
              <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">chat_bubble</span>
                Chat de Asesoramiento
              </span>
              <button
                type="button"
                onClick={analizarCurriculumCompleto}
                disabled={analizando}
                className="flex items-center gap-1 rounded bg-gradient-to-r from-primary to-secondary px-3 py-1 text-[10px] font-bold text-on-primary shadow-sm hover:brightness-105 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[12px]">analytics</span>
                {analizando ? 'Analizando...' : 'Analizar CV completo'}
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-surface-container-lowest">
              {conversacion.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  {msg.role !== 'user' && (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-on-primary rounded-tr-none font-semibold'
                        : 'bg-surface-container-high text-on-surface rounded-tl-none'
                    }`}
                  >
                    {formatearTextoMarkdown(msg.text)}
                  </div>
                </div>
              ))}
              {cargandoChat && (
                <div className="flex gap-3 max-w-[85%]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </span>
                  <div className="rounded-2xl px-4 py-3 bg-surface-container-high text-on-surface rounded-tl-none flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Sugerencias de chips de chat */}
            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto shrink-0 border-t border-outline-variant/30 bg-surface-container-low scrollbar-none">
              {[
                '¿Cómo redacto logros con STAR?',
                'Dame ejemplos de verbos de acción',
                '¿Cuáles son las habilidades más demandadas?'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => enviarChat(chip)}
                  className="shrink-0 bg-surface rounded-full px-3 py-1.5 text-[10px] font-semibold text-primary border border-outline-variant hover:bg-primary/5 transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Formulario de entrada */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviarChat();
              }}
              className="p-3 bg-surface border-t border-outline-variant flex gap-3 shrink-0"
            >
              <input
                type="text"
                value={mensajeChat}
                onChange={(e) => setMensajeChat(e.target.value)}
                placeholder="Escribe una pregunta sobre tu CV..."
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-secondary focus:outline-none"
              />
              <button
                type="submit"
                disabled={!mensajeChat.trim() || cargandoChat}
                className="bg-primary hover:bg-secondary text-on-primary rounded-xl px-5 flex items-center justify-center disabled:opacity-40 transition-colors shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>

          {/* Sub-panel 2: Copiloto de Sugerencias */}
          <div className="w-[380px] flex flex-col border border-outline-variant rounded-2xl bg-surface shadow-md overflow-hidden min-h-0 shrink-0">
            <div className="flex h-12 shrink-0 items-center bg-surface-container px-4 border-b border-outline-variant">
              <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Copiloto de Sugerencias
              </span>
            </div>

            {/* Selector de Sección del CV */}
            <div className="p-3 bg-surface-container-low flex flex-wrap gap-1 border-b border-outline-variant shrink-0">
              {SECCIONES_ADVISOR.map((sec) => (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => setSeccionActiva(sec.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    seccionActiva === sec.key
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Lista de Sugerencias para el campo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
              <div className="rounded-xl border border-secondary/15 bg-secondary/5 p-3.5 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-secondary/10 pb-1.5">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Recomendación IA</span>
                  <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[9px] font-bold text-secondary uppercase">
                    {activeSugerencia.campo}
                  </span>
                </div>

                {/* 1. Mejora de Título */}
                {activeSugerencia.aplicarTitulo && (
                  <div className="space-y-1.5">
                    <span className={label}>Mejora de Título</span>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      Sugerimos pasar del título actual a un cargo más profesional y alineado al sector:
                    </p>
                    <div className="flex items-center justify-between rounded-xl bg-white border border-outline-variant p-3 gap-2 shadow-sm">
                      <span className="text-xs font-bold text-secondary truncate">{activeSugerencia.aplicarTitulo}</span>
                      <button
                        type="button"
                        onClick={() => aplicarSugerenciaIa('titulo')}
                        className="rounded-lg bg-secondary text-white px-3 py-1.5 text-[10px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Consejos de Impacto */}
                {activeSugerencia.consejoImpacto && (
                  <div className="space-y-1.5 pt-2 border-t border-secondary/10">
                    <span className={label}>Consejos de Impacto</span>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      {activeSugerencia.consejoImpacto}
                    </p>
                    {activeSugerencia.aplicarImpacto && (
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-outline-variant p-3 shadow-sm">
                        <span className="text-[10px] text-secondary font-medium leading-relaxed italic truncate">
                          "{activeSugerencia.aplicarImpacto.trim()}"
                        </span>
                        <button
                          type="button"
                          onClick={() => aplicarSugerenciaIa('impacto')}
                          className="rounded-lg bg-primary text-white px-3 py-1.5 text-[10px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer animate-pulse"
                        >
                          Añadir
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Palabras Clave Faltantes */}
                {activeSugerencia.keywordsFaltantes && activeSugerencia.keywordsFaltantes.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-secondary/10">
                    <span className={label}>Palabras Clave Faltantes (ATS)</span>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      Sugerimos estos conceptos clave para superar los filtros ATS y sistemas automáticos:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeSugerencia.keywordsFaltantes.map((keyword) => (
                        <button
                          key={keyword}
                          type="button"
                          onClick={() => aplicarSugerenciaIa('keyword', keyword)}
                          className="flex items-center gap-1 rounded bg-white hover:bg-secondary/10 px-2.5 py-1 text-[9px] font-bold text-secondary border border-secondary/20 shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[11px]">add</span> {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Vista Previa Fija */}
        <aside className="w-[520px] shrink-0 flex flex-col overflow-hidden border-l border-outline-variant bg-surface-container-high">
          {/* Cabecera de la Vista Previa */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-5 shadow-sm">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">visibility</span>
              Vista previa del CV
            </h3>
            
            <div className="flex items-center gap-2">
              <Link 
                href="/mi-curriculum/editor" 
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-xs font-bold text-on-primary shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
                Editar Manual
              </Link>
              
              <button
                type="button"
                onClick={() => window.print()}
                title="Exportar o imprimir solo el CV (Ctrl+P)"
                className="flex items-center gap-1.5 rounded-xl border border-outline bg-surface px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">download</span> Descargar
              </button>
            </div>
          </div>

          {/* Contenedor centralizado para la hoja de papel */}
          <div className="flex-1 overflow-y-auto p-8 bg-surface-container-highest flex justify-center scrollbar-thin">
            <div className="w-full max-w-[800px] shadow-2xl h-fit bg-white rounded-lg">
              <CvDocumento />
            </div>
          </div>
        </aside>
      </div>

      {/* Versión solo para imprimir/exportar */}
      <div id="cv-print" className="hidden bg-white print:block">
        <CvDocumento />
      </div>
    </div>
  );
}
