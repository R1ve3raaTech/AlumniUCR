'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { obtenerPerfil } from '@/lib/auth';
import styles from './GlobalChatbot.module.css';
import ChatbotAvatar from './ChatbotAvatar';

// ─── Íconos SVG inline (patrón del proyecto: heredan currentColor) ────────
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const IBrain = () => (
  <svg {...base} viewBox="0 0 24 24">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M9 13a4.5 4.5 0 0 0 3-4" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .556-6.588" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4" />
    <path d="M17.997 5.125a3 3 0 0 1-.398 1.375" />
    <path d="M20.523 10.896a4 4 0 0 0-.556-6.588" />
  </svg>
);
const IClose = () => (
  <svg {...base}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
const ISend = () => (
  <svg {...base}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);

// Helper para conseguir saludos dinámicos basados en rol y ubicación
const obtenerSaludoInicial = (rol: string, pathname: string) => {
  if (rol === 'admin') {
    return '¡Hola, Administrador! Estoy a tu disposición para ayudarte con las tareas de control administrativo: aprobación de solicitudes, matching interdisciplinario o revisión de reportes.';
  }
  if (rol === 'exalumno') {
    return '¡Hola, graduado UCR! Estoy listo para asistirte en cómo completar tus datos, postularte como mentor, registrar ofertas de empleo y gestionar tus mentorías activas.';
  }
  if (rol === 'estudiante') {
    if (pathname.includes('/mi-curriculum')) {
      return '¡Hola! Soy tu **CV Advisor** especializado 📋\n\nPuedo ayudarte a:\n• Redactar logros con la metodología STAR\n• Optimizar tu CV para una vacante específica\n• Sugerirte certificaciones para tu área\n• Mejorar tu resumen profesional\n\n¿Qué sección de tu CV quieres trabajar hoy?';
    }
    if (pathname.includes('/proyectos') || pathname.includes('/perfil-estudiante') || pathname.includes('/completar-perfil')) {
      return '¡Hola! Actúo como tu Asesor de TFG virtual. Puedo guiarte a estructurar mejor tus objetivos de tesis (generales y específicos) y a elegir las áreas temáticas correctas para el matching.';
    }
    if (pathname.includes('/mentorias')) {
      return '¡Hola! Te puedo ayudar a prepararte para la primera sesión con tu mentor, explicarte el matching interdisciplinario o darte consejos de networking profesional.';
    }
    return '¡Hola, estudiante! Puedo orientarte sobre cómo completar tu perfil, buscar ofertas de empleo o conectar con mentores egresados de la UCR. ¿En qué te asisto hoy?';
  }
  return '¡Hola! Soy el asistente de IA oficial de Alumni UCR. ¿Tienes alguna duda sobre el registro, las mentorías o los proyectos? Cuéntame y te ayudo.';
};

// Catálogo de sugerencias para el CV Advisor (type-ahead chips)
const CV_SUGERENCIAS: string[] = [
  // Estructura
  '¿Cuántas páginas debe tener mi CV?',
  '¿Qué secciones son obligatorias en un CV universitario?',
  '¿Debo poner foto en mi CV?',
  '¿Cuál es la diferencia entre CV y résumé?',
  // Redacción y logros
  '¿Cómo redacto mis logros con la metodología STAR?',
  '¿Qué verbos de acción debo usar en mi CV?',
  '¿Cómo cuantifico un logro si no tengo datos exactos?',
  '¿Cómo transformo una descripción genérica en un bullet de impacto?',
  // Mejoras específicas
  '¿Cómo mejoro mi resumen o perfil profesional?',
  '¿Cómo adapto mi CV para una vacante específica?',
  '¿Cómo optimizo mi CV para pasar filtros ATS?',
  '¿Cómo listo proyectos universitarios si no tengo experiencia laboral?',
  // Habilidades y certificaciones
  '¿Qué certificaciones me recomiendas para mi área?',
  '¿Cómo agrego niveles de idioma a mi CV?',
  '¿Qué habilidades blandas valoran más los reclutadores?',
  '¿Cuáles son las tecnologías más demandadas en Costa Rica?',
  // Mercado laboral
  '¿Qué buscan los reclutadores costarricenses en un CV?',
  '¿Qué empresas contratan egresados de la UCR?',
  '¿Cómo postularme a Amazon, Intel o Accenture desde la UCR?',
  '¿El inglés influye en el salario esperado?',
];

// Sugerencias de preguntas rápidas en el Centro de Ayuda (/ayuda) según el rol del usuario
const AYUDA_SUGERENCIAS: Record<string, string[]> = {
  visitante: [
    '¿Quiénes pueden registrarse?',
    '¿Cuánto tarda en aprobarse mi cuenta?',
    '¿El registro tiene algún costo?'
  ],
  estudiante: [
    '¿Qué es el CV con IA?',
    '¿Cómo busco mentores o apoyo?',
    '¿Para qué sirve registrar mi proyecto de graduación?'
  ],
  exalumno: [
    '¿Cómo me postulo como mentor?',
    '¿Cómo funciona el matching interdisciplinario?',
    '¿Puedo ofrecer empleo o pasantías?'
  ],
  admin: [
    '¿Cómo funciona el matching avanzado?',
    '¿Cómo auditar o validar donaciones?',
    '¿Cómo moderar o resolver reportes?'
  ]
};

export default function GlobalChatbot() {
  const pathname = usePathname();
  const { token, loading } = useAuth();
  const [rol, setRol] = useState<string>('visitante');

  // Estados del Chat
  const [chatAbierto, setChatAbierto] = useState(false);
  const [fabHovered, setFabHovered] = useState(false);
  const [mensajes, setMensajes] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sugerenciasFiltradas, setSugerenciasFiltradas] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const estadoRef = useRef({ token, rol, pathname, mensajes, cargando });

  useEffect(() => {
    estadoRef.current = { token, rol, pathname, mensajes, cargando };
  }, [token, rol, pathname, mensajes, cargando]);

  // 1. Obtener y actualizar el rol del usuario en base a su sesión activa
  useEffect(() => {
    if (!token) {
      setRol('visitante');
      return;
    }

    let activo = true;
    obtenerPerfil(token)
      .then((res) => {
        if (!activo) return;
        const userRol = res?.data?.roles?.nombre?.toLowerCase().trim();
        setRol(userRol || 'visitante');
      })
      .catch(() => {
        if (activo) setRol('visitante');
      });

    return () => {
      activo = false;
    };
  }, [token]);

  // 2. Establecer el mensaje inicial cuando cambia el rol o la ubicación (solo si el historial está vacío o solo tiene un mensaje de bienvenida viejo)
  useEffect(() => {
    const saludo = obtenerSaludoInicial(rol, pathname);
    setMensajes((actual) => {
      // Si ya hay conversación activa, no sobreescribir el historial para no perder el hilo
      if (actual.length > 1) return actual;
      return [{ role: 'assistant' as const, text: saludo }];
    });
  }, [rol, pathname]);

  const enviarMensajeEspecifico = async (texto: string) => {
    const { token: t, rol: r, pathname: p, mensajes: m, cargando: c } = estadoRef.current;
    if (!texto.trim() || c) return;

    const msgUsuario = texto.trim();
    let histActualizado: Array<{ role: 'user' | 'assistant'; text: string }> = [];

    setMensajes((actual) => {
      histActualizado = [...actual, { role: 'user' as const, text: msgUsuario }];
      return histActualizado;
    });

    setCargando(true);

    try {
      // Pequeño retardo para asegurar que la actualización de estado ha finalizado
      await new Promise((resolve) => setTimeout(resolve, 50));

      const data = await apiFetch('/claude/chat', {
        method: 'POST',
        body: {
          historial: histActualizado.length > 0 ? histActualizado : [...m, { role: 'user' as const, text: msgUsuario }],
          contexto: {
            rol: r,
            pathname: p,
          },
        },
        token: t || undefined,
      });

      if (data && data.success) {
        setMensajes((prev) => [...prev, { role: 'assistant' as const, text: data.respuesta }]);
      } else {
        throw new Error();
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Lo siento, ha ocurrido un error al procesar tu solicitud con el asistente de IA. Por favor, vuelve a intentarlo en un momento o escribe a soporte@ucrconnect.cr.';
      setMensajes((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          text: errorMsg,
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  // 3. Listener para abrir el chatbot desde botones de páginas específicas (ej. ayuda, directorio)
  useEffect(() => {
    const handleToggle = (e: Event) => {
      setChatAbierto(true);
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const queryText = customEvent.detail.mensaje || customEvent.detail.query || '';
        if (queryText) {
          setTimeout(() => {
            enviarMensajeEspecifico(queryText);
          }, 100);
        }
      }
    };
    window.addEventListener('open-global-chatbot', handleToggle);
    return () => window.removeEventListener('open-global-chatbot', handleToggle);
  }, []);

  // 4. Scroll automático a los nuevos mensajes
  useEffect(() => {
    if (chatAbierto) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, cargando, chatAbierto]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || cargando) return;

    const msg = nuevoMensaje;
    setNuevoMensaje('');
    setSugerenciasFiltradas([]);
    await enviarMensajeEspecifico(msg);
  };

  // Maneja el cambio del input y filtra sugerencias (type-ahead para el CV Advisor)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setNuevoMensaje(valor);

    // Solo mostrar sugerencias en la sección de CV
    if (!pathname.includes('/mi-curriculum')) {
      setSugerenciasFiltradas([]);
      return;
    }

    if (valor.trim().length < 2) {
      setSugerenciasFiltradas([]);
      return;
    }

    const query = valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const filtradas = CV_SUGERENCIAS.filter((s) => {
      const sSin = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return sSin.includes(query);
    }).slice(0, 3);
    setSugerenciasFiltradas(filtradas);
  };

  const seleccionarSugerencia = async (sugerencia: string) => {
    setNuevoMensaje('');
    setSugerenciasFiltradas([]);
    await enviarMensajeEspecifico(sugerencia);
  };


  // Parsea negritas básicas **texto** y saltos de línea del markdown
  const formatearTextoMarkdown = (texto: string) => {
    const lineas = texto.split('\n');
    return lineas.map((linea, indexLinea) => {
      const partes = linea.split(/(\*\*.*?\*\*)/g);
      const lineaProcesada = partes.map((parte, indexParte) => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
          return <strong key={indexParte}>{parte.slice(2, -2)}</strong>;
        }
        return parte;
      });

      return (
        <span key={indexLinea} style={{ display: 'block', minHeight: '1.2em' }}>
          {lineaProcesada}
        </span>
      );
    });
  };

  // No renderizar mientras NextAuth/AuthContext se está hidratando
  if (loading) return null;

  // En el perfil del estudiante el asistente no flota: se abre desde un
  // desplegable de esa pantalla (evento 'open-global-chatbot').
  const ocultarFab = !!pathname && pathname.startsWith('/perfil-estudiante');

  return (
    <>

      {/* Botón Flotante (oculto donde se ofrece como opción desplegable) */}
      {!ocultarFab && (
        <button
          onMouseEnter={() => setFabHovered(true)}
          onMouseLeave={() => setFabHovered(false)}
          onClick={() => setChatAbierto((prev) => !prev)}
          className={`${styles.chatFab} ${chatAbierto ? styles.chatFabActive : ''}`}
          aria-label="Abrir chat de asistencia"
        >
          {chatAbierto ? (
            <IClose />
          ) : (
            <div className={styles.chatFabAvatar}>
              <ChatbotAvatar animated={true} hovered={fabHovered} />
            </div>
          )}
        </button>
      )}

      {/* Ventana de Chat */}
      {chatAbierto && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderTitle}>
              <div className={styles.chatHeaderAvatar}>
                <ChatbotAvatar animated={true} />
              </div>
              <span>Soporte Alumni UCR</span>
            </div>
            <button
              onClick={() => setChatAbierto(false)}
              className={styles.chatCloseBtn}
              aria-label="Cerrar chat"
            >
              <IClose />
            </button>
          </div>

          <div className={styles.chatMessages}>
            {mensajes.map((msg, index) => (
              <div
                key={index}
                className={msg.role === 'user' ? styles.chatUserWrapper : styles.chatAssistantWrapper}
              >
                {msg.role !== 'user' && (
                  <div className={styles.chatMessageAvatar}>
                    <ChatbotAvatar animated={true} />
                  </div>
                )}
                <div
                  className={`${styles.chatBubble} ${
                    msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant
                  }`}
                >
                  {formatearTextoMarkdown(msg.text)}
                </div>
              </div>
            ))}
            {cargando && (
              <div className={styles.chatAssistantWrapper}>
                <div className={styles.chatMessageAvatar}>
                  <ChatbotAvatar animated={true} />
                </div>
                <div className={`${styles.chatBubble} ${styles.chatBubbleAssistant} ${styles.chatBubbleLoading}`}>
                  <span className={styles.chatLoadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  <span>Asistente escribiendo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={enviarMensaje} className={styles.chatForm}>
            {/* Chips de sugerencias tipo-ahead (solo en /mi-curriculum) */}
            {sugerenciasFiltradas.length > 0 && (
              <div className={styles.chatSuggestions}>
                {sugerenciasFiltradas.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.chatSuggestionChip}
                    onClick={() => seleccionarSugerencia(s)}
                    tabIndex={0}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {/* Chips de acceso rápido iniciales (solo en /mi-curriculum y sin texto) */}
            {pathname.includes('/mi-curriculum') && !nuevoMensaje.trim() && mensajes.length <= 1 && !cargando && (
              <div className={styles.chatSuggestions}>
                {[
                  '¿Cómo redacto mis logros con STAR?',
                  '¿Qué verbos de acción usar?',
                  '¿Qué certificaciones me recomiendas?',
                ].map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.chatSuggestionChip}
                    onClick={() => seleccionarSugerencia(s)}
                    tabIndex={0}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {/* Chips de acceso rápido iniciales en el Centro de Ayuda */}
            {pathname.includes('/ayuda') && !nuevoMensaje.trim() && mensajes.length <= 1 && !cargando && (
              <div className={styles.chatSuggestions}>
                {(AYUDA_SUGERENCIAS[rol] || AYUDA_SUGERENCIAS.visitante).map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.chatSuggestionChip}
                    onClick={() => seleccionarSugerencia(s)}
                    tabIndex={0}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className={styles.chatInputRow}>
              <input
                type="text"
                className={styles.chatInput}
                placeholder={pathname.includes('/mi-curriculum') ? 'Pregunta sobre tu CV...' : 'Escribe tu mensaje...'}
                value={nuevoMensaje}
                onChange={handleInputChange}
                disabled={cargando}
              />
              <button
                type="submit"
                className={styles.chatSendBtn}
                disabled={!nuevoMensaje.trim() || cargando}
              >
                <ISend />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
