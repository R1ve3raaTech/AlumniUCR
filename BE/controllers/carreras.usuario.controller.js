const carrerasUsuarioService = require('../services/carrerasUsuarioService');

// ======================================================
// GET - OBTENER TODAS LAS RELACIONES
// ======================================================
const obtenerCarrerasUsuario = async (req, res) => {
    try {
        const relaciones = await carrerasUsuarioService.obtenerCarrerasUsuario();
        res.status(200).json({
            success: true,
            data: relaciones,
            message: 'Relaciones obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener relaciones',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER RELACIÓN POR ID
// ======================================================
const obtenerCarreraUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const relacion = await carrerasUsuarioService.obtenerCarreraUsuarioPorId(id);

        if (!relacion) {
            return res.status(404).json({
                success: false,
                message: 'Relación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: relacion,
            message: 'Relación obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener relación',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR RELACIÓN
// ======================================================
const crearCarreraUsuario = async (req, res) => {
    try {
        const { IdCarrera, IdUsuario, IdSede, AnoGraduacion } = req.body;

        // Validaciones
        if (!IdCarrera) {
            return res.status(400).json({
                success: false,
                message: 'El IdCarrera es requerido'
            });
        }

        if (!IdUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El IdUsuario es requerido'
            });
        }

        if (!IdSede) {
            return res.status(400).json({
                success: false,
                message: 'El IdSede es requerido'
            });
        }

        if (!AnoGraduacion) {
            return res.status(400).json({
                success: false,
                message: 'El AnoGraduacion es requerido'
            });
        }

        const nuevaRelacion = await carrerasUsuarioService.crearCarreraUsuario({
            IdCarrera,
            IdUsuario,
            IdSede,
            AnoGraduacion
        });

        res.status(201).json({
            success: true,
            data: nuevaRelacion,
            message: 'Relación creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear relación',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR RELACIÓN
// ======================================================
const actualizarCarreraUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { IdCarrera, IdUsuario, IdSede, AnoGraduacion } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (IdCarrera !== undefined) datosActualizar.IdCarrera = IdCarrera;
        if (IdUsuario !== undefined) datosActualizar.IdUsuario = IdUsuario;
        if (IdSede !== undefined) datosActualizar.IdSede = IdSede;
        if (AnoGraduacion !== undefined) datosActualizar.AnoGraduacion = AnoGraduacion;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const relacionActualizada = await carrerasUsuarioService.actualizarCarreraUsuario(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: relacionActualizada,
            message: 'Relación actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar relación',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR RELACIÓN
// ======================================================
const eliminarCarreraUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await carrerasUsuarioService.eliminarCarreraUsuario(id);

        res.status(200).json({
            success: true,
            message: 'Relación eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar relación',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER CARRERAS POR USUARIO
// ======================================================
const obtenerCarrerasPorUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const carreras = await carrerasUsuarioService.obtenerCarrerasPorUsuario(idUsuario);

        res.status(200).json({
            success: true,
            data: carreras,
            message: 'Carreras obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener carreras por usuario',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER USUARIOS POR CARRERA
// ======================================================
const obtenerUsuariosPorCarrera = async (req, res) => {
    try {
        const { idCarrera } = req.params;

        if (!idCarrera) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la carrera es requerido'
            });
        }

        const usuarios = await carrerasUsuarioService.obtenerUsuariosPorCarrera(idCarrera);

        res.status(200).json({
            success: true,
            data: usuarios,
            message: 'Usuarios obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios por carrera',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER USUARIOS POR SEDE
// ======================================================
const obtenerUsuariosPorSede = async (req, res) => {
    try {
        const { idSede } = req.params;

        if (!idSede) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la sede es requerido'
            });
        }

        const usuarios = await carrerasUsuarioService.obtenerUsuariosPorSede(idSede);

        res.status(200).json({
            success: true,
            data: usuarios,
            message: 'Usuarios obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios por sede',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerCarrerasUsuario,
    obtenerCarreraUsuarioPorId,
    crearCarreraUsuario,
    actualizarCarreraUsuario,
    eliminarCarreraUsuario,
    obtenerCarrerasPorUsuario,
    obtenerUsuariosPorCarrera,
    obtenerUsuariosPorSede
};