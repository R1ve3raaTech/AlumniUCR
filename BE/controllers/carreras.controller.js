const carrerasService = require('../services/carrerasService');

// ======================================================
// GET - OBTENER TODAS LAS CARRERAS
// ======================================================
const obtenerCarreras = async (req, res, next) => {
    try {
        const carreras = await carrerasService.obtenerCarreras();
        res.status(200).json({
            success: true,
            data: carreras,
            message: 'Carreras obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER CARRERA POR ID
// ======================================================
const obtenerCarreraPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const carrera = await carrerasService.obtenerCarreraPorId(id);

        if (!carrera) {
            return res.status(404).json({
                success: false,
                message: 'Carrera no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: carrera,
            message: 'Carrera obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// POST - CREAR CARRERA
// ======================================================
const crearCarrera = async (req, res, next) => {
    try {
        const { nombre, id_facultad } = req.body;

        // Validaciones
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        if (!id_facultad) {
            return res.status(400).json({
                success: false,
                message: 'El id_facultad es requerido'
            });
        }

        const nuevaCarrera = await carrerasService.crearCarrera({
            nombre: nombre.trim(),
            id_facultad
        });

        res.status(201).json({
            success: true,
            data: nuevaCarrera,
            message: 'Carrera creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR CARRERA
// ======================================================
const actualizarCarrera = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, id_facultad } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (nombre !== undefined) datosActualizar.nombre = nombre.trim();
        if (id_facultad !== undefined) datosActualizar.id_facultad = id_facultad;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const carreraActualizada = await carrerasService.actualizarCarrera(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: carreraActualizada,
            message: 'Carrera actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR CARRERA
// ======================================================
const eliminarCarrera = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await carrerasService.eliminarCarrera(id);

        res.status(200).json({
            success: true,
            message: 'Carrera eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER CARRERAS POR FACULTAD
// ======================================================
const obtenerCarrerasPorFacultad = async (req, res, next) => {
    try {
        const { idFacultad } = req.params;

        if (!idFacultad) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la facultad es requerido'
            });
        }

        const carreras = await carrerasService.obtenerCarrerasPorFacultad(idFacultad);

        res.status(200).json({
            success: true,
            data: carreras,
            message: 'Carreras obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - BUSCAR CARRERAS POR NOMBRE
// ======================================================
const buscarCarrerasPorNombre = async (req, res, next) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "nombre" es requerido'
            });
        }

        const carreras = await carrerasService.buscarCarrerasPorNombre(nombre);

        res.status(200).json({
            success: true,
            data: carreras,
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
    obtenerCarreras,
    obtenerCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera,
    obtenerCarrerasPorFacultad,
    buscarCarrerasPorNombre
};
