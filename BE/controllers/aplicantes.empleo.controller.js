const aplicantesService = require('../services/aplicantesService');

// ======================================================
// GET - OBTENER TODOS LOS APLICANTES
// ======================================================
const obtenerAplicantes = async (req, res) => {
    try {
        const aplicantes = await aplicantesService.obtenerAplicantes();
        res.status(200).json({
            success: true,
            data: aplicantes,
            message: 'Aplicantes obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener aplicantes',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER APLICANTE POR ID
// ======================================================
const obtenerAplicantePorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const aplicante = await aplicantesService.obtenerAplicantePorId(id);

        if (!aplicante) {
            return res.status(404).json({
                success: false,
                message: 'Aplicante no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: aplicante,
            message: 'Aplicante obtenido correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener aplicante', 
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR APLICANTE
// ======================================================
const crearAplicante = async (req, res) => {
    try {
        const { IdUsuario, IdEmpleo, Estado } = req.body;

        // Validaciones
        if (!IdUsuario || !IdEmpleo) {
            return res.status(400).json({
                success: false,
                message: 'IdUsuario e IdEmpleo son requeridos'
            });
        }

        const nuevoAplicante = await aplicantesService.crearAplicante({
            IdUsuario,
            IdEmpleo,
            Estado: Estado || 'pendiente'
        });

        res.status(201).json({
            success: true,
            data: nuevoAplicante,
            message: 'Aplicante creado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear aplicante',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR APLICANTE
// ======================================================
const actualizarAplicante = async (req, res) => {
    try {
        const { id } = req.params;
        const { IdUsuario, IdEmpleo, Estado } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (IdUsuario !== undefined) datosActualizar.IdUsuario = IdUsuario;
        if (IdEmpleo !== undefined) datosActualizar.IdEmpleo = IdEmpleo;
        if (Estado !== undefined) datosActualizar.Estado = Estado;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const aplicanteActualizado = await aplicantesService.actualizarAplicante(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: aplicanteActualizado,
            message: 'Aplicante actualizado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar aplicante',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR APLICANTE
// ======================================================
const eliminarAplicante = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await aplicantesService.eliminarAplicante(id);

        res.status(200).json({
            success: true,
            message: 'Aplicante eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar aplicante',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER APLICANTES POR EMPLEO
// ======================================================
const obtenerAplicantesPorEmpleo = async (req, res) => {
    try {
        const { idEmpleo } = req.params;

        if (!idEmpleo) {
            return res.status(400).json({
                success: false,
                message: 'El ID del empleo es requerido'
            });
        }

        const aplicantes = await aplicantesService.obtenerAplicantesPorEmpleo(idEmpleo);

        res.status(200).json({
            success: true,
            data: aplicantes,
            message: 'Aplicantes obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener aplicantes por empleo',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER APLICANTES POR USUARIO
// ======================================================
const obtenerAplicantesPorUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const aplicantes = await aplicantesService.obtenerAplicantesPorUsuario(idUsuario);

        res.status(200).json({
            success: true,
            data: aplicantes,
            message: 'Aplicantes obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener aplicantes por usuario',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerAplicantes,
    obtenerAplicantePorId,
    crearAplicante,
    actualizarAplicante,
    eliminarAplicante,
    obtenerAplicantesPorEmpleo,
    obtenerAplicantesPorUsuario
};

