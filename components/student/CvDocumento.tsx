'use client';

// CV del estudiante renderizado desde la fuente única. Único componente usado en:
// el editor (vista previa en vivo), la impresión/PDF y /mi-curriculum (el CV
// "corregido" ya editado). Así todo refleja lo mismo.

import React from 'react';
import { usePerfilEstudiante } from '@/context/PerfilEstudianteContext';
import { useAuth } from '@/context/AuthContext';

const lista = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="mb-1.5 border-b border-outline-variant pb-1 text-[10px] font-bold uppercase tracking-widest text-primary">{titulo}</h5>
      {children}
    </div>
  );
}

export default function CvDocumento() {
  const { perfil } = usePerfilEstudiante();
  const { user } = useAuth();

  const correo = user?.email || '';
  const tecnicas = lista(perfil.habilidadesTecnicas);
  const blandas = lista(perfil.habilidadesBlandas);
  const idiomas = lista(perfil.idiomas);
  const nombre = `${perfil.nombre} ${perfil.apellidos}`.trim();

  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-white">
      {/* Encabezado */}
      <div className="flex items-center gap-4 bg-primary p-5">
        {perfil.foto ? (
          <img src={perfil.foto} alt="" className="h-16 w-16 rounded-full border-2 border-white object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-white bg-white/15 text-base font-bold text-white">
            {`${perfil.nombre[0] || ''}${perfil.apellidos[0] || ''}`.toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="truncate text-lg font-bold leading-none text-white">{nombre || 'Tu nombre'}</h4>
          <p className="mt-1 truncate text-sm text-primary-fixed">{perfil.cargoDeseado || 'Cargo deseado'}</p>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="space-y-5 p-6 text-xs text-on-surface">
        <Bloque titulo="Contacto">
          {[perfil.ubicacion, correo, perfil.telefono, perfil.linkedin].filter(Boolean).map((x) => (
            <p key={x} className="break-words text-on-surface-variant">{x}</p>
          ))}
        </Bloque>

        {perfil.resumen && (
          <Bloque titulo="Perfil">
            <p className="leading-relaxed text-on-surface-variant">{perfil.resumen}</p>
          </Bloque>
        )}

        {(tecnicas.length > 0 || blandas.length > 0 || idiomas.length > 0) && (
          <Bloque titulo="Habilidades">
            {tecnicas.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1">
                {tecnicas.map((s) => <span key={s} className="rounded bg-secondary-fixed px-1.5 py-0.5 text-[10px] text-primary">{s}</span>)}
              </div>
            )}
            {blandas.length > 0 && <p className="text-on-surface-variant"><span className="font-bold text-primary">Blandas:</span> {blandas.join(', ')}</p>}
            {idiomas.length > 0 && <p className="text-on-surface-variant"><span className="font-bold text-primary">Idiomas:</span> {idiomas.join(', ')}</p>}
          </Bloque>
        )}

        {perfil.experiencias.length > 0 && (
          <Bloque titulo="Experiencia">
            <div className="space-y-2.5">
              {perfil.experiencias.map((e, i) => (
                <div key={i}>
                  <p className="font-bold">{e.puesto || 'Puesto'} <span className="font-normal text-on-surface-variant">· {e.empresa}</span></p>
                  <p className="text-[10px] text-on-surface-variant">{e.periodo}</p>
                  {e.descripcion && <p className="mt-0.5 leading-snug text-on-surface-variant">{e.descripcion}</p>}
                </div>
              ))}
            </div>
          </Bloque>
        )}

        {(perfil.carrera || perfil.sede) && (
          <Bloque titulo="Educación">
            <p className="font-bold">{[perfil.nivel, perfil.carrera].filter(Boolean).join(' en ') || 'Carrera'}</p>
            <p className="text-[10px] text-on-surface-variant">
              Universidad de Costa Rica{perfil.sede ? ` · ${perfil.sede}` : ''}{perfil.anioIngreso ? ` · ${perfil.anioIngreso}` : ''}
            </p>
          </Bloque>
        )}
      </div>
    </div>
  );
}
