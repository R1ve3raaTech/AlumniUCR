const proyectoNecesidadService = require('../services/proyectoNecesidadService');

// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerProyectoNecesidades = async (req, res) => {
    try {
        const relaciones =
            await proyectoNecesidadService.obtenerProyectoNecesidades();

        res.status(200).json(relaciones);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las relaciones proyecto-necesidad',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerProyectoNecesidadPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const relacion =
            await proyectoNecesidadService.obtenerProyectoNecesidadPorId(id);

        res.status(200).json(relacion);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener la relación proyecto-necesidad',
            error: error.message
        });
    }
};

// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearProyectoNecesidad = async (req, res) => {
    try {
        const nuevaRelacion =
            await proyectoNecesidadService.crearProyectoNecesidad(req.body);

        res.status(201).json({
            mensaje: 'Relación proyecto-necesidad creada correctamente',
            data: nuevaRelacion
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear la relación proyecto-necesidad',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarProyectoNecesidad = async (req, res) => {
    try {
        const { id } = req.params;

        const relacionActualizada =
            await proyectoNecesidadService.actualizarProyectoNecesidad(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Relación proyecto-necesidad actualizada correctamente',
            data: relacionActualizada
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar la relación proyecto-necesidad',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarProyectoNecesidad = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await proyectoNecesidadService.eliminarProyectoNecesidad(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar la relación proyecto-necesidad',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER NECESIDADES POR PROYECTO
// ======================================================

const obtenerNecesidadesPorProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params;

        const necesidades =
            await proyectoNecesidadService.obtenerNecesidadesPorProyecto(
                idProyecto
            );

        res.status(200).json(necesidades);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las necesidades del proyecto',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER PROYECTOS POR NECESIDAD
// ======================================================

const obtenerProyectosPorNecesidad = async (req, res) => {
    try {
        const { idNecesidad } = req.params;

        const proyectos =
            await proyectoNecesidadService.obtenerProyectosPorNecesidad(
                idNecesidad
            );

        res.status(200).json(proyectos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los proyectos asociados a la necesidad',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerProyectoNecesidades,
    obtenerProyectoNecesidadPorId,
    crearProyectoNecesidad,
    actualizarProyectoNecesidad,
    eliminarProyectoNecesidad,
    obtenerNecesidadesPorProyecto,
    obtenerProyectosPorNecesidad
};