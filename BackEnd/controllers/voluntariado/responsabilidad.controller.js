const responsabilidadService = require('../../services/voluntariado/responsabilidadService');

// ======================================================
// OBTENER TODAS LAS RESPONSABILIDADES
// ======================================================

const obtenerResponsabilidades = async (req, res, next) => {
    try {
        const responsabilidades =
            await responsabilidadService.obtenerResponsabilidades();

        res.status(200).json(responsabilidades);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER RESPONSABILIDAD POR ID
// ======================================================

const obtenerResponsabilidadPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const responsabilidad =
            await responsabilidadService.obtenerResponsabilidadPorId(id);

        if (!responsabilidad) {
            return res.status(404).json({
                mensaje: 'Responsabilidad no encontrada'
            });
        }

        res.status(200).json(responsabilidad);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR RESPONSABILIDAD
// ======================================================

const crearResponsabilidad = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                mensaje: 'El nombre es requerido'
            });
        }

        const nuevaResponsabilidad =
            await responsabilidadService.crearResponsabilidad({
                nombre: nombre.trim()
            });

        res.status(201).json({
            mensaje: 'Responsabilidad creada correctamente',
            data: nuevaResponsabilidad
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR RESPONSABILIDAD
// ======================================================

const actualizarResponsabilidad = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        const responsabilidadActualizada =
            await responsabilidadService.actualizarResponsabilidad(id, {
                nombre
            });

        res.status(200).json({
            mensaje: 'Responsabilidad actualizada correctamente',
            data: responsabilidadActualizada
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR RESPONSABILIDAD
// ======================================================

const eliminarResponsabilidad = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado =
            await responsabilidadService.eliminarResponsabilidad(id);

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR RESPONSABILIDADES POR NOMBRE
// ======================================================

const buscarResponsabilidadesPorNombre = async (req, res, next) => {
    try {
        const { nombre } = req.params;

        const responsabilidades =
            await responsabilidadService.buscarResponsabilidadesPorNombre(
                nombre
            );

        res.status(200).json(responsabilidades);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerResponsabilidades,
    obtenerResponsabilidadPorId,
    crearResponsabilidad,
    actualizarResponsabilidad,
    eliminarResponsabilidad,
    buscarResponsabilidadesPorNombre
};
