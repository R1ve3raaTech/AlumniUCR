-- Foto de perfil del voluntario, editable desde su dashboard.
-- Ejecutar en el SQL Editor de Supabase.

alter table public.solicitudes_voluntarios
  add column if not exists foto_perfil text;
