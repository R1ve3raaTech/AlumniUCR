'use client';

// Hook compartido por los formularios de autenticación (login y registro):
// centraliza el estado de error y de carga, y envuelve la acción asíncrona
// con el mismo manejo de errores para no repetirlo en cada página.

import { useState, useCallback } from 'react';

export function useAuthForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (action: () => Promise<void>) => {
    setError(null);
    setLoading(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { error, loading, run };
}
