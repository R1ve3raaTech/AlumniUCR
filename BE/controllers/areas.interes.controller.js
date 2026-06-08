const areasInteresService = require('../services/areasInteresService');

// ======================================================
// GET - OBTENER TODAS LAS ÁREAS DE INTERÉS
// ======================================================
const obtenerAreasInteres = async (req, res) => {
    try {
        const areas = await areasInteresService.obtenerAreasInteres();
        res.status(200).json({
            success: true,
            data: areas,
            message: 'Áreas de interés obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener áreas de interés',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER ÁREA DE INTERÉS POR ID
// ======================================================
const obtenerAreaInteresPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const area = await areasInteresService.obtenerAreaInteresPorId(id);

        if (!area) {
            return res.status(404).json({
                success: false,
                message: 'Área de interés no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: area,
            message: 'Área de interés obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener área de interés',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR ÁREA DE INTERÉS
// ======================================================
const crearAreaInteres = async (req, res) => {
    try {
        const { Nombre, Descripcion } = req.body;

        // Validaciones
        if (!Nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        if (!Descripcion) {
            return res.status(400).json({
                success: false,
                message: 'La descripción es requerida'
            });
        }

        const nuevaArea = await areasInteresService.crearAreaInteres({
            Nombre: Nombre.trim(),
            Descripcion: Descripcion.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaArea,
            message: 'Área de interés creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear área de interés',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR ÁREA DE INTERÉS
// ======================================================
const actualizarAreaInteres = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre, Descripcion } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (Nombre !== undefined) datosActualizar.Nombre = Nombre.trim();
        if (Descripcion !== undefined) datosActualizar.Descripcion = Descripcion.trim();

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const areaActualizada = await areasInteresService.actualizarAreaInteres(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: areaActualizada,
            message: 'Área de interés actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar área de interés',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR ÁREA DE INTERÉS
// ======================================================
const eliminarAreaInteres = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await areasInteresService.eliminarAreaInteres(id);

        res.status(200).json({
            success: true,
            message: 'Área de interés eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar área de interés',
            error: error.message
        });
    }
};

// ======================================================
// GET - BUSCAR ÁREAS POR NOMBRE
// ======================================================
const buscarAreasPorNombre = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "nombre" es requerido'
            });
        }

        const areas = await areasInteresService.buscarAreasPorNombre(nombre);

        res.status(200).json({
            success: true,
            data: areas,
            message: 'Búsqueda realizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar áreas de interés',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerAreasInteres,
    obtenerAreaInteresPorId,
    crearAreaInteres,
    actualizarAreaInteres,
    eliminarAreaInteres,
    buscarAreasPorNombre
};