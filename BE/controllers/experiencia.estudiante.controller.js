const experienciaEstudianteService = require('../services/experienciaEstudianteService');

// ======================================================
// GET - OBTENER TODAS LAS EXPERIENCIAS
// ======================================================
const obtenerExperienciasEstudiante = async (req, res, next) => {
    try {
        const experiencias = await experienciaEstudianteService.obtenerExperienciasEstudiante();
        res.status(200).json({
            success: true,
            data: experiencias,
            message: 'Experiencias obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER EXPERIENCIA POR ID
// ======================================================
const obtenerExperienciaPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const experiencia = await experienciaEstudianteService.obtenerExperienciaPorId(id);

        if (!experiencia) {
            return res.status(404).json({
                success: false,
                message: 'Experiencia no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: experiencia,
            message: 'Experiencia obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// POST - CREAR EXPERIENCIA
// ======================================================
const crearExperiencia = async (req, res, next) => {
    try {
        const { tipo, id_usuario, titulo, organizacion, fecha_inicio, fecha_fin, descripcion } = req.body;

        // Validaciones
        if (!tipo) {
            return res.status(400).json({
                success: false,
                message: 'El tipo es requerido'
            });
        }

        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'El IdUsuario es requerido'
            });
        }

        if (!titulo) {
            return res.status(400).json({
                success: false,
                message: 'El título es requerido'
            });
        }

        if (!organizacion) {
            return res.status(400).json({
                success: false,
                message: 'La organización es requerida'
            });
        }

        if (!fecha_inicio) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio es requerida'
            });
        }

        if (!fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin es requerida'
            });
        }

        if (!descripcion) {
            return res.status(400).json({
                success: false,
                message: 'La descripción es requerida'
            });
        }

        const nuevaExperiencia = await experienciaEstudianteService.crearExperiencia({
            tipo: tipo.trim(),
            id_usuario,
            titulo: titulo.trim(),
            organizacion: organizacion.trim(),
            fecha_inicio,
            fecha_fin,
            descripcion: descripcion.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaExperiencia,
            message: 'Experiencia creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR EXPERIENCIA
// ======================================================
const actualizarExperiencia = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tipo, id_usuario, titulo, organizacion, fecha_inicio, fecha_fin, descripcion } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (tipo !== undefined) datosActualizar.tipo = tipo.trim();
        if (id_usuario !== undefined) datosActualizar.id_usuario = id_usuario;
        if (titulo !== undefined) datosActualizar.titulo = titulo.trim();
        if (organizacion !== undefined) datosActualizar.organizacion = organizacion.trim();
        if (fecha_inicio !== undefined) datosActualizar.fecha_inicio = fecha_inicio;
        if (fecha_fin !== undefined) datosActualizar.fecha_fin = fecha_fin;
        if (descripcion !== undefined) datosActualizar.descripcion = descripcion.trim();

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const experienciaActualizada = await experienciaEstudianteService.actualizarExperiencia(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: experienciaActualizada,
            message: 'Experiencia actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR EXPERIENCIA
// ======================================================
const eliminarExperiencia = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await experienciaEstudianteService.eliminarExperiencia(id);

        res.status(200).json({
            success: true,
            message: 'Experiencia eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER EXPERIENCIAS POR USUARIO
// ======================================================
const obtenerExperienciasPorUsuario = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const experiencias = await experienciaEstudianteService.obtenerExperienciasPorUsuario(idUsuario);

        res.status(200).json({
            success: true,
            data: experiencias,
            message: 'Experiencias obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER EXPERIENCIAS POR TIPO
// ======================================================
const obtenerExperienciasPorTipo = async (req, res, next) => {
    try {
        const { tipo } = req.params;

        if (!tipo) {
            return res.status(400).json({
                success: false,
                message: 'El tipo es requerido'
            });
        }

        const experiencias = await experienciaEstudianteService.obtenerExperienciasPorTipo(tipo);

        res.status(200).json({
            success: true,
            data: experiencias,
            message: 'Experiencias obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - BUSCAR EXPERIENCIAS POR ORGANIZACIÓN
// ======================================================
const buscarExperienciasPorOrganizacion = async (req, res, next) => {
    try {
        const { organizacion } = req.query;

        if (!organizacion) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "organizacion" es requerido'
            });
        }

        const experiencias = await experienciaEstudianteService.buscarExperienciasPorOrganizacion(organizacion);

        res.status(200).json({
            success: true,
            data: experiencias,
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
    obtenerExperienciasEstudiante,
    obtenerExperienciaPorId,
    crearExperiencia,
    actualizarExperiencia,
    eliminarExperiencia,
    obtenerExperienciasPorUsuario,
    obtenerExperienciasPorTipo,
    buscarExperienciasPorOrganizacion
};
