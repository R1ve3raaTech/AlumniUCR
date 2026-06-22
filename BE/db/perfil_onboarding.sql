-- Respaldo del perfil de onboarding del estudiante (fuente única).
-- Un registro por usuario; el perfil completo se guarda como JSONB.
-- Ejecutar en el editor SQL de Supabase para crear la tabla.

create table if not exists public.perfil_onboarding (
  id_usuario uuid primary key references public.usuarios(id) on delete cascade,
  datos jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- El backend usa la service_role (omite RLS). Se habilita RLS sin políticas
-- para impedir el acceso directo con la clave anon.
alter table public.perfil_onboarding enable row level security;

-- IMPORTANTE: otorgar permisos a la service_role (si no, "permission denied").
grant select, insert, update, delete on public.perfil_onboarding to service_role;

comment on table public.perfil_onboarding is
  'Perfil de onboarding del estudiante (fuente única). Lo lee y escribe el frontend del estudiante.';
