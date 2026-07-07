-- Biografía editable del voluntario desde su dashboard/configuración.
-- Ejecutar en el SQL Editor de Supabase.

alter table public.solicitudes_voluntarios
  add column if not exists biografia text;
