const sectorEmpleoService = require('../services/sectorEmpleoService');

// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerSectoresEmpleo = async (req, res, next) => {
    try {
        const relaciones =
            await sectorEmpleoService.obtenerSectoresEmpleo();

        res.status(200).json({
            success: true,
            data: relaciones,
            message: 'Relaciones sector-empleo obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerSectorEmpleoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const relacion =
            await sectorEmpleoService.obtenerSectorEmpleoPorId(id);

        if (!relacion) {
            return res.status(404).json({
                success: false,
                message: 'Relación sector-empleo no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: relacion,
            message: 'Relación sector-empleo obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearSectorEmpleo = async (req, res, next) => {
    try {
        const { id_empleo, id_sector } = req.body;

        if (!id_empleo) {
            return res.status(400).json({
                success: false,
                message: 'El id_empleo es requerido'
            });
        }

        if (!id_sector) {
            return res.status(400).json({
                success: false,
                message: 'El id_sector es requerido'
            });
        }

        const nuevaRelacion =
            await sectorEmpleoService.crearSectorEmpleo({ id_empleo, id_sector });

        res.status(201).json({
            success: true,
            data: nuevaRelacion,
            message: 'Relación sector-empleo creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarSectorEmpleo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_empleo, id_sector } = req.body;

        const datosActualizar = {};
        if (id_empleo !== undefined) datosActualizar.id_empleo = id_empleo;
        if (id_sector !== undefined) datosActualizar.id_sector = id_sector;

        const relacionActualizada =
            await sectorEmpleoService.actualizarSectorEmpleo(
                id,
                datosActualizar
            );

        if (!relacionActualizada) {
            return res.status(404).json({
                success: false,
                message: 'Relación sector-empleo no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: relacionActualizada,
            message: 'Relación sector-empleo actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarSectorEmpleo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado =
            await sectorEmpleoService.eliminarSectorEmpleo(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Relación sector-empleo eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER SECTORES POR EMPLEO
// ======================================================

const obtenerSectoresPorEmpleo = async (req, res, next) => {
    try {
        const { idEmpleo } = req.params;

        const sectores =
            await sectorEmpleoService.obtenerSectoresPorEmpleo(
                idEmpleo
            );

        res.status(200).json({
            success: true,
            data: sectores,
            message: 'Sectores asociados al empleo obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER EMPLEOS POR SECTOR
// ======================================================

const obtenerEmpleosPorSector = async (req, res, next) => {
    try {
        const { idSector } = req.params;

        const empleos =
            await sectorEmpleoService.obtenerEmpleosPorSector(
                idSector
            );

        res.status(200).json({
            success: true,
            data: empleos,
            message: 'Empleos asociados al sector obtenidos correctamente'
        });
    } catch (error) {
        next(error);
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
