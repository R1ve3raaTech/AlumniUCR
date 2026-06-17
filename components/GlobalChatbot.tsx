'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { obtenerPerfil } from '@/lib/auth';
import styles from './GlobalChatbot.module.css';

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

export default function GlobalChatbot() {
  const pathname = usePathname();
  const { token, loading } = useAuth();
  const [rol, setRol] = useState<string>('visitante');

  // Estados del Chat
  const [chatAbierto, setChatAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // 3. Listener para abrir el chatbot desde botones de páginas específicas (ej. ayuda)
  useEffect(() => {
    const handleToggle = () => setChatAbierto(true);
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

    const msgUsuario = nuevoMensaje.trim();
    setNuevoMensaje('');

    // Actualizar historial local
    const nuevoHistorial = [...mensajes, { role: 'user' as const, text: msgUsuario }];
    setMensajes(nuevoHistorial);
    setCargando(true);

    try {
      // Llamar al backend pasando el historial y el contexto dinámico actual
      const data = await apiFetch('/claude/chat', {
        method: 'POST',
        body: {
          historial: nuevoHistorial,
          contexto: {
            rol: rol,
            pathname: pathname,
          },
        },
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

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setChatAbierto((prev) => !prev)}
        className={`${styles.chatFab} ${chatAbierto ? styles.chatFabActive : ''}`}
        aria-label="Abrir chat de asistencia"
      >
        {chatAbierto ? <IClose /> : <IBrain />}
      </button>

      {/* Ventana de Chat */}
      {chatAbierto && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderTitle}>
              <IBrain />
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
                className={`${styles.chatBubble} ${
                  msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant
                }`}
              >
                {formatearTextoMarkdown(msg.text)}
              </div>
            ))}
            {cargando && (
              <div className={`${styles.chatBubble} ${styles.chatBubbleLoading}`}>
                <span className={styles.chatLoadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span>Asistente escribiendo...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={enviarMensaje} className={styles.chatForm}>
            <input
              type="text"
              className={styles.chatInput}
              placeholder="Escribe tu mensaje..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              disabled={cargando}
            />
            <button
              type="submit"
              className={styles.chatSendBtn}
              disabled={!nuevoMensaje.trim() || cargando}
            >
              <ISend />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
