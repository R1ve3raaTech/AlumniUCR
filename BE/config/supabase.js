const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // o SUPABASE_ANON_KEY según corresponda

// Validar que las variables de entorno estén presentes y no sean placeholders
const esValido = supabaseUrl &&
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
            persistSession: false, // El backend debe ser sin estado, no persistir sesiones locales
            autoRefreshToken: false // No es necesario refrescar tokens en backend stateless
        }
    }
);

console.log("SUPABASE URL:", supabaseUrl);
console.log("KEY USADA:", supabaseKey);

module.exports = supabase;