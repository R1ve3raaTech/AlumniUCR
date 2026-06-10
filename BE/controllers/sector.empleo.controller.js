const sectorEmpleoService = require('../services/sectorEmpleoService');

// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerSectoresEmpleo = async (req, res) => {
    try {
        const relaciones =
            await sectorEmpleoService.obtenerSectoresEmpleo();

        res.status(200).json(relaciones);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las relaciones sector-empleo',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerSectorEmpleoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const relacion =
            await sectorEmpleoService.obtenerSectorEmpleoPorId(id);

        res.status(200).json(relacion);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener la relación sector-empleo',
            error: error.message
        });
    }
};

// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearSectorEmpleo = async (req, res) => {
    try {
        const nuevaRelacion =
            await sectorEmpleoService.crearSectorEmpleo(req.body);

        res.status(201).json({
            mensaje: 'Relación sector-empleo creada correctamente',
            data: nuevaRelacion
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear la relación sector-empleo',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarSectorEmpleo = async (req, res) => {
    try {
        const { id } = req.params;

        const relacionActualizada =
            await sectorEmpleoService.actualizarSectorEmpleo(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Relación sector-empleo actualizada correctamente',
            data: relacionActualizada
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar la relación sector-empleo',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarSectorEmpleo = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await sectorEmpleoService.eliminarSectorEmpleo(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar la relación sector-empleo',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER SECTORES POR EMPLEO
// ======================================================

const obtenerSectoresPorEmpleo = async (req, res) => {
    try {
        const { idEmpleo } = req.params;

        const sectores =
            await sectorEmpleoService.obtenerSectoresPorEmpleo(
                idEmpleo
            );

        res.status(200).json(sectores);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los sectores asociados al empleo',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER EMPLEOS POR SECTOR
// ======================================================

const obtenerEmpleosPorSector = async (req, res) => {
    try {
        const { idSector } = req.params;

        const empleos =
            await sectorEmpleoService.obtenerEmpleosPorSector(
                idSector
            );

        res.status(200).json(empleos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los empleos asociados al sector',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerSectoresEmpleo,
    obtenerSectorEmpleoPorId,
    crearSectorEmpleo,
    actualizarSectorEmpleo,
    eliminarSectorEmpleo,
    obtenerSectoresPorEmpleo,
    obtenerEmpleosPorSector
};