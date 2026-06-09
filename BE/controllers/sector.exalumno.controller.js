const sectorExalumnoService = require('../services/sectorExalumnoService');

// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerSectoresExalumno = async (req, res) => {
    try {
        const relaciones =
            await sectorExalumnoService.obtenerSectoresExalumno();

        res.status(200).json(relaciones);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las relaciones sector-exalumno',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerSectorExalumnoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const relacion =
            await sectorExalumnoService.obtenerSectorExalumnoPorId(id);

        res.status(200).json(relacion);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener la relación sector-exalumno',
            error: error.message
        });
    }
};

// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearSectorExalumno = async (req, res) => {
    try {
        const nuevaRelacion =
            await sectorExalumnoService.crearSectorExalumno(req.body);

        res.status(201).json({
            mensaje: 'Relación sector-exalumno creada correctamente',
            data: nuevaRelacion
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear la relación sector-exalumno',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarSectorExalumno = async (req, res) => {
    try {
        const { id } = req.params;

        const relacionActualizada =
            await sectorExalumnoService.actualizarSectorExalumno(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Relación sector-exalumno actualizada correctamente',
            data: relacionActualizada
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar la relación sector-exalumno',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarSectorExalumno = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await sectorExalumnoService.eliminarSectorExalumno(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar la relación sector-exalumno',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER SECTORES POR EXALUMNO
// ======================================================

const obtenerSectoresPorExalumno = async (req, res) => {
    try {
        const { idExalumno } = req.params;

        const sectores =
            await sectorExalumnoService.obtenerSectoresPorExalumno(
                idExalumno
            );

        res.status(200).json(sectores);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los sectores del exalumno',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER EXALUMNOS POR SECTOR
// ======================================================

const obtenerExalumnosPorSector = async (req, res) => {
    try {
        const { idSector } = req.params;

        const exalumnos =
            await sectorExalumnoService.obtenerExalumnosPorSector(
                idSector
            );

        res.status(200).json(exalumnos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los exalumnos del sector',
            error: error.message
        });
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