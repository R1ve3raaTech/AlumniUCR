'use client';

import AsistentePasoLayout from '@/components/proyecto-graduacion/AsistentePasoLayout';
import { CampoTexto } from '@/components/proyecto-graduacion/Campo';
import { useProyectoGraduacion, MODALIDADES, type Modalidad } from '@/context/ProyectoGraduacionContext';

export default function ModalidadProyectoPage() {
  const { proyecto, actualizar } = useProyectoGraduacion();

  return (
    <AsistentePasoLayout paso={2} titulo="Modalidad">
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MODALIDADES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => actualizar({ modalidad: m as Modalidad })}
            className={`rounded-xl border p-4 text-left transition ${
              proyecto.modalidad === m
                ? 'border-secondary bg-secondary-container/40 font-body-semibold text-on-surface'
                : 'border-outline-variant/40 text-on-surface-variant hover:border-secondary/50'
            }`}
          >
            <span className="material-symbols-outlined mb-1 block text-xl text-secondary">
              {m === 'Tesis' ? 'menu_book' : m === 'Seminario' ? 'groups' : m === 'Práctica Dirigida' ? 'work' : 'engineering'}
            </span>
            {m}
          </button>
        ))}
      </div>

      {/* El formulario se adapta según la modalidad elegida */}
      {proyecto.modalidad === 'Seminario' && (
        <CampoTexto
          label="Integrantes del seminario"
          value={proyecto.integrantesSeminario}
          onChange={(v) => actualizar({ integrantesSeminario: v })}
          placeholder="Nombres de los demás integrantes del seminario de graduación"
        />
      )}

      {proyecto.modalidad === 'Práctica Dirigida' && (
        <CampoTexto
          label="Empresa o institución de práctica"
          value={proyecto.empresaPractica}
          onChange={(v) => actualizar({ empresaPractica: v })}
          placeholder="Nombre de la empresa/institución donde se realiza la práctica"
        />
      )}

      {proyecto.modalidad === 'Proyecto de Graduación' && (
        <CampoTexto
          label="Entidad colaboradora (opcional)"
          value={proyecto.entidadColaboradora}
          onChange={(v) => actualizar({ entidadColaboradora: v })}
          placeholder="Empresa u organización que colabora con el proyecto, si aplica"
        />
      )}

      {proyecto.modalidad === 'Tesis' && (
        <p className="rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant">
          La modalidad de Tesis no requiere campos adicionales en este paso.
        </p>
      )}

      {!proyecto.modalidad && (
        <p className="text-sm text-on-surface-variant">Selecciona una modalidad para continuar.</p>
      )}
    </AsistentePasoLayout>
  );
}
