/**
 * Middleware para restringir el acceso a ciertos roles de usuario.
 * Requiere que se haya ejecutado previamente el middleware 'auth.middleware' (para tener req.user).
 *
 * @param {string|string[]} rolesPermitidos - El rol o los roles autorizados para acceder (ej. 'admin', ['admin', 'exalumno'])
 */
const exigirRol = (rolesPermitidos) => {
    return (req, res, next) => {
        try {
            // 1. Validar que el usuario esté autenticado
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    mensaje: 'Acceso no autorizado. Debe iniciar sesión primero.'
                });
            }

            // 2. Validar que tenga un perfil cargado en la base de datos
            if (!req.user.profile) {
                return res.status(403).json({
                    success: false,
                    mensaje: 'Acceso denegado. El perfil de usuario no ha sido completado o no existe.'
                });
            }

            // 3. Obtener el nombre del rol desde el join con la tabla roles
            const rolUsuario = req.user.profile.roles?.nombre
                ? req.user.profile.roles.nombre.toLowerCase().trim()
                : '';

            // 4. Formatear roles permitidos como arreglo para búsqueda uniforme
            const roles = (Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos])
                .map(r => typeof r === 'string' ? r.toLowerCase().trim() : r);

            // 5. Validar el rol del usuario contra los permitidos
            if (!roles.includes(rolUsuario)) {
                return res.status(403).json({
                    success: false,
                    mensaje: `Acceso denegado. Se requiere alguno de los siguientes roles: [${roles.join(', ')}]. Su rol actual es: '${rolUsuario}'.`
                });
            }

            // Si pasa todas las validaciones, continuar con el siguiente middleware/controlador
            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = exigirRol;