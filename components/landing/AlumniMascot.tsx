'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './alumni-mascot.module.css';

/* ── Mensajes rotativos de bienvenida ────────────────────────────────────── */
const GREETINGS = [
  '¡Hola! Soy Alumni 👋 Tu guía en Alumni UCR.',
  '¿Buscás empleo o pasantías? ¡Te ayudo a encontrar la oportunidad perfecta!',
  '¿Querés adaptar tu CV con Inteligencia Artificial? ¡Cuéntame más!',
  '¿Sos exalumno UCR? Conectemos tu talento con el mundo 🎓',
  '¿Tenés preguntas sobre la plataforma? ¡Estoy aquí las 24/7!',
];

/* ── Tipo de mensaje ─────────────────────────────────────────────────────── */
type Message = { role: 'user' | 'assistant'; text: string };

/* ── Componente principal ────────────────────────────────────────────────── */
export default function AlumniMascot() {
  const [open, setOpen]                 = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingIdx, setGreetingIdx]   = useState(0);
  const [dismissed, setDismissed]       = useState(false);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [mascotState, setMascotState]   = useState<'idle' | 'wave' | 'talk' | 'think'>('idle');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  /* Mostrar burbuja 2s después de cargar */
  useEffect(() => {
    const t = setTimeout(() => {
      setShowGreeting(true);
      setMascotState('wave');
      setTimeout(() => setMascotState('idle'), 2800);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  /* Rotar mensajes de saludo */
  useEffect(() => {
    if (open || !showGreeting) return;
    const id = setInterval(() => {
      setGreetingIdx(i => (i + 1) % GREETINGS.length);
      setMascotState('wave');
      setTimeout(() => setMascotState('idle'), 1800);
    }, 4500);
    return () => clearInterval(id);
  }, [open, showGreeting]);

  /* Scroll al último mensaje */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* Focus en input al abrir */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 320);
  }, [open]);

  /* Estado mascota según carga */
  useEffect(() => {
    setMascotState(loading ? 'think' : open ? 'idle' : 'idle');
  }, [loading, open]);

  const handleOpen = () => {
    setOpen(o => !o);
    setDismissed(true);
    if (messages.length === 0) {
      setMascotState('wave');
      setTimeout(() => setMascotState('idle'), 2000);
      setMessages([{
        role: 'assistant',
        text: '¡Hola! Soy Alumni, tu asistente inteligente de Alumni UCR 🤖✨ ¿En qué te puedo ayudar hoy? Puedo orientarte sobre empleos, pasantías, tu CV o cualquier duda de la plataforma.',
      }]);
    }
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setMascotState('think');

    try {
      const res = await fetch('/api/alumni-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      if (!res.ok) throw new Error('Error de red');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Sin stream');

      let accumulated = '';
      setMessages(m => [...m, { role: 'assistant', text: '' }]);
      setMascotState('talk');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data:'));
        for (const line of lines) {
          const data = line.replace('data:', '').trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            accumulated += parsed?.delta?.text ?? '';
          } catch {
            accumulated += data;
          }
        }
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', text: accumulated };
          return copy;
        });
      }
    } catch {
      setMessages(m => [
        ...m,
        { role: 'assistant', text: '¡Ups! Tuve un problema de conexión. ¿Lo intentamos de nuevo? 😅' },
      ]);
    } finally {
      setLoading(false);
      setMascotState('idle');
    }
  }, [input, loading, messages]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className={styles.wrapper}>

      {/* ── Panel de chat ──────────────────────────────────────────── */}
      <div
        className={`${styles.chatPanel} ${open ? styles.chatPanelOpen : ''}`}
        aria-live="polite"
        role="dialog"
        aria-label="Chat con Alumni"
      >
        {/* Robot flotante sobre el header — independiente */}
        <div className={styles.chatRobotFloat}>
          <Image
            src="/images/3 sin fondo.png"
            alt="Alumni Robot"
            width={130}
            height={107}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderInfo}>
            <p className={styles.chatHeaderName}>Alumni</p>
            <p className={styles.chatHeaderStatus}>
              <span className={styles.statusDot} />
              Asistente IA · Alumni UCR
            </p>
          </div>
          <button
            className={styles.chatClose}
            onClick={() => setOpen(false)}
            aria-label="Cerrar chat"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mensajes */}
        <div className={styles.chatMessages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}
            >
              {msg.role === 'assistant' && (
                <span className={styles.bubbleAvatar}>
                  <Image src="/images/3 sin fondo.png" alt="Alumni" width={56} height={46} style={{ objectFit: 'contain' }} />
                </span>
              )}
              <p className={styles.bubbleText}>
                {msg.text || (
                  <span className={styles.typing}>
                    <span /><span /><span />
                  </span>
                )}
              </p>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className={`${styles.bubble} ${styles.bubbleBot}`}>
              <span className={styles.bubbleAvatar}>
                <Image src="/images/3 sin fondo.png" alt="Alumni" width={56} height={46} style={{ objectFit: 'contain' }} />
              </span>
              <p className={styles.bubbleText}>
                <span className={styles.typing}><span /><span /><span /></span>
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={styles.chatInputRow}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu pregunta..."
            disabled={loading}
            className={styles.chatInputField}
            maxLength={500}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={styles.chatSend}
            aria-label="Enviar"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Burbuja de saludo ─────────────────────────────────────── */}
      {showGreeting && !open && !dismissed && (
        <div className={styles.greetingBubble} key={greetingIdx}>
          <button
            className={styles.greetingClose}
            onClick={() => setDismissed(true)}
            aria-label="Cerrar saludo"
          >×</button>
          <p className={styles.greetingText}>{GREETINGS[greetingIdx]}</p>
        </div>
      )}

      {/* ── Mascota flotante — se oculta cuando el chat está abierto ── */}
      <button
        className={`${styles.mascotBtn} ${styles[`mascot_${mascotState}`]} ${open ? styles.mascotHidden : ''}`}
        onClick={handleOpen}
        aria-label={open ? 'Cerrar asistente Alumni' : 'Abrir asistente Alumni'}
        aria-expanded={open}
      >
        <Image
          src="/images/3 sin fondo.png"
          alt="Alumni Robot"
          width={220}
          height={181}
          className={styles.mascotImg}
          priority
        />

        {/* Badge de notificación */}
        {!open && !dismissed && showGreeting && (
          <span className={styles.notifBadge} aria-hidden>1</span>
        )}
      </button>
    </div>
  );
}
