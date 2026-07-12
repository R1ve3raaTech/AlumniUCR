/**
 * Mapea un error de PostgREST/Postgres a un statusCode HTTP apropiado para que
 * el error.middleware responda con el código correcto en vez de un 500 genérico.
 *
 * El cliente @supabase/supabase-js expone el SQLSTATE de Postgres en `error.code`.
 * Uso en los services:  if (error) throw mapDbError(error);
 */
const PG_STATUS = {
  '23505': 409, // unique_violation        -> conflicto (correo/clave duplicada)
  '23503': 400, // foreign_key_violation    -> referencia a un registro inexistente
  '23502': 400, // not_null_violation        -> falta un campo obligatorio
  '23514': 400, // check_violation           -> valor fuera de las reglas
  '22P02': 400, // invalid_text_representation-> uuid/entero mal formado
};

const mapDbError = (error) => {
  if (error && !error.statusCode) {
    if (error.code === 'PGRST116') {
      // PostgREST: 0 filas en una consulta .single() => recurso no encontrado.
      error.statusCode = 404;
    } else if (PG_STATUS[error.code]) {
      error.statusCode = PG_STATUS[error.code];
    }
    // Sin coincidencia => sin statusCode => el middleware responde 500.
  }
  return error;
};

module.exports = { mapDbError };
