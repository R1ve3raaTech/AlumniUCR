const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
// Se prefiere la clave secreta (service_role) para operaciones de backend, ya que permite
// saltarse las políticas RLS y gestionar registros de forma segura. Si no está configurada,
// se utiliza la clave anon (pública).
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén presentes y no sean placeholders
const esValido = supabaseUrl && 
                 supabaseKey && 
                 !supabaseUrl.includes('your-project') && 
                 !supabaseKey.includes('your-anon-key');

if (!esValido) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ ADVERTENCIA: Las credenciales de Supabase no están configuradas correctamente en el archivo BE/.env.');
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

module.exports = supabase;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

module.exports = supabase;
