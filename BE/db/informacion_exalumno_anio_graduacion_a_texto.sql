-- Permite guardar un año único (2015) o un rango (1988-1994) en el año de
-- graduación del exalumno, útil cuando cursó varias carreras en distintos
-- períodos. La columna era integer; se amplía a text (los valores enteros
-- existentes se convierten automáticamente sin perder datos).

ALTER TABLE informacion_exalumno
  ALTER COLUMN anio_graduacion TYPE text USING anio_graduacion::text;
