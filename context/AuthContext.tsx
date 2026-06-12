'use client';

// Estado global de sesión. Hidrata el token/usuario desde localStorage al montar
// y expone acciones (signIn, signUp, signOut) que envuelven la lógica de lib/auth.

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  verificarMagicLink as verificarMagicLinkRequest,
  getStoredSession,
} from '@/lib/auth';

// Forma mínima del usuario que devuelve Supabase Auth a través del backend.
// Se mantiene un index signature para no perder campos adicionales.
export interface AuthUser {
  id: string;
  email?: string;
  [key: string]: unknown;
}

type User = AuthUser | null;
type Rol = 'estudiante' | 'exalumno';

interface AuthContextValue {
  user: User;
  token: string | null;
  loading: boolean;
  signIn: (correo: string, contrasena: string) => Promise<void>;
  signUp: (rol: Rol, correo: string, contrasena: string) => Promise<void>;
  verificarCorreo: (tokenHash: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  // loading cubre la hidratación inicial: evita parpadeos/redirecciones erróneas
  // en rutas protegidas antes de saber si hay sesión.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (correo: string, contrasena: string) => {
    const session = await loginRequest(correo, contrasena);
    setUser(session.user);
    setToken(session.token);
  }, []);

  const signUp = useCallback(
    async (rol: Rol, correo: string, contrasena: string) => {
      await registerRequest(rol, correo, contrasena);
    },
    [],
  );

  // Verifica el magic link (paso 2) y refleja la sesión en el contexto, para que
  // las rutas protegidas (/completar-perfil, /dashboard) la reconozcan al instante.
  const verificarCorreo = useCallback(async (tokenHash: string) => {
    const session = await verificarMagicLinkRequest(tokenHash);
    setUser(session.user);
    setToken(session.token);
  }, []);

  const signOut = useCallback(() => {
    logoutRequest();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signUp, verificarCorreo, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>.');
  }
  return ctx;
}
