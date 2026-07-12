const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén presentes y no sean placeholders
const esValido = supabaseUrl && 
                 supabaseKey && 
                 !supabaseUrl.includes('your-project') && 
                 !supabaseKey.includes('your-anon-key');

if (!esValido) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ ADVERTENCIA: Las credenciales de Supabase no están configuradas correctamente en el archivo BackEnd/.env.');
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

// No imprimir la URL ni la key en consola: la service-role key otorga acceso
// total a la base y no debe quedar en logs (terminales, CI, hosting).

module.exports = supabase;