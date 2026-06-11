const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;

// Se prefiere la clave secreta (service_role) para operaciones de backend.
// Si no existe, utiliza la clave anónima.
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_ANON_KEY;

// Validar variables de entorno
const esValido =
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseKey.includes('your-anon-key');

if (!esValido) {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    '⚠️ ADVERTENCIA: Las credenciales de Supabase no están configuradas correctamente en el archivo .env.local'
  );
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

module.exports = supabase;