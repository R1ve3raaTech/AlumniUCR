const certificacionesEstudianteService = require('../../services/perfil/certificacionesEstudianteService');

// ======================================================
// GET - OBTENER TODAS LAS CERTIFICACIONES
// ======================================================
const obtenerCertificacionesEstudiante = async (req, res, next) => {
    try {
        const certificaciones = await certificacionesEstudianteService.obtenerCertificacionesEstudiante();
        res.status(200).json({
            success: true,
            data: certificaciones,
            message: 'Certificaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER CERTIFICACIÓN POR ID
// ======================================================
const obtenerCertificacionPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const certificacion = await certificacionesEstudianteService.obtenerCertificacionPorId(id);

        if (!certificacion) {
            return res.status(404).json({
                success: false,
                message: 'Certificación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: certificacion,
            message: 'Certificación obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// POST - CREAR CERTIFICACIÓN
// ======================================================
const crearCertificacion = async (req, res, next) => {
    try {
        const { id_usuario, nombre, institucion, fecha, url_verificacion } = req.body;

        // Validaciones
        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'El id_usuario es requerido'
            });
        }

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la certificación es requerido'
            });
        }

        if (!institucion) {
            return res.status(400).json({
                success: false,
                message: 'La institución es requerida'
            });
        }

        if (!fecha) {
            return res.status(400).json({
                success: false,
                message: 'La fecha es requerida'
            });
        }

        const nuevaCertificacion = await certificacionesEstudianteService.crearCertificacion({
            id_usuario,
            nombre: nombre.trim(),
            institucion: institucion.trim(),
            fecha,
            url_verificacion: url_verificacion ? url_verificacion.trim() : null
        });

        res.status(201).json({
            success: true,
            data: nuevaCertificacion,
            message: 'Certificación creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR CERTIFICACIÓN
// ======================================================
const actualizarCertificacion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_usuario, nombre, institucion, fecha, url_verificacion } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (id_usuario !== undefined) datosActualizar.id_usuario = id_usuario;
        if (nombre !== undefined) datosActualizar.nombre = nombre.trim();
        if (institucion !== undefined) datosActualizar.institucion = institucion.trim();
        if (fecha !== undefined) datosActualizar.fecha = fecha;
        if (url_verificacion !== undefined) datosActualizar.url_verificacion = url_verificacion ? url_verificacion.trim() : null;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const certificacionActualizada = await certificacionesEstudianteService.actualizarCertificacion(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: certificacionActualizada,
            message: 'Certificación actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR CERTIFICACIÓN
// ======================================================
const eliminarCertificacion = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await certificacionesEstudianteService.eliminarCertificacion(id);

        res.status(200).json({
            success: true,
            message: 'Certificación eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER CERTIFICACIONES POR USUARIO
// ======================================================
const obtenerCertificacionesPorUsuario = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const certificaciones = await certificacionesEstudianteService.obtenerCertificacionesPorUsuario(idUsuario);

        res.status(200).json({
            success: true,
            data: certificaciones,
            message: 'Certificaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - BUSCAR CERTIFICACIONES POR NOMBRE
// ======================================================
const buscarCertificacionesPorNombre = async (req, res, next) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "nombre" es requerido'
            });
        }

        const certificaciones = await certificacionesEstudianteService.buscarCertificacionesPorNombre(nombre);

        res.status(200).json({
            success: true,
            data: certificaciones,
            message: 'Búsqueda realizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerCertificacionesEstudiante,
    obtenerCertificacionPorId,
    crearCertificacion,
    actualizarCertificacion,
    eliminarCertificacion,
    obtenerCertificacionesPorUsuario,
    buscarCertificacionesPorNombre
};
