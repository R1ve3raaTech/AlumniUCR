const tipoProyectoService = require('../services/tipoProyectoService');

// ======================================================
// OBTENER TODOS LOS TIPOS DE PROYECTO
// ======================================================

const obtenerTiposProyecto = async (req, res, next) => {
    try {
        const tiposProyecto =
            await tipoProyectoService.obtenerTiposProyecto();

        res.status(200).json(tiposProyecto);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER TIPO DE PROYECTO POR ID
// ======================================================

const obtenerTipoProyectoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tipoProyecto =
            await tipoProyectoService.obtenerTipoProyectoPorId(id);

        if (!tipoProyecto) {
            return res.status(404).json({
                mensaje: 'Tipo de proyecto no encontrado'
            });
        }

        res.status(200).json(tipoProyecto);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR TIPO DE PROYECTO
// ======================================================

const crearTipoProyecto = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                mensaje: 'El nombre es requerido'
            });
        }

        const nuevoTipoProyecto =
            await tipoProyectoService.crearTipoProyecto({
                nombre: nombre.trim()
            });

        res.status(201).json({
            mensaje: 'Tipo de proyecto creado correctamente',
            data: nuevoTipoProyecto
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR TIPO DE PROYECTO
// ======================================================

const actualizarTipoProyecto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                mensaje: 'El nombre es requerido'
            });
        }

        const tipoProyectoActualizado =
            await tipoProyectoService.actualizarTipoProyecto(
                id,
                { nombre: nombre.trim() }
            );

        if (!tipoProyectoActualizado) {
            return res.status(404).json({
                mensaje: 'Tipo de proyecto no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Tipo de proyecto actualizado correctamente',
            data: tipoProyectoActualizado
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR TIPO DE PROYECTO
// ======================================================

const eliminarTipoProyecto = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado =
            await tipoProyectoService.eliminarTipoProyecto(id);

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR TIPOS DE PROYECTO POR NOMBRE
// ======================================================

const buscarTiposProyectoPorNombre = async (req, res, next) => {
    try {
        const { nombre } = req.params;

        const tiposProyecto =
            await tipoProyectoService.buscarTiposProyectoPorNombre(
                nombre
            );

        res.status(200).json(tiposProyecto);
    } catch (error) {
        next(error);
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
