const areasInteresService = require('../../services/perfil/areasInteresService');

// ======================================================
// GET - OBTENER TODAS LAS ÁREAS DE INTERÉS
// ======================================================
const obtenerAreasInteres = async (req, res, next) => {
    try {
        const areas = await areasInteresService.obtenerAreasInteres();
        res.status(200).json({
            success: true,
            data: areas,
            message: 'Áreas de interés obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER ÁREA DE INTERÉS POR ID
// ======================================================
const obtenerAreaInteresPorId = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// POST - CREAR ÁREA DE INTERÉS
// ======================================================
const crearAreaInteres = async (req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;

        // Validaciones
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        if (!descripcion) {
            return res.status(400).json({
                success: false,
                message: 'La descripción es requerida'
            });
        }

        const nuevaArea = await areasInteresService.crearAreaInteres({
            nombre: nombre.trim(),
            descripcion: descripcion.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaArea,
            message: 'Área de interés creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR ÁREA DE INTERÉS
// ======================================================
const actualizarAreaInteres = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (nombre !== undefined) datosActualizar.nombre = nombre.trim();
        if (descripcion !== undefined) datosActualizar.descripcion = descripcion.trim();

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
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR ÁREA DE INTERÉS
// ======================================================
const eliminarAreaInteres = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - BUSCAR ÁREAS POR NOMBRE
// ======================================================
const buscarAreasPorNombre = async (req, res, next) => {
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
        next(error);
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
