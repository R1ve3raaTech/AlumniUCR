const supabase = require('../config/supabase');

/**
 * Middleware para autenticar peticiones utilizando Supabase Auth.
 * Extrae y valida el token de portador (Bearer JWT) y obtiene la información del usuario de Supabase
 * y su respectivo perfil en la base de datos local.
 */
const autenticarUsuario = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                mensaje: 'Acceso no autorizado. Token no proporcionado.'
            });
        }

        const partes = authHeader.split(' ');
        let token;

        if (partes.length === 2 && partes[0].toLowerCase() === 'bearer') {
            token = partes[1];
        } else {
            token = partes[0]; // Soporte para token plano
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                mensaje: 'Acceso no autorizado. Token vacío.'
            });
        }

        // 1. Validar el token con Supabase Auth
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                mensaje: 'Token de autenticación inválido o expirado.',
                error: error ? error.message : null
            });
        }

        // 2. Obtener el perfil del usuario en la tabla 'users' de la base de datos
        // Se usa maybeSingle para evitar excepciones si el perfil aún no se ha creado (ej. flujo de registro)
        const { data: perfil, error: perfilError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (perfilError) {
            const error = new Error('Error al obtener el perfil del usuario en la base de datos.');
            error.statusCode = 500;
            error.originalError = perfilError;
            return next(error);
        }

        // 3. Si el perfil existe, validar si el usuario está activo
        if (perfil && perfil.activo === false) {
            return res.status(403).json({
                success: false,
                mensaje: 'Acceso denegado. Su cuenta ha sido suspendida por la administración.'
            });
        }

        // 4. Inyectar datos de usuario y perfil en el objeto request
        req.user = user;
        req.user.profile = perfil || null; // Será null si es un usuario recién creado en Auth pero no registrado en la BD

        next();
    } catch (err) {
        // Enviar al middleware centralizado de errores
        next(err);
    }
};

module.exports = autenticarUsuario;
