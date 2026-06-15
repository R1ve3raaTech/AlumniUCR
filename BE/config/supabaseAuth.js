const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Cliente Supabase DEDICADO exclusivamente a las operaciones de autenticación que
// generan o cambian una sesión (signUp, signInWithPassword, signInWithOtp, verifyOtp).
//
// Motivo: el cliente principal (config/supabase.js) usa la clave service_role para las
// consultas a la base de datos. Si se usara ese mismo cliente para iniciar sesión, la
// sesión del usuario quedaría guardada en memoria y las siguientes llamadas .from()
// correrían con el rol 'authenticated' (sin permisos de service_role), provocando
// errores como "permission denied for sequence". Manteniendo un cliente separado para
// el login, el cliente principal siempre opera como service_role.
//
// Usa la clave pública (anon); el login no requiere privilegios elevados.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SECRET_KEY;

const supabaseAuth = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    },
);

module.exports = supabaseAuth;
