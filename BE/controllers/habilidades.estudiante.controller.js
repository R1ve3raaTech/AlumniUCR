const habilidadesEstudianteService = require('../services/habilidadesEstudianteService');

// ======================================================
// GET - OBTENER TODAS LAS HABILIDADES
// ======================================================
const obtenerHabilidadesEstudiante = async (req, res) => {
    try {
        const habilidades = await habilidadesEstudianteService.obtenerHabilidadesEstudiante();
        res.status(200).json({
            success: true,
            data: habilidades,
            message: 'Habilidades obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener habilidades',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER HABILIDAD POR ID
// ======================================================
const obtenerHabilidadPorId = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener habilidad',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR HABILIDAD
// ======================================================
const crearHabilidad = async (req, res) => {
    try {
        const { IdUsuario, Tecnicas, Blandas, Idiomas } = req.body;

        // Validaciones
        if (!IdUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El IdUsuario es requerido'
            });
        }

        if (!Tecnicas && !Blandas && !Idiomas) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos Tecnicas, Blandas o Idiomas'
            });
        }

        const nuevaHabilidad = await habilidadesEstudianteService.crearHabilidad({
            IdUsuario,
            Tecnicas: Tecnicas ? Tecnicas.trim() : null,
            Blandas: Blandas ? Blandas.trim() : null,
            Idiomas: Idiomas ? Idiomas.trim() : null
        });

        res.status(201).json({
            success: true,
            data: nuevaHabilidad,
            message: 'Habilidad creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear habilidad',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR HABILIDAD
// ======================================================
const actualizarHabilidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { IdUsuario, Tecnicas, Blandas, Idiomas } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (IdUsuario !== undefined) datosActualizar.IdUsuario = IdUsuario;
        if (Tecnicas !== undefined) datosActualizar.Tecnicas = Tecnicas ? Tecnicas.trim() : null;
        if (Blandas !== undefined) datosActualizar.Blandas = Blandas ? Blandas.trim() : null;
        if (Idiomas !== undefined) datosActualizar.Idiomas = Idiomas ? Idiomas.trim() : null;

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
        res.status(500).json({
            success: false,
            message: 'Error al actualizar habilidad',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR HABILIDAD
// ======================================================
const eliminarHabilidad = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al eliminar habilidad',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER HABILIDADES POR USUARIO
// ======================================================
const obtenerHabilidadesPorUsuario = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener habilidades por usuario',
            error: error.message
        });
    }
};

// ======================================================
// GET - BUSCAR HABILIDADES TÉCNICAS
// ======================================================
const buscarHabilidadesTecnicas = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al buscar habilidades técnicas',
            error: error.message
        });
    }
};

// ======================================================
// GET - BUSCAR IDIOMAS
// ======================================================
const buscarIdiomas = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al buscar idiomas',
            error: error.message
        });
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