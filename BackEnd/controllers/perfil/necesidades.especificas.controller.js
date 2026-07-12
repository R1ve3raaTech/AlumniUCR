const necesidadesEspecificasService = require('../../services/perfil/necesidadesEspecificasService');

// ======================================================
// GET - OBTENER TODAS LAS NECESIDADES ESPECÍFICAS
// ======================================================
const obtenerNecesidadesEspecificas = async (req, res, next) => {
    try {
        const necesidades = await necesidadesEspecificasService.obtenerNecesidadesEspecificas();
        res.status(200).json({
            success: true,
            data: necesidades,
            message: 'Necesidades específicas obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER NECESIDAD ESPECÍFICA POR ID
// ======================================================
const obtenerNecesidadEspecificaPorId = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// POST - CREAR NECESIDAD ESPECÍFICA
// ======================================================
const crearNecesidadEspecifica = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        // Validaciones
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const nuevaNecesidad = await necesidadesEspecificasService.crearNecesidadEspecifica({
            nombre: nombre.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaNecesidad,
            message: 'Necesidad específica creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR NECESIDAD ESPECÍFICA
// ======================================================
const actualizarNecesidadEspecifica = async (req, res, next) => {
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

        const necesidadActualizada = await necesidadesEspecificasService.actualizarNecesidadEspecifica(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: necesidadActualizada,
            message: 'Necesidad específica actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR NECESIDAD ESPECÍFICA
// ======================================================
const eliminarNecesidadEspecifica = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - BUSCAR NECESIDADES POR NOMBRE
// ======================================================
const buscarNecesidadesPorNombre = async (req, res, next) => {
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
        next(error);
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
