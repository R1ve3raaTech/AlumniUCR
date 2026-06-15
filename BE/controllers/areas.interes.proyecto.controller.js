const areasInteresProyectoService = require('../services/areasInteresProyectoService');

// ======================================================
// GET - OBTENER TODAS LAS RELACIONES
// ======================================================
const obtenerAreasInteresProyecto = async (req, res, next) => {
    try {
        const relaciones = await areasInteresProyectoService.obtenerAreasInteresProyecto();
        res.status(200).json({
            success: true,
            data: relaciones,
            message: 'Relaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER RELACIÓN POR ID
// ======================================================
const obtenerAreaInteresProyectoPorId = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// POST - CREAR RELACIÓN
// ======================================================
const crearAreaInteresProyecto = async (req, res, next) => {
    try {
        const { id_proyecto, id_area_tematica } = req.body;

        // Validaciones
        if (!id_proyecto) {
            return res.status(400).json({
                success: false,
                message: 'El id_proyecto es requerido'
            });
        }

        if (!id_area_tematica) {
            return res.status(400).json({
                success: false,
                message: 'El id_area_tematica es requerido'
            });
        }

        const nuevaRelacion = await areasInteresProyectoService.crearAreaInteresProyecto({
            id_proyecto,
            id_area_tematica
        });

        res.status(201).json({
            success: true,
            data: nuevaRelacion,
            message: 'Relación creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR RELACIÓN
// ======================================================
const actualizarAreaInteresProyecto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_proyecto, id_area_tematica } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (id_proyecto !== undefined) datosActualizar.id_proyecto = id_proyecto;
        if (id_area_tematica !== undefined) datosActualizar.id_area_tematica = id_area_tematica;

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
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR RELACIÓN
// ======================================================
const eliminarAreaInteresProyecto = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - OBTENER ÁREAS POR PROYECTO
// ======================================================
const obtenerAreasPorProyecto = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - OBTENER PROYECTOS POR ÁREA TEMÁTICA
// ======================================================
const obtenerProyectosPorArea = async (req, res, next) => {
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
        next(error);
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
