'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationSpinner() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div
        style={{ background: 'rgba(9, 10, 15, 0.6)', backdropFilter: 'blur(4px)' }}
        className="absolute inset-0"
      />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="spinner-ring" />
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'hsl(var(--muted-foreground))',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
          }}
        >
          CARGANDO
        </span>
      </div>

      <style>{`
        .spinner-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: hsl(250, 85%, 65%);
          border-right-color: hsl(195, 90%, 50%);
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
