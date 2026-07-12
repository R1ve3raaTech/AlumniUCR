const facultadesService = require('../../services/perfil/facultadesService');

// ======================================================
// GET - OBTENER TODAS LAS FACULTADES
// ======================================================
const obtenerFacultades = async (req, res, next) => {
    try {
        const facultades = await facultadesService.obtenerFacultades();
        res.status(200).json({
            success: true,
            data: facultades,
            message: 'Facultades obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER FACULTAD POR ID
// ======================================================
const obtenerFacultadPorId = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// POST - CREAR FACULTAD
// ======================================================
const crearFacultad = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        // Validaciones
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const nuevaFacultad = await facultadesService.crearFacultad({
            nombre: nombre.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaFacultad,
            message: 'Facultad creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR FACULTAD
// ======================================================
const actualizarFacultad = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (nombre !== undefined) datosActualizar.nombre = nombre.trim();

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
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR FACULTAD
// ======================================================
const eliminarFacultad = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - BUSCAR FACULTADES POR NOMBRE
// ======================================================
const buscarFacultadesPorNombre = async (req, res, next) => {
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
        next(error);
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
