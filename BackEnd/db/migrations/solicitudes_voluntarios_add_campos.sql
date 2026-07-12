-- Campos nuevos para el formulario dinámico de /voluntariado (tipos de ayuda:
-- donación, pasantía, mentoría, taller). Todos opcionales: el formulario
-- histórico de /registro/otros sigue funcionando igual, sin estos campos.
-- Ejecutar en el SQL Editor de Supabase.

alter table public.solicitudes_voluntarios
  add column if not exists tipo_ayuda varchar,   -- donacion | pasantia | mentoria | taller
  add column if not exists area varchar,          -- área temática de interés
  add column if not exists modalidad varchar,     -- presencial | remoto | hibrido
  add column if not exists monto numeric,         -- solo donación
  add column if not exists frecuencia varchar,    -- solo donación
  add column if not exists empresa varchar,       -- solo pasantía
  add column if not exists duracion varchar,      -- solo pasantía
  add column if not exists tema varchar;          -- solo mentoría/taller

-- El formulario de /voluntariado no pide teléfono/organización/área de
-- colaboración/disponibilidad (esos son del formulario histórico de
-- /registro/otros): se relaja el NOT NULL para que ambos formularios convivan.
alter table public.solicitudes_voluntarios
  alter column telefono drop not null,
  alter column organizacion drop not null,
  alter column area_colaboracion drop not null,
  alter column disponibilidad drop not null;
