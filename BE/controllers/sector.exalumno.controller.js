const sectorExalumnoService = require('../services/sectorExalumnoService');

// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerSectoresExalumno = async (req, res, next) => {
    try {
        const relaciones =
            await sectorExalumnoService.obtenerSectoresExalumno();

        res.status(200).json({
            success: true,
            data: relaciones,
            message: 'Relaciones sector-exalumno obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerSectorExalumnoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const relacion =
            await sectorExalumnoService.obtenerSectorExalumnoPorId(id);

        if (!relacion) {
            return res.status(404).json({
                success: false,
                message: 'Relación sector-exalumno no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: relacion,
            message: 'Relación sector-exalumno obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearSectorExalumno = async (req, res, next) => {
    try {
        const { id_exalumno, id_sector } = req.body;

        if (!id_exalumno) {
            return res.status(400).json({
                success: false,
                message: 'El id_exalumno es requerido'
            });
        }

        if (!id_sector) {
            return res.status(400).json({
                success: false,
                message: 'El id_sector es requerido'
            });
        }

        const nuevaRelacion =
            await sectorExalumnoService.crearSectorExalumno({
                id_exalumno,
                id_sector
            });

        res.status(201).json({
            success: true,
            data: nuevaRelacion,
            message: 'Relación sector-exalumno creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarSectorExalumno = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_exalumno, id_sector } = req.body;

        const datosActualizar = {};
        if (id_exalumno !== undefined) datosActualizar.id_exalumno = id_exalumno;
        if (id_sector !== undefined) datosActualizar.id_sector = id_sector;

        const relacionActualizada =
            await sectorExalumnoService.actualizarSectorExalumno(
                id,
                datosActualizar
            );

        res.status(200).json({
            success: true,
            data: relacionActualizada,
            message: 'Relación sector-exalumno actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarSectorExalumno = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado =
            await sectorExalumnoService.eliminarSectorExalumno(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Relación sector-exalumno eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER SECTORES POR EXALUMNO
// ======================================================

const obtenerSectoresPorExalumno = async (req, res, next) => {
    try {
        const { idExalumno } = req.params;

        const sectores =
            await sectorExalumnoService.obtenerSectoresPorExalumno(
                idExalumno
            );

        res.status(200).json({
            success: true,
            data: sectores,
            message: 'Sectores del exalumno obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER EXALUMNOS POR SECTOR
// ======================================================

const obtenerExalumnosPorSector = async (req, res, next) => {
    try {
        const { idSector } = req.params;

        const exalumnos =
            await sectorExalumnoService.obtenerExalumnosPorSector(
                idSector
            );

        res.status(200).json({
            success: true,
            data: exalumnos,
            message: 'Exalumnos del sector obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerSectoresExalumno,
    obtenerSectorExalumnoPorId,
    crearSectorExalumno,
    actualizarSectorExalumno,
    eliminarSectorExalumno,
    obtenerSectoresPorExalumno,
    obtenerExalumnosPorSector
};
