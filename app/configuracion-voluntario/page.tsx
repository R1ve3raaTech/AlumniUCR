'use client';

// Configuración (voluntario). Mismo diseño que /configuracion y
// /configuracion-exalumno: correo no editable, cambiar contraseña, apariencia
// (modo oscuro compartido) e idioma. El voluntario no tiene un perfil editable
// propio (a diferencia de estudiante/exalumno), por eso no hay sección de datos.

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AlumniLogo from '@/components/AlumniLogo';
import { useTema } from '@/lib/useTema';
import { useAuth } from '@/context/AuthContext';
import { useRequireRole } from '@/lib/useRequireRole';

const SHADOW = 'shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';
const CARD = `rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ${SHADOW}`;

function Seccion({ titulo, icono, children }: { titulo: string; icono: string; children: React.ReactNode }) {
  return (
    <div className={CARD}>
      <div className="mb-2 flex items-center gap-3">
        <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
          <span className="material-symbols-outlined">{icono}</span>
        </div>
        <h2 className="font-headline-md text-lg text-primary">{titulo}</h2>
      </div>
      <div className="divide-y divide-outline-variant/30">{children}</div>
    </div>
  );
}

function Fila({ titulo, descripcion, accion }: { titulo: string; descripcion: string; accion: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-3 last:pb-1">
      <div>
        <p className="font-body-semibold text-on-surface">{titulo}</p>
        <p className="text-sm text-on-surface-variant">{descripcion}</p>
      </div>
      {accion}
    </div>
  );
}

const botonSecundario = 'rounded-lg border border-outline px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-variant';

export default function ConfiguracionVoluntarioPage() {
  const router = useRouter();
  const { tema, alternar } = useTema();
  const { user, loading: authLoading } = useAuth();
  const { verificando, autorizado } = useRequireRole(['voluntario']);

  if (authLoading || verificando || !autorizado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-body-base text-on-background">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body-base text-on-background antialiased">
      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between gap-2 px-4 sm:px-8">
          <Link href="/" aria-label="Alumni UCR — inicio"><AlumniLogo className="!h-9 w-auto" /></Link>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-base">dashboard</span> Volver al panel
          </button>
        </div>
      </header>

      <main className="pt-16">
        <div className="mx-auto flex max-w-[900px] flex-col gap-6 p-8">
          <h1 className="font-headline-md text-3xl text-primary">Configuración</h1>

          <Seccion titulo="Datos Personales" icono="badge">
            <Fila
              titulo="Correo electrónico"
              descripcion={`${user?.email ?? 'Sin correo'} — usado para iniciar sesión, no es editable`}
              accion={<span className="material-symbols-outlined text-on-surface-variant">lock</span>}
            />
            <Fila
              titulo="Contraseña"
              descripcion="Cambiala con un código de verificación que llega a tu correo."
              accion={<Link href="/recuperar" className={botonSecundario}>Cambiar contraseña</Link>}
            />
          </Seccion>

          <Seccion titulo="Preferencias del Sistema" icono="tune">
            <Fila
              titulo="Apariencia"
              descripcion={`Modo ${tema === 'oscuro' ? 'oscuro' : 'claro'} activo.`}
              accion={
                <button
                  type="button"
                  onClick={alternar}
                  className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-variant"
                >
                  <span className="material-symbols-outlined text-base">{tema === 'oscuro' ? 'light_mode' : 'dark_mode'}</span>
                  {tema === 'oscuro' ? 'Cambiar a claro' : 'Cambiar a oscuro'}
                </button>
              }
            />
            <Fila
              titulo="Idioma"
              descripcion="La plataforma está disponible en español."
              accion={<span className="text-sm font-bold text-on-surface-variant">Español</span>}
            />
          </Seccion>

          <Seccion titulo="Ayuda" icono="help">
            <Fila
              titulo="Ayuda y soporte"
              descripcion="Preguntas frecuentes, guías y contacto con soporte."
              accion={<Link href="/ayuda" className={botonSecundario}>Ir a Ayuda</Link>}
            />
          </Seccion>
        </div>
      </main>
    </div>
  );
}
