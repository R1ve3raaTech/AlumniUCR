'use client';

// Configuración (estudiante). No hay ningún RF/RNF en el documento de
// requerimientos que pida una pantalla de "Configuración"; esta página existe
// para organizar lo que sí es real o explícitamente pedido:
// - Datos Personales (nombre, teléfono, dirección): se guardan en
//   PerfilEstudianteContext, igual que el resto del perfil (sin tocar BE).
//   El correo NO es editable aquí: es el usado para iniciar sesión y
//   cambiarlo requeriría un endpoint de autenticación que no existe hoy.
// - Apariencia (modo oscuro/claro, lib/useTema.ts): funcionalidad construida
//   a pedido, sin respaldo de RF pero tampoco contradice el documento.
// - Idioma: respaldado por RNF-06 (la plataforma es enteramente en español).
// - Ayuda: enlaza a /ayuda, ya existente.
// "Cerrar sesión" vive en el panel lateral (StudentShell), no aquí.
//
// Se quitaron (no estaban en el documento, eran solo "🚧 en desarrollo"):
// LinkedIn/correo secundario/pronombres, seguridad/2FA, notificaciones,
// privacidad del directorio, integraciones con LMS/Google/Microsoft.

import React, { useState } from 'react';
import Link from 'next/link';
import StudentShell from '@/components/student/StudentShell';
import { useTema } from '@/lib/common/useTema';
import { useAuth } from '@/context/AuthContext';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';

const SHADOW = 'shadow-[0_12px_32px_-14px_rgba(0,40,55,0.15)]';
const CARD = `rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ${SHADOW}`;
const inputCls = 'w-full rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 font-body-semibold text-on-surface focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30';

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

export default function ConfiguracionPage() {
  const { tema, alternar } = useTema();
  const { user } = useAuth();
  const { perfil, actualizar } = usePerfilEstudiante();
  const [editandoDatos, setEditandoDatos] = useState(false);
  const [nombre, setNombre] = useState(perfil.nombre);
  const [apellidos, setApellidos] = useState(perfil.apellidos);
  const [telefono, setTelefono] = useState(perfil.telefono);
  const [direccion, setDireccion] = useState(perfil.direccion);

  const abrirDatos = () => {
    setNombre(perfil.nombre);
    setApellidos(perfil.apellidos);
    setTelefono(perfil.telefono);
    setDireccion(perfil.direccion);
    setEditandoDatos(true);
  };
  const guardarDatos = () => {
    actualizar({ nombre: nombre.trim(), apellidos: apellidos.trim(), telefono: telefono.trim(), direccion: direccion.trim() });
    setEditandoDatos(false);
  };
  const nombreCompleto = `${perfil.nombre} ${perfil.apellidos}`.trim();

  return (
    <StudentShell active="configuracion">
      <div className="mx-auto flex max-w-[900px] flex-col gap-6 p-8">
        <h1 className="font-headline-md text-3xl text-primary">Configuración</h1>

        {/* Datos personales */}
        <Seccion titulo="Datos Personales" icono="badge">
          <Fila
            titulo="Nombre y apellidos"
            descripcion={nombreCompleto || 'Sin nombre registrado'}
            accion={<button type="button" onClick={abrirDatos} className={botonSecundario}>Editar</button>}
          />
          <Fila
            titulo="Correo electrónico"
            descripcion={`${user?.email ?? 'Sin correo'} — usado para iniciar sesión, no es editable`}
            accion={<span className="material-symbols-outlined text-on-surface-variant">lock</span>}
          />
          <Fila
            titulo="Teléfono"
            descripcion={perfil.telefono || 'Sin teléfono registrado'}
            accion={<button type="button" onClick={abrirDatos} className={botonSecundario}>Editar</button>}
          />
          <Fila
            titulo="Dirección"
            descripcion={perfil.direccion || 'Sin dirección registrada'}
            accion={<button type="button" onClick={abrirDatos} className={botonSecundario}>Editar</button>}
          />
        </Seccion>

        {/* Preferencias del Sistema */}
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

        {/* Ayuda */}
        <Seccion titulo="Ayuda" icono="help">
          <Fila
            titulo="Ayuda y soporte"
            descripcion="Preguntas frecuentes, guías y contacto con soporte."
            accion={<Link href="/ayuda" className={botonSecundario}>Ir a Ayuda</Link>}
          />
        </Seccion>
      </div>

      {/* Modal: editar datos personales */}
      {editandoDatos && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-headline-md text-lg text-primary">Datos personales</h3>
              <button type="button" onClick={() => setEditandoDatos(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nombre</span>
                  <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="María" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Apellidos</span>
                  <input className={inputCls} value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Pérez Solano" />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Teléfono</span>
                <input className={inputCls} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="8888-8888" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Dirección</span>
                <input className={inputCls} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="San José, Costa Rica" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEditandoDatos(false)} className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant">Cancelar</button>
              <button type="button" onClick={guardarDatos} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary">
                <span className="material-symbols-outlined text-base">check</span> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentShell>
  );
}
