-- Espacio de Comunidad: Blogs (aportes de estudiantes/exalumnos, aprobados por
-- el administrador) y Eventos (creados por la administración). Ejecutar en el
-- editor SQL de Supabase. El backend usa la service_role (omite RLS); se habilita
-- RLS sin políticas para bloquear el acceso directo con la clave anon.

-- ── BLOGS ──────────────────────────────────────────────────────────────────
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  id_autor uuid references public.usuarios(id) on delete set null,
  autor_nombre varchar not null,
  autor_rol varchar not null default 'estudiante',          -- estudiante | exalumno
  tipo varchar not null default 'noticia',                  -- noticia | sugerencia | comentario
  titulo varchar not null,
  contenido text not null,
  estado varchar not null default 'pendiente',              -- pendiente | aprobado | rechazado
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blogs enable row level security;
grant select, insert, update, delete on public.blogs to service_role;
create index if not exists blogs_estado_idx on public.blogs (estado, created_at desc);

comment on table public.blogs is
  'Aportes de la comunidad (noticias, sugerencias, comentarios) de estudiantes y exalumnos. Se publican tras la aprobacion del administrador.';

-- ── EVENTOS ────────────────────────────────────────────────────────────────
create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  titulo varchar not null,
  descripcion text not null,
  fecha date not null,
  hora time,
  lugar varchar not null,
  id_autor uuid references public.usuarios(id) on delete set null,
  autor_nombre varchar,
  estado varchar not null default 'aprobado',               -- pendiente | aprobado | rechazado
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.eventos enable row level security;
grant select, insert, update, delete on public.eventos to service_role;
create index if not exists eventos_fecha_idx on public.eventos (estado, fecha);

comment on table public.eventos is
  'Eventos de la comunidad (fecha, hora, lugar, descripcion). Gestionados por la administracion y visibles en el espacio de Comunidad.';
