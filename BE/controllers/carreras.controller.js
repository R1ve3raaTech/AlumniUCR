const carrerasService = require('../services/carrerasService');

// ======================================================
// GET - OBTENER TODAS LAS CARRERAS
// ======================================================
const obtenerCarreras = async (req, res) => {
    try {
        const carreras = await carrerasService.obtenerCarreras();
        res.status(200).json({
            success: true,
            data: carreras,
            message: 'Carreras obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener carreras',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER CARRERA POR ID
// ======================================================
const obtenerCarreraPorId = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener carrera',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR CARRERA
// ======================================================
const crearCarrera = async (req, res) => {
    try {
        const { Nombre, IdFacultad } = req.body;

        // Validaciones
        if (!Nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        if (!IdFacultad) {
            return res.status(400).json({
                success: false,
                message: 'El IdFacultad es requerido'
            });
        }

        const nuevaCarrera = await carrerasService.crearCarrera({
            Nombre: Nombre.trim(),
            IdFacultad
        });

        res.status(201).json({
            success: true,
            data: nuevaCarrera,
            message: 'Carrera creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear carrera',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR CARRERA
// ======================================================
const actualizarCarrera = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre, IdFacultad } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (Nombre !== undefined) datosActualizar.Nombre = Nombre.trim();
        if (IdFacultad !== undefined) datosActualizar.IdFacultad = IdFacultad;

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
        res.status(500).json({
            success: false,
            message: 'Error al actualizar carrera',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR CARRERA
// ======================================================
const eliminarCarrera = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al eliminar carrera',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER CARRERAS POR FACULTAD
// ======================================================
const obtenerCarrerasPorFacultad = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener carreras por facultad',
            error: error.message
        });
    }
};

// ======================================================
// GET - BUSCAR CARRERAS POR NOMBRE
// ======================================================
const buscarCarrerasPorNombre = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al buscar carreras',
            error: error.message
        });
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