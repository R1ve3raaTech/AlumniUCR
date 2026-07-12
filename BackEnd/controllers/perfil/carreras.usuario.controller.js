const carrerasUsuarioService = require('../../services/perfil/carrerasUsuarioService');

// ======================================================
// GET - OBTENER TODAS LAS RELACIONES
// ======================================================
const obtenerCarrerasUsuario = async (req, res, next) => {
    try {
        const relaciones = await carrerasUsuarioService.obtenerCarrerasUsuario();
        res.status(200).json({
            success: true,
            data: relaciones,
            message: 'Relaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER RELACIÓN POR ID
// ======================================================
const obtenerCarreraUsuarioPorId = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// POST - CREAR RELACIÓN
// ======================================================
const crearCarreraUsuario = async (req, res, next) => {
    try {
        const { id_carrera, id_usuario, id_sede, ano_graduacion } = req.body;

        // Validaciones
        if (!id_carrera) {
            return res.status(400).json({
                success: false,
                message: 'El id_carrera es requerido'
            });
        }

        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'El id_usuario es requerido'
            });
        }

        if (!id_sede) {
            return res.status(400).json({
                success: false,
                message: 'El id_sede es requerido'
            });
        }

        if (!ano_graduacion) {
            return res.status(400).json({
                success: false,
                message: 'El ano_graduacion es requerido'
            });
        }

        const nuevaRelacion = await carrerasUsuarioService.crearCarreraUsuario({
            id_carrera,
            id_usuario,
            id_sede,
            ano_graduacion
        });

        res.status(201).json({
            success: true,
            data: nuevaRelacion,
            message: 'Relación creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR RELACIÓN
// ======================================================
const actualizarCarreraUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_carrera, id_usuario, id_sede, ano_graduacion } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (id_carrera !== undefined) datosActualizar.id_carrera = id_carrera;
        if (id_usuario !== undefined) datosActualizar.id_usuario = id_usuario;
        if (id_sede !== undefined) datosActualizar.id_sede = id_sede;
        if (ano_graduacion !== undefined) datosActualizar.ano_graduacion = ano_graduacion;

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
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR RELACIÓN
// ======================================================
const eliminarCarreraUsuario = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - OBTENER CARRERAS POR USUARIO
// ======================================================
const obtenerCarrerasPorUsuario = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - OBTENER USUARIOS POR CARRERA
// ======================================================
const obtenerUsuariosPorCarrera = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - OBTENER USUARIOS POR SEDE
// ======================================================
const obtenerUsuariosPorSede = async (req, res, next) => {
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
        next(error);
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
