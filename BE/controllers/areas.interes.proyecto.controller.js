const areasInteresProyectoService = require('../services/areasInteresProyectoService');

// ======================================================
// GET - OBTENER TODAS LAS RELACIONES
// ======================================================
const obtenerAreasInteresProyecto = async (req, res) => {
    try {
        const relaciones = await areasInteresProyectoService.obtenerAreasInteresProyecto();
        res.status(200).json({
            success: true,
            data: relaciones,
            message: 'Relaciones obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener relaciones',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER RELACIÓN POR ID
// ======================================================
const obtenerAreaInteresProyectoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const relacion = await areasInteresProyectoService.obtenerAreaInteresProyectoPorId(id);

        if (!relacion) {
            return res.status(404).json({
                success: false,
                message: 'Relación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: relacion,
            message: 'Relación obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener relación',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR RELACIÓN
// ======================================================
const crearAreaInteresProyecto = async (req, res) => {
    try {
        const { IdProyecto, IdAreaTematica } = req.body;

        // Validaciones
        if (!IdProyecto) {
            return res.status(400).json({
                success: false,
                message: 'El IdProyecto es requerido'
            });
        }

        if (!IdAreaTematica) {
            return res.status(400).json({
                success: false,
                message: 'El IdAreaTematica es requerido'
            });
        }

        const nuevaRelacion = await areasInteresProyectoService.crearAreaInteresProyecto({
            IdProyecto,
            IdAreaTematica
        });

        res.status(201).json({
            success: true,
            data: nuevaRelacion,
            message: 'Relación creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear relación',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR RELACIÓN
// ======================================================
const actualizarAreaInteresProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const { IdProyecto, IdAreaTematica } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (IdProyecto !== undefined) datosActualizar.IdProyecto = IdProyecto;
        if (IdAreaTematica !== undefined) datosActualizar.IdAreaTematica = IdAreaTematica;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const relacionActualizada = await areasInteresProyectoService.actualizarAreaInteresProyecto(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: relacionActualizada,
            message: 'Relación actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar relación',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR RELACIÓN
// ======================================================
const eliminarAreaInteresProyecto = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await areasInteresProyectoService.eliminarAreaInteresProyecto(id);

        res.status(200).json({
            success: true,
            message: 'Relación eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar relación',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER ÁREAS POR PROYECTO
// ======================================================
const obtenerAreasPorProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params;

        if (!idProyecto) {
            return res.status(400).json({
                success: false,
                message: 'El ID del proyecto es requerido'
            });
        }

        const areas = await areasInteresProyectoService.obtenerAreasPorProyecto(idProyecto);

        res.status(200).json({
            success: true,
            data: areas,
            message: 'Áreas obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener áreas por proyecto',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER PROYECTOS POR ÁREA TEMÁTICA
// ======================================================
const obtenerProyectosPorArea = async (req, res) => {
    try {
        const { idAreaTematica } = req.params;

        if (!idAreaTematica) {
            return res.status(400).json({
                success: false,
                message: 'El ID del área temática es requerido'
            });
        }

        const proyectos = await areasInteresProyectoService.obtenerProyectosPorArea(idAreaTematica);

        res.status(200).json({
            success: true,
            data: proyectos,
            message: 'Proyectos obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener proyectos por área',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerAreasInteresProyecto,
    obtenerAreaInteresProyectoPorId,
    crearAreaInteresProyecto,
    actualizarAreaInteresProyecto,
    eliminarAreaInteresProyecto,
    obtenerAreasPorProyecto,
    obtenerProyectosPorArea
};