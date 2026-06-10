const necesidadesEspecificasService = require('../services/necesidadesEspecificasService');

// ======================================================
// GET - OBTENER TODAS LAS NECESIDADES ESPECÍFICAS
// ======================================================
const obtenerNecesidadesEspecificas = async (req, res) => {
    try {
        const necesidades = await necesidadesEspecificasService.obtenerNecesidadesEspecificas();
        res.status(200).json({
            success: true,
            data: necesidades,
            message: 'Necesidades específicas obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener necesidades específicas',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER NECESIDAD ESPECÍFICA POR ID
// ======================================================
const obtenerNecesidadEspecificaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const necesidad = await necesidadesEspecificasService.obtenerNecesidadEspecificaPorId(id);

        if (!necesidad) {
            return res.status(404).json({
                success: false,
                message: 'Necesidad específica no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: necesidad,
            message: 'Necesidad específica obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener necesidad específica',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR NECESIDAD ESPECÍFICA
// ======================================================
const crearNecesidadEspecifica = async (req, res) => {
    try {
        const { Nombre } = req.body;

        // Validaciones
        if (!Nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const nuevaNecesidad = await necesidadesEspecificasService.crearNecesidadEspecifica({
            Nombre: Nombre.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaNecesidad,
            message: 'Necesidad específica creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear necesidad específica',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR NECESIDAD ESPECÍFICA
// ======================================================
const actualizarNecesidadEspecifica = async (req, res) => {
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

        const necesidadActualizada = await necesidadesEspecificasService.actualizarNecesidadEspecifica(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: necesidadActualizada,
            message: 'Necesidad específica actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar necesidad específica',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR NECESIDAD ESPECÍFICA
// ======================================================
const eliminarNecesidadEspecifica = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await necesidadesEspecificasService.eliminarNecesidadEspecifica(id);

        res.status(200).json({
            success: true,
            message: 'Necesidad específica eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar necesidad específica',
            error: error.message
        });
    }
};

// ======================================================
// GET - BUSCAR NECESIDADES POR NOMBRE
// ======================================================
const buscarNecesidadesPorNombre = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "nombre" es requerido'
            });
        }

        const necesidades = await necesidadesEspecificasService.buscarNecesidadesPorNombre(nombre);

        res.status(200).json({
            success: true,
            data: necesidades,
            message: 'Búsqueda realizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar necesidades específicas',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerNecesidadesEspecificas,
    obtenerNecesidadEspecificaPorId,
    crearNecesidadEspecifica,
    actualizarNecesidadEspecifica,
    eliminarNecesidadEspecifica,
    buscarNecesidadesPorNombre
};