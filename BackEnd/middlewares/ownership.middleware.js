const supabase = require('../config/supabase');

/**
 * Middlewares de verificación de PROPIEDAD del recurso (anti-IDOR).
 *
 * Por qué existen: `exigirRol` solo comprueba QUÉ ES el usuario, no si el
 * recurso le pertenece. Varios endpoints recibían un id por la URL y lo
 * pasaban directo al servicio, así que un estudiante autenticado podía
 * editar o borrar los datos de OTRO estudiante cambiando el id en la URL
 * (mismo patrón que el IDOR ya corregido en donaciones, commit 29589b9).
 *
 * El backend opera con la clave service_role de Supabase, que omite RLS: la
 * base de datos NO es una red de seguridad acá. Toda la autorización depende
 * de estas comprobaciones, así que cualquier endpoint que exponga un recurso
 * de un usuario concreto debe pasar por uno de estos middlewares.
 *
 * El rol 'admin' siempre pasa: la gestión de la plataforma es su función.
 *
 * Todos asumen que `auth.middleware` corrió antes (necesitan req.user).
 */

const esAdmin = (req) =>
    req.user?.profile?.roles?.nombre?.toLowerCase().trim() === 'admin';

const prohibido = (res, mensaje) =>
    res.status(403).json({ success: false, mensaje });

/**
 * Caso A: el parámetro de la URL ES el id del usuario dueño.
 * Ej: PUT /api/informacion-estudiantes/usuario/:idUsuario
 *
 * @param {string} nombreParam Nombre del parámetro (ej. 'idUsuario').
 */
const exigirUsuarioPropio = (nombreParam = 'idUsuario') => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, mensaje: 'Acceso no autorizado.' });
    }
    if (esAdmin(req)) return next();

    const idPedido = req.params[nombreParam];
    if (!idPedido) {
        return res.status(400).json({ success: false, mensaje: 'Falta el identificador del usuario.' });
    }
    if (String(idPedido) !== String(req.user.id)) {
        return prohibido(res, 'No tiene permiso para acceder a los datos de otro usuario.');
    }
    return next();
};

/**
 * Caso B: el parámetro es el id de una FILA; el dueño se lee de esa fila.
 * Ej: PUT /api/habilidades/:id  ->  habilidades_estudiante.id_usuario
 *
 * @param {object}  opciones
 * @param {string}  opciones.tabla         Tabla donde vive la fila.
 * @param {string}  opciones.columnaDueno  Columna que guarda el id del dueño.
 * @param {string} [opciones.param='id']   Nombre del parámetro de la URL.
 * @param {string} [opciones.columnaId='id'] Clave primaria de la tabla.
 */
const exigirPropiedadFila = ({ tabla, columnaDueno, param = 'id', columnaId = 'id' }) =>
    async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, mensaje: 'Acceso no autorizado.' });
            }
            if (esAdmin(req)) return next();

            const idFila = req.params[param];
            if (!idFila) {
                return res.status(400).json({ success: false, mensaje: 'Falta el identificador del recurso.' });
            }

            const { data, error } = await supabase
                .from(tabla)
                .select(columnaDueno)
                .eq(columnaId, idFila)
                .maybeSingle();

            if (error) return next(error);
            // No se revela si la fila existe o no: ambos casos dan 404 para no
            // convertir el endpoint en un detector de ids ajenos.
            if (!data) {
                return res.status(404).json({ success: false, mensaje: 'Recurso no encontrado.' });
            }
            if (String(data[columnaDueno]) !== String(req.user.id)) {
                return res.status(404).json({ success: false, mensaje: 'Recurso no encontrado.' });
            }
            return next();
        } catch (err) {
            return next(err);
        }
    };

/**
 * Caso C: el parámetro es el id de una fila HIJA de un proyecto de graduación.
 * El dueño se resuelve en dos saltos: fila -> id_proyecto -> id_estudiante.
 * Ej: PUT /api/proyectos-necesidades/:id
 *
 * @param {object}  opciones
 * @param {string}  opciones.tabla       Tabla hija (debe tener id_proyecto).
 * @param {string} [opciones.param='id'] Nombre del parámetro de la URL.
 */
const exigirPropiedadViaProyecto = ({ tabla, param = 'id' }) =>
    async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, mensaje: 'Acceso no autorizado.' });
            }
            if (esAdmin(req)) return next();

            const idFila = req.params[param];
            if (!idFila) {
                return res.status(400).json({ success: false, mensaje: 'Falta el identificador del recurso.' });
            }

            const { data: fila, error: errFila } = await supabase
                .from(tabla)
                .select('id_proyecto')
                .eq('id', idFila)
                .maybeSingle();

            if (errFila) return next(errFila);
            if (!fila) {
                return res.status(404).json({ success: false, mensaje: 'Recurso no encontrado.' });
            }

            const { data: proyecto, error: errProy } = await supabase
                .from('proyecto_graduacion')
                .select('id_estudiante')
                .eq('id', fila.id_proyecto)
                .maybeSingle();

            if (errProy) return next(errProy);
            if (!proyecto || String(proyecto.id_estudiante) !== String(req.user.id)) {
                return res.status(404).json({ success: false, mensaje: 'Recurso no encontrado.' });
            }
            return next();
        } catch (err) {
            return next(err);
        }
    };

module.exports = {
    esAdmin,
    exigirUsuarioPropio,
    exigirPropiedadFila,
    exigirPropiedadViaProyecto,
};
