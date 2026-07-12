const habilidadesEstudianteService = require('../../services/perfil/habilidadesEstudianteService');

// ======================================================
// GET - OBTENER TODAS LAS HABILIDADES
// ======================================================
const obtenerHabilidadesEstudiante = async (req, res, next) => {
    try {
        const habilidades = await habilidadesEstudianteService.obtenerHabilidadesEstudiante();
        res.status(200).json({
            success: true,
            data: habilidades,
            message: 'Habilidades obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER HABILIDAD POR ID
// ======================================================
const obtenerHabilidadPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const habilidad = await habilidadesEstudianteService.obtenerHabilidadPorId(id);

        if (!habilidad) {
            return res.status(404).json({
                success: false,
                message: 'Habilidad no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: habilidad,
            message: 'Habilidad obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// POST - CREAR HABILIDAD
// ======================================================
const crearHabilidad = async (req, res, next) => {
    try {
        const { id_usuario, tecnicas, blandas, idiomas } = req.body;

        // Validaciones
        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'El id_usuario es requerido'
            });
        }

        if (!tecnicas && !blandas && !idiomas) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos tecnicas, blandas o idiomas'
            });
        }

        const nuevaHabilidad = await habilidadesEstudianteService.crearHabilidad({
            id_usuario,
            tecnicas: tecnicas ? tecnicas.trim() : null,
            blandas: blandas ? blandas.trim() : null,
            idiomas: idiomas ? idiomas.trim() : null
        });

        res.status(201).json({
            success: true,
            data: nuevaHabilidad,
            message: 'Habilidad creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR HABILIDAD
// ======================================================
const actualizarHabilidad = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_usuario, tecnicas, blandas, idiomas } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (id_usuario !== undefined) datosActualizar.id_usuario = id_usuario;
        if (tecnicas !== undefined) datosActualizar.tecnicas = tecnicas ? tecnicas.trim() : null;
        if (blandas !== undefined) datosActualizar.blandas = blandas ? blandas.trim() : null;
        if (idiomas !== undefined) datosActualizar.idiomas = idiomas ? idiomas.trim() : null;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const habilidadActualizada = await habilidadesEstudianteService.actualizarHabilidad(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: habilidadActualizada,
            message: 'Habilidad actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR HABILIDAD
// ======================================================
const eliminarHabilidad = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await habilidadesEstudianteService.eliminarHabilidad(id);

        res.status(200).json({
            success: true,
            message: 'Habilidad eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER HABILIDADES POR USUARIO
// ======================================================
const obtenerHabilidadesPorUsuario = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const habilidades = await habilidadesEstudianteService.obtenerHabilidadesPorUsuario(idUsuario);

        res.status(200).json({
            success: true,
            data: habilidades,
            message: 'Habilidades obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - BUSCAR HABILIDADES TÉCNICAS
// ======================================================
const buscarHabilidadesTecnicas = async (req, res, next) => {
    try {
        const { tecnica } = req.query;

        if (!tecnica) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "tecnica" es requerido'
            });
        }

        const habilidades = await habilidadesEstudianteService.buscarHabilidadesTecnicas(tecnica);

        res.status(200).json({
            success: true,
            data: habilidades,
            message: 'Búsqueda realizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - BUSCAR IDIOMAS
// ======================================================
const buscarIdiomas = async (req, res, next) => {
    try {
        const { idioma } = req.query;

        if (!idioma) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "idioma" es requerido'
            });
        }

        const habilidades = await habilidadesEstudianteService.buscarIdiomas(idioma);

        res.status(200).json({
            success: true,
            data: habilidades,
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
    obtenerHabilidadesEstudiante,
    obtenerHabilidadPorId,
    crearHabilidad,
    actualizarHabilidad,
    eliminarHabilidad,
    obtenerHabilidadesPorUsuario,
    buscarHabilidadesTecnicas,
    buscarIdiomas
};
