const responsabilidadService = require('../services/responsabilidadService');

// ======================================================
// OBTENER TODAS LAS RESPONSABILIDADES
// ======================================================

const obtenerResponsabilidades = async (req, res) => {
    try {
        const responsabilidades =
            await responsabilidadService.obtenerResponsabilidades();

        res.status(200).json(responsabilidades);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las responsabilidades',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER RESPONSABILIDAD POR ID
// ======================================================

const obtenerResponsabilidadPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const responsabilidad =
            await responsabilidadService.obtenerResponsabilidadPorId(id);

        res.status(200).json(responsabilidad);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener la responsabilidad',
            error: error.message
        });
    }
};

// ======================================================
// CREAR RESPONSABILIDAD
// ======================================================

const crearResponsabilidad = async (req, res) => {
    try {
        const nuevaResponsabilidad =
            await responsabilidadService.crearResponsabilidad(req.body);

        res.status(201).json({
            mensaje: 'Responsabilidad creada correctamente',
            data: nuevaResponsabilidad
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear la responsabilidad',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR RESPONSABILIDAD
// ======================================================

const actualizarResponsabilidad = async (req, res) => {
    try {
        const { id } = req.params;

        const responsabilidadActualizada =
            await responsabilidadService.actualizarResponsabilidad(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Responsabilidad actualizada correctamente',
            data: responsabilidadActualizada
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar la responsabilidad',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR RESPONSABILIDAD
// ======================================================

const eliminarResponsabilidad = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await responsabilidadService.eliminarResponsabilidad(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar la responsabilidad',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR RESPONSABILIDADES POR NOMBRE
// ======================================================

const buscarResponsabilidadesPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const responsabilidades =
            await responsabilidadService.buscarResponsabilidadesPorNombre(
                nombre
            );

        res.status(200).json(responsabilidades);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar responsabilidades por nombre',
            error: error.message
        });
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