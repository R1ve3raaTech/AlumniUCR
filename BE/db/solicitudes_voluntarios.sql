-- Tabla para las solicitudes de voluntarios/colaboradores externos
-- (opción "Otros" del registro). Ejecutar en el editor SQL de Supabase
-- cuando se quiera migrar el store en archivo (voluntarios.store.js) a la BD.

create table if not exists public.solicitudes_voluntarios (
  id uuid primary key default gen_random_uuid(),
  nombre varchar not null,
  correo_electronico varchar not null,
  telefono varchar not null,
  organizacion varchar not null,
  area_colaboracion varchar not null,
  disponibilidad varchar not null,
  mensaje text not null,
  estado varchar not null default 'pendiente',         -- pendiente | aprobado | rechazado
  acceso_proyectos boolean not null default false,
  acceso_mentorias boolean not null default false,
  acceso_estudiantes boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- El backend usa la service_role (omite RLS). Se habilita RLS sin políticas
-- para impedir el acceso directo con la clave anon.
alter table public.solicitudes_voluntarios enable row level security;

comment on table public.solicitudes_voluntarios is
  'Solicitudes de voluntarios/colaboradores externos (opción "Otros" del registro). Las revisa el administrador y otorga acceso a paneles.';
