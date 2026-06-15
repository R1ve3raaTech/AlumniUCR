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
            token = partes[0];
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

        // 2. Obtener el perfil del usuario incluyendo el nombre del rol
        const { data: perfil, error: perfilError } = await supabase
            .from('usuarios')
            .select('*, roles(nombre)')
            .eq('id', user.id)
            .maybeSingle();

        if (perfilError) {
            const err = new Error('Error al obtener el perfil del usuario en la base de datos.');
            err.statusCode = 500;
            err.originalError = perfilError;
            return next(err);
        }

        // 3. Si el perfil existe, validar si el usuario está activo
        if (perfil && perfil.estado === 'suspendido') {
            return res.status(403).json({
                success: false,
                mensaje: 'Acceso denegado. Su cuenta ha sido suspendida por la administración.'
            });
        }

        // 4. Inyectar datos de usuario y perfil en el objeto request
        req.user = user;
        req.user.profile = perfil || null;

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = autenticarUsuario;