-- Permite guardar un año único (2015) o un rango (1988-1994) en el año de
-- graduación del exalumno, útil cuando cursó varias carreras en distintos
-- períodos. La columna real es carreras_usuario.ano_graduacion (era
-- integer); se amplía a text. El registro en sí (auth.service.js) guarda el
-- valor en user_metadata (JSON sin esquema, no requiere migración) — esta
-- migración es necesaria para cuando el exalumno EDITA su perfil, que sí
-- escribe en esta tabla real.

ALTER TABLE carreras_usuario
  ALTER COLUMN ano_graduacion TYPE text USING ano_graduacion::text;
