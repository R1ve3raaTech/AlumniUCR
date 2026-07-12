-- Tabla para las consultas de soporte enviadas desde el Centro de Ayuda por
-- personas visitantes. Ejecutar en el editor SQL de Supabase cuando se quiera
-- migrar el store en archivo (consultas.store.js) a la BD.

create table if not exists public.consultas_soporte (
  id uuid primary key default gen_random_uuid(),
  nombre varchar not null,
  apellidos varchar not null,
  cedula varchar not null,
  telefono varchar not null,
  mensaje text not null,
  estado varchar not null default 'nueva',   -- nueva | atendida
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- El backend usa la service_role (omite RLS). Se habilita RLS sin políticas
-- para impedir el acceso directo con la clave anon.
alter table public.consultas_soporte enable row level security;

-- Acceso del backend (service_role). Recordar otorgar permisos a la tabla.
grant select, insert, update on public.consultas_soporte to service_role;

comment on table public.consultas_soporte is
  'Consultas de soporte enviadas desde el Centro de Ayuda por visitantes. Las revisa el administrador en su panel.';
