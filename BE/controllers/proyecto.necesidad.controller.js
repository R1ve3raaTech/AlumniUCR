const proyectoNecesidadService = require('../services/proyectoNecesidadService');

// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerProyectoNecesidades = async (req, res, next) => {
    try {
        const relaciones =
            await proyectoNecesidadService.obtenerProyectoNecesidades();

        res.status(200).json(relaciones);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerProyectoNecesidadPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const relacion =
            await proyectoNecesidadService.obtenerProyectoNecesidadPorId(id);

        if (!relacion) {
            return res.status(404).json({
                mensaje: 'Relación proyecto-necesidad no encontrada'
            });
        }

        res.status(200).json(relacion);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearProyectoNecesidad = async (req, res, next) => {
    try {
        const { id_proyecto, id_necesidad } = req.body;

        if (!id_proyecto) {
            return res.status(400).json({
                mensaje: 'El id_proyecto es requerido'
            });
        }

        if (!id_necesidad) {
            return res.status(400).json({
                mensaje: 'El id_necesidad es requerido'
            });
        }

        const nuevaRelacion =
            await proyectoNecesidadService.crearProyectoNecesidad({
                id_proyecto,
                id_necesidad
            });

        res.status(201).json({
            mensaje: 'Relación proyecto-necesidad creada correctamente',
            data: nuevaRelacion
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarProyectoNecesidad = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_proyecto, id_necesidad } = req.body;

        const datosActualizar = {};
        if (id_proyecto !== undefined) datosActualizar.id_proyecto = id_proyecto;
        if (id_necesidad !== undefined) datosActualizar.id_necesidad = id_necesidad;

        const relacionActualizada =
            await proyectoNecesidadService.actualizarProyectoNecesidad(
                id,
                datosActualizar
            );

        res.status(200).json({
            mensaje: 'Relación proyecto-necesidad actualizada correctamente',
            data: relacionActualizada
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarProyectoNecesidad = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado =
            await proyectoNecesidadService.eliminarProyectoNecesidad(id);

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER NECESIDADES POR PROYECTO
// ======================================================

const obtenerNecesidadesPorProyecto = async (req, res, next) => {
    try {
        const { idProyecto } = req.params;

        const necesidades =
            await proyectoNecesidadService.obtenerNecesidadesPorProyecto(
                idProyecto
            );

        res.status(200).json(necesidades);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER PROYECTOS POR NECESIDAD
// ======================================================

const obtenerProyectosPorNecesidad = async (req, res, next) => {
    try {
        const { idNecesidad } = req.params;

        const proyectos =
            await proyectoNecesidadService.obtenerProyectosPorNecesidad(
                idNecesidad
            );

        res.status(200).json(proyectos);
    } catch (error) {
        next(error);
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
