const proyectoGraduacionService = require('../services/proyectoGraduacionService');

// ======================================================
// OBTENER TODOS LOS PROYECTOS
// ======================================================

const obtenerProyectosGraduacion = async (req, res) => {
    try {
        const proyectos = await proyectoGraduacionService.obtenerProyectosGraduacion();

        res.status(200).json(proyectos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los proyectos de graduación',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER PROYECTO POR ID
// ======================================================

const obtenerProyectoGraduacionPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const proyecto = await proyectoGraduacionService.obtenerProyectoGraduacionPorId(id);

        res.status(200).json(proyecto);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el proyecto de graduación',
            error: error.message
        });
    }
};

// ======================================================
// CREAR PROYECTO
// ======================================================

const crearProyectoGraduacion = async (req, res) => {
    try {
        const nuevoProyecto = await proyectoGraduacionService.crearProyectoGraduacion(req.body);

        res.status(201).json({
            mensaje: 'Proyecto de graduación creado correctamente',
            data: nuevoProyecto
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el proyecto de graduación',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR PROYECTO
// ======================================================

const actualizarProyectoGraduacion = async (req, res) => {
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
        res.status(500).json({
            mensaje: 'Error al actualizar el proyecto de graduación',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR PROYECTO
// ======================================================

const eliminarProyectoGraduacion = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await proyectoGraduacionService.eliminarProyectoGraduacion(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el proyecto de graduación',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER PROYECTOS POR USUARIO
// ======================================================

const obtenerProyectosPorUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params;

        const proyectos =
            await proyectoGraduacionService.obtenerProyectosPorUsuario(idUsuario);

        res.status(200).json(proyectos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los proyectos del usuario',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER PROYECTOS FINALIZADOS
// ======================================================

const obtenerProyectosFinalizados = async (req, res) => {
    try {
        const proyectos =
            await proyectoGraduacionService.obtenerProyectosFinalizados();

        res.status(200).json(proyectos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los proyectos finalizados',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR PROYECTOS POR ÁREA TEMÁTICA
// ======================================================

const buscarProyectosPorArea = async (req, res) => {
    try {
        const { areaTematica } = req.params;

        const proyectos =
            await proyectoGraduacionService.buscarProyectosPorArea(areaTematica);

        res.status(200).json(proyectos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar proyectos por área temática',
            error: error.message
        });
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