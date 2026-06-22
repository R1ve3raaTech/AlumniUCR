'use client';

// Toast ligero y reutilizable para el área de estudiante. Se monta una vez en
// StudentShell; cualquier parte dispara un aviso con notificar('mensaje').
// Sirve para dar feedback de "función en desarrollo" de forma consistente.

import React, { useEffect, useState } from 'react';

export function notificar(mensaje: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ucr-toast', { detail: mensaje }));
  }
}

export default function Toast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handler = (e: Event) => {
      setMsg((e as CustomEvent).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 2600);
    };
    window.addEventListener('ucr-toast', handler);
    return () => {
      window.removeEventListener('ucr-toast', handler);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-8 right-8 z-[100] transition-all duration-300 ${
        msg ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-xl bg-primary px-6 py-4 text-on-primary shadow-2xl">
        <span className="material-symbols-outlined">info</span>
        <span className="font-body-semibold text-sm">{msg}</span>
      </div>
    </div>
  );
}
