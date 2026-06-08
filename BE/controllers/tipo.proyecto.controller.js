const tipoProyectoService = require('../services/tipoProyectoService');

// ======================================================
// OBTENER TODOS LOS TIPOS DE PROYECTO
// ======================================================

const obtenerTiposProyecto = async (req, res) => {
    try {
        const tiposProyecto =
            await tipoProyectoService.obtenerTiposProyecto();

        res.status(200).json(tiposProyecto);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los tipos de proyecto',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER TIPO DE PROYECTO POR ID
// ======================================================

const obtenerTipoProyectoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const tipoProyecto =
            await tipoProyectoService.obtenerTipoProyectoPorId(id);

        res.status(200).json(tipoProyecto);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el tipo de proyecto',
            error: error.message
        });
    }
};

// ======================================================
// CREAR TIPO DE PROYECTO
// ======================================================

const crearTipoProyecto = async (req, res) => {
    try {
        const nuevoTipoProyecto =
            await tipoProyectoService.crearTipoProyecto(req.body);

        res.status(201).json({
            mensaje: 'Tipo de proyecto creado correctamente',
            data: nuevoTipoProyecto
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el tipo de proyecto',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR TIPO DE PROYECTO
// ======================================================

const actualizarTipoProyecto = async (req, res) => {
    try {
        const { id } = req.params;

        const tipoProyectoActualizado =
            await tipoProyectoService.actualizarTipoProyecto(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Tipo de proyecto actualizado correctamente',
            data: tipoProyectoActualizado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar el tipo de proyecto',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR TIPO DE PROYECTO
// ======================================================

const eliminarTipoProyecto = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await tipoProyectoService.eliminarTipoProyecto(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el tipo de proyecto',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR TIPOS DE PROYECTO POR NOMBRE
// ======================================================

const buscarTiposProyectoPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const tiposProyecto =
            await tipoProyectoService.buscarTiposProyectoPorNombre(
                nombre
            );

        res.status(200).json(tiposProyecto);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar tipos de proyecto por nombre',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerTiposProyecto,
    obtenerTipoProyectoPorId,
    crearTipoProyecto,
    actualizarTipoProyecto,
    eliminarTipoProyecto,
    buscarTiposProyectoPorNombre
};