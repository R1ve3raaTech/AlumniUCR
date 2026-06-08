const certificacionesEstudianteService = require('../services/certificacionesEstudianteService');

// ======================================================
// GET - OBTENER TODAS LAS CERTIFICACIONES
// ======================================================
const obtenerCertificacionesEstudiante = async (req, res) => {
    try {
        const certificaciones = await certificacionesEstudianteService.obtenerCertificacionesEstudiante();
        res.status(200).json({
            success: true,
            data: certificaciones,
            message: 'Certificaciones obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener certificaciones',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER CERTIFICACIÓN POR ID
// ======================================================
const obtenerCertificacionPorId = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener certificación',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR CERTIFICACIÓN
// ======================================================
const crearCertificacion = async (req, res) => {
    try {
        const { IdUsuario, Nombre, Institucion, Fecha, URLVerificacion } = req.body;

        // Validaciones
        if (!IdUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El IdUsuario es requerido'
            });
        }

        if (!Nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la certificación es requerido'
            });
        }

        if (!Institucion) {
            return res.status(400).json({
                success: false,
                message: 'La institución es requerida'
            });
        }

        if (!Fecha) {
            return res.status(400).json({
                success: false,
                message: 'La fecha es requerida'
            });
        }

        const nuevaCertificacion = await certificacionesEstudianteService.crearCertificacion({
            IdUsuario,
            Nombre: Nombre.trim(),
            Institucion: Institucion.trim(),
            Fecha,
            URLVerificacion: URLVerificacion ? URLVerificacion.trim() : null
        });

        res.status(201).json({
            success: true,
            data: nuevaCertificacion,
            message: 'Certificación creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear certificación',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR CERTIFICACIÓN
// ======================================================
const actualizarCertificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { IdUsuario, Nombre, Institucion, Fecha, URLVerificacion } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (IdUsuario !== undefined) datosActualizar.IdUsuario = IdUsuario;
        if (Nombre !== undefined) datosActualizar.Nombre = Nombre.trim();
        if (Institucion !== undefined) datosActualizar.Institucion = Institucion.trim();
        if (Fecha !== undefined) datosActualizar.Fecha = Fecha;
        if (URLVerificacion !== undefined) datosActualizar.URLVerificacion = URLVerificacion ? URLVerificacion.trim() : null;

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
        res.status(500).json({
            success: false,
            message: 'Error al actualizar certificación',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR CERTIFICACIÓN
// ======================================================
const eliminarCertificacion = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al eliminar certificación',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER CERTIFICACIONES POR USUARIO
// ======================================================
const obtenerCertificacionesPorUsuario = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener certificaciones por usuario',
            error: error.message
        });
    }
};

// ======================================================
// GET - BUSCAR CERTIFICACIONES POR NOMBRE
// ======================================================
const buscarCertificacionesPorNombre = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al buscar certificaciones',
            error: error.message
        });
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