const sedeUCRService = require('../services/sedeUCRService');

// ======================================================
// OBTENER TODAS LAS SEDES UCR
// ======================================================

const obtenerSedesUCR = async (req, res) => {
    try {
        const sedes = await sedeUCRService.obtenerSedesUCR();

        res.status(200).json(sedes);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las sedes UCR',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER SEDE POR ID
// ======================================================

const obtenerSedeUCRPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const sede = await sedeUCRService.obtenerSedeUCRPorId(id);

        res.status(200).json(sede);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener la sede UCR',
            error: error.message
        });
    }
};

// ======================================================
// CREAR SEDE
// ======================================================

const crearSedeUCR = async (req, res) => {
    try {
        const nuevaSede = await sedeUCRService.crearSedeUCR(req.body);

        res.status(201).json({
            mensaje: 'Sede UCR creada correctamente',
            data: nuevaSede
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear la sede UCR',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR SEDE
// ======================================================

const actualizarSedeUCR = async (req, res) => {
    try {
        const { id } = req.params;

        const sedeActualizada =
            await sedeUCRService.actualizarSedeUCR(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Sede UCR actualizada correctamente',
            data: sedeActualizada
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar la sede UCR',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR SEDE
// ======================================================

const eliminarSedeUCR = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await sedeUCRService.eliminarSedeUCR(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar la sede UCR',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR SEDES POR NOMBRE
// ======================================================

const buscarSedesPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const sedes =
            await sedeUCRService.buscarSedesPorNombre(nombre);

        res.status(200).json(sedes);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar sedes por nombre',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerSedesUCR,
    obtenerSedeUCRPorId,
    crearSedeUCR,
    actualizarSedeUCR,
    eliminarSedeUCR,
    buscarSedesPorNombre
};