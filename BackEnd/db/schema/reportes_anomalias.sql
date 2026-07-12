-- Tabla para los reportes (denuncias / quejas / sugerencias) que envían los
-- estudiantes sobre estudiantes o exalumnos. Los revisa el administrador.
-- Ejecutar en el editor SQL de Supabase (migra el store en archivo reportes.store.js).

create table if not exists public.reportes_anomalias (
  id uuid primary key default gen_random_uuid(),
  tipo varchar not null,                          -- Denuncia | Queja | Sugerencia
  persona_tipo varchar not null default '',       -- Estudiante | Exalumno | General
  persona_nombre varchar not null default '',
  persona_identificador varchar not null default '',
  motivo text not null default '',
  descripcion text not null,
  anonimo boolean not null default false,
  -- Quién reportó, para auditoría del admin; al reportado NO se le revela.
  reportado_por uuid,
  reportado_por_nombre varchar not null default '',
  estado varchar not null default 'nueva',        -- nueva | en_revision | resuelta
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- El backend usa la service_role (omite RLS). Se habilita RLS sin políticas
-- para impedir el acceso directo con la clave anon.
alter table public.reportes_anomalias enable row level security;

grant select, insert, update on public.reportes_anomalias to service_role;

comment on table public.reportes_anomalias is
  'Reportes de anomalías (denuncias/quejas/sugerencias) enviados por los usuarios. Los gestiona el administrador en su panel.';
