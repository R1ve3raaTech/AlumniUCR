const sectorService = require('../../services/perfil/sectorService');

// ======================================================
// OBTENER TODOS LOS SECTORES
// ======================================================

const obtenerSectores = async (req, res, next) => {
    try {
        const sectores = await sectorService.obtenerSectores();

        res.status(200).json({
            success: true,
            data: sectores,
            message: 'Sectores obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER SECTOR POR ID
// ======================================================

const obtenerSectorPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const sector = await sectorService.obtenerSectorPorId(id);

        if (!sector) {
            return res.status(404).json({
                success: false,
                message: 'Sector no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: sector,
            message: 'Sector obtenido correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR SECTOR
// ======================================================

const crearSector = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const nuevoSector = await sectorService.crearSector({
            nombre: nombre.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevoSector,
            message: 'Sector creado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR SECTOR
// ======================================================

const actualizarSector = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const sectorActualizado = await sectorService.actualizarSector(id, {
            nombre: nombre.trim()
        });

        res.status(200).json({
            success: true,
            data: sectorActualizado,
            message: 'Sector actualizado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR SECTOR
// ======================================================

const eliminarSector = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado = await sectorService.eliminarSector(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Sector eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR SECTORES POR NOMBRE
// ======================================================

const buscarSectoresPorNombre = async (req, res, next) => {
    try {
        const { nombre } = req.params;

        const sectores = await sectorService.buscarSectoresPorNombre(nombre);

        res.status(200).json({
            success: true,
            data: sectores,
            message: 'Sectores obtenidos correctamente'
        });
    } catch (error) {
        next(error);
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
