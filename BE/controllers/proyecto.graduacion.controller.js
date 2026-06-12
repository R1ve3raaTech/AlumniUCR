const proyectoGraduacionService = require('../services/proyectoGraduacionService');

// ======================================================
// OBTENER TODOS LOS PROYECTOS
// ======================================================

const obtenerProyectosGraduacion = async (req, res, next) => {
    try {
        const proyectos = await proyectoGraduacionService.obtenerProyectosGraduacion();

        res.status(200).json(proyectos);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER PROYECTO POR ID
// ======================================================

const obtenerProyectoGraduacionPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const proyecto = await proyectoGraduacionService.obtenerProyectoGraduacionPorId(id);

        if (!proyecto) {
            return res.status(404).json({
                mensaje: 'Proyecto de graduación no encontrado'
            });
        }

        res.status(200).json(proyecto);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR PROYECTO
// ======================================================

const crearProyectoGraduacion = async (req, res, next) => {
    try {
        const {
            id_estudiante,
            titulo_proyecto,
            descripcion,
            id_tipo_proyecto,
            porcentaje_avance,
            proyecto_finalizado
        } = req.body;

        if (!id_estudiante) {
            return res.status(400).json({
                mensaje: 'El id_estudiante es requerido'
            });
        }

        if (!titulo_proyecto) {
            return res.status(400).json({
                mensaje: 'El titulo_proyecto es requerido'
            });
        }

        const nuevoProyecto = await proyectoGraduacionService.crearProyectoGraduacion({
            id_estudiante,
            titulo_proyecto,
            descripcion,
            id_tipo_proyecto,
            porcentaje_avance,
            proyecto_finalizado
        });

        res.status(201).json({
            mensaje: 'Proyecto de graduación creado correctamente',
            data: nuevoProyecto
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR PROYECTO
// ======================================================

const actualizarProyectoGraduacion = async (req, res, next) => {
    try {
        const { id } = req.params;

        const proyectoActualizado =
            await proyectoGraduacionService.actualizarProyectoGraduacion(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Proyecto de graduación actualizado correctamente',
            data: proyectoActualizado
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR PROYECTO
// ======================================================

const eliminarProyectoGraduacion = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado =
            await proyectoGraduacionService.eliminarProyectoGraduacion(id);

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER PROYECTOS POR USUARIO
// ======================================================

const obtenerProyectosPorUsuario = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;

        const proyectos =
            await proyectoGraduacionService.obtenerProyectosPorUsuario(idUsuario);

        res.status(200).json(proyectos);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER PROYECTOS FINALIZADOS
// ======================================================

const obtenerProyectosFinalizados = async (req, res, next) => {
    try {
        const proyectos =
            await proyectoGraduacionService.obtenerProyectosFinalizados();

        res.status(200).json(proyectos);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR PROYECTOS POR ÁREA TEMÁTICA
// ======================================================

const buscarProyectosPorArea = async (req, res, next) => {
    try {
        const { areaTematica } = req.params;

        const proyectos =
            await proyectoGraduacionService.buscarProyectosPorArea(areaTematica);

        res.status(200).json(proyectos);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerProyectosGraduacion,
    obtenerProyectoGraduacionPorId,
    crearProyectoGraduacion,
    actualizarProyectoGraduacion,
    eliminarProyectoGraduacion,
    obtenerProyectosPorUsuario,
    obtenerProyectosFinalizados,
    buscarProyectosPorArea
};
