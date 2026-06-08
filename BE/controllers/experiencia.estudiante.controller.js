const experienciaEstudianteService = require('../services/experienciaEstudianteService');

// ======================================================
// GET - OBTENER TODAS LAS EXPERIENCIAS
// ======================================================
const obtenerExperienciasEstudiante = async (req, res) => {
    try {
        const experiencias = await experienciaEstudianteService.obtenerExperienciasEstudiante();
        res.status(200).json({
            success: true,
            data: experiencias,
            message: 'Experiencias obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener experiencias',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER EXPERIENCIA POR ID
// ======================================================
const obtenerExperienciaPorId = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener experiencia',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR EXPERIENCIA
// ======================================================
const crearExperiencia = async (req, res) => {
    try {
        const { Tipo, IdUsuario, Titulo, Organizacion, FechaInicio, FechaFin, Descripcion } = req.body;

        // Validaciones
        if (!Tipo) {
            return res.status(400).json({
                success: false,
                message: 'El tipo es requerido'
            });
        }

        if (!IdUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El IdUsuario es requerido'
            });
        }

        if (!Titulo) {
            return res.status(400).json({
                success: false,
                message: 'El título es requerido'
            });
        }

        if (!Organizacion) {
            return res.status(400).json({
                success: false,
                message: 'La organización es requerida'
            });
        }

        if (!FechaInicio) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio es requerida'
            });
        }

        if (!FechaFin) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin es requerida'
            });
        }

        if (!Descripcion) {
            return res.status(400).json({
                success: false,
                message: 'La descripción es requerida'
            });
        }

        const nuevaExperiencia = await experienciaEstudianteService.crearExperiencia({
            Tipo: Tipo.trim(),
            IdUsuario,
            Titulo: Titulo.trim(),
            Organizacion: Organizacion.trim(),
            FechaInicio,
            FechaFin,
            Descripcion: Descripcion.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaExperiencia,
            message: 'Experiencia creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear experiencia',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR EXPERIENCIA
// ======================================================
const actualizarExperiencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { Tipo, IdUsuario, Titulo, Organizacion, FechaInicio, FechaFin, Descripcion } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (Tipo !== undefined) datosActualizar.Tipo = Tipo.trim();
        if (IdUsuario !== undefined) datosActualizar.IdUsuario = IdUsuario;
        if (Titulo !== undefined) datosActualizar.Titulo = Titulo.trim();
        if (Organizacion !== undefined) datosActualizar.Organizacion = Organizacion.trim();
        if (FechaInicio !== undefined) datosActualizar.FechaInicio = FechaInicio;
        if (FechaFin !== undefined) datosActualizar.FechaFin = FechaFin;
        if (Descripcion !== undefined) datosActualizar.Descripcion = Descripcion.trim();

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
        res.status(500).json({
            success: false,
            message: 'Error al actualizar experiencia',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR EXPERIENCIA
// ======================================================
const eliminarExperiencia = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al eliminar experiencia',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER EXPERIENCIAS POR USUARIO
// ======================================================
const obtenerExperienciasPorUsuario = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener experiencias por usuario',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER EXPERIENCIAS POR TIPO
// ======================================================
const obtenerExperienciasPorTipo = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener experiencias por tipo',
            error: error.message
        });
    }
};

// ======================================================
// GET - BUSCAR EXPERIENCIAS POR ORGANIZACIÓN
// ======================================================
const buscarExperienciasPorOrganizacion = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al buscar experiencias',
            error: error.message
        });
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