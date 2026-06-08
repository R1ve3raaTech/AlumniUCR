const facultadesService = require('../services/facultadesService');

// ======================================================
// GET - OBTENER TODAS LAS FACULTADES
// ======================================================
const obtenerFacultades = async (req, res) => {
    try {
        const facultades = await facultadesService.obtenerFacultades();
        res.status(200).json({
            success: true,
            data: facultades,
            message: 'Facultades obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener facultades',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER FACULTAD POR ID
// ======================================================
const obtenerFacultadPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const facultad = await facultadesService.obtenerFacultadPorId(id);

        if (!facultad) {
            return res.status(404).json({
                success: false,
                message: 'Facultad no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: facultad,
            message: 'Facultad obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener facultad',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR FACULTAD
// ======================================================
const crearFacultad = async (req, res) => {
    try {
        const { Nombre } = req.body;

        // Validaciones
        if (!Nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const nuevaFacultad = await facultadesService.crearFacultad({
            Nombre: Nombre.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaFacultad,
            message: 'Facultad creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear facultad',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR FACULTAD
// ======================================================
const actualizarFacultad = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (Nombre !== undefined) datosActualizar.Nombre = Nombre.trim();

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const facultadActualizada = await facultadesService.actualizarFacultad(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: facultadActualizada,
            message: 'Facultad actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar facultad',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR FACULTAD
// ======================================================
const eliminarFacultad = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await facultadesService.eliminarFacultad(id);

        res.status(200).json({
            success: true,
            message: 'Facultad eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar facultad',
            error: error.message
        });
    }
};

// ======================================================
// GET - BUSCAR FACULTADES POR NOMBRE
// ======================================================
const buscarFacultadesPorNombre = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "nombre" es requerido'
            });
        }

        const facultades = await facultadesService.buscarFacultadesPorNombre(nombre);

        res.status(200).json({
            success: true,
            data: facultades,
            message: 'Búsqueda realizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar facultades',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerFacultades,
    obtenerFacultadPorId,
    crearFacultad,
    actualizarFacultad,
    eliminarFacultad,
    buscarFacultadesPorNombre
};