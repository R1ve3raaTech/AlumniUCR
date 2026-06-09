const sectorService = require('../services/sectorService');

// ======================================================
// OBTENER TODOS LOS SECTORES
// ======================================================

const obtenerSectores = async (req, res) => {
    try {
        const sectores = await sectorService.obtenerSectores();

        res.status(200).json(sectores);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los sectores',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER SECTOR POR ID
// ======================================================

const obtenerSectorPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const sector = await sectorService.obtenerSectorPorId(id);

        res.status(200).json(sector);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el sector',
            error: error.message
        });
    }
};

// ======================================================
// CREAR SECTOR
// ======================================================

const crearSector = async (req, res) => {
    try {
        const nuevoSector = await sectorService.crearSector(req.body);

        res.status(201).json({
            mensaje: 'Sector creado correctamente',
            data: nuevoSector
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el sector',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR SECTOR
// ======================================================

const actualizarSector = async (req, res) => {
    try {
        const { id } = req.params;

        const sectorActualizado =
            await sectorService.actualizarSector(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Sector actualizado correctamente',
            data: sectorActualizado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar el sector',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR SECTOR
// ======================================================

const eliminarSector = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await sectorService.eliminarSector(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el sector',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR SECTORES POR NOMBRE
// ======================================================

const buscarSectoresPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const sectores =
            await sectorService.buscarSectoresPorNombre(nombre);

        res.status(200).json(sectores);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar sectores por nombre',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerSectores,
    obtenerSectorPorId,
    crearSector,
    actualizarSector,
    eliminarSector,
    buscarSectoresPorNombre
};