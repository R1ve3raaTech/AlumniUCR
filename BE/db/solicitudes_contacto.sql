-- Tabla para las solicitudes de contacto exalumno/voluntario → estudiante (RF-03).
-- Ejecutar en el editor SQL de Supabase (migra el store en archivo contacto.store.js).

create table if not exists public.solicitudes_contacto (
  id uuid primary key default gen_random_uuid(),
  id_estudiante uuid not null,
  id_exalumno uuid not null,
  nombre_exalumno varchar not null default '',
  mensaje text not null default '',
  estado varchar not null default 'pendiente',   -- pendiente | aceptada | rechazada
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un solo hilo de solicitud por par estudiante-exalumno (el store reactiva
-- la rechazada en lugar de duplicar).
create unique index if not exists solicitudes_contacto_par_unico
  on public.solicitudes_contacto (id_estudiante, id_exalumno);

-- El backend usa la service_role (omite RLS). Se habilita RLS sin políticas
-- para impedir el acceso directo con la clave anon.
alter table public.solicitudes_contacto enable row level security;

grant select, insert, update on public.solicitudes_contacto to service_role;

comment on table public.solicitudes_contacto is
  'Solicitudes de contacto de exalumnos/voluntarios hacia estudiantes (RF-03). Al aceptarla, el exalumno ve beca y correo del estudiante.';
