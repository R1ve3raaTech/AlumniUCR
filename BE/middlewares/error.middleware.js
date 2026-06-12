require('dotenv').config({ path: '../.env.local' });

/**
 * Middleware centralizado para el manejo de errores en Express.
 * Captura cualquier error lanzado en la aplicación o pasado a next().
 */
const gestionarErrores = (err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    
    // Loggear el error detalladamente en consola para depuración
    console.error(`\x1b[31m[ERROR] [${req.method}] ${req.originalUrl}\x1b[0m`);
    console.error(err.stack || err);

    // Determinar si mostrar detalles del error según el entorno
    const mostrarDetalles = process.env.NODE_ENV === 'development';

    res.status(statusCode).json({
        success: false,
        mensaje: err.message || 'Ha ocurrido un error interno en el servidor.',
        ...(mostrarDetalles && { 
            error: err.message,
            stack: err.stack 
        })
    });
};

module.exports = gestionarErrores;
