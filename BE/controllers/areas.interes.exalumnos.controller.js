const areasInteresExalumnoService = require('../services/areasInteresExalumnoService');

// ======================================================
// GET - OBTENER TODAS LAS RELACIONES
// ======================================================
const obtenerAreasInteresExalumno = async (req, res) => {
    try {
        const relaciones = await areasInteresExalumnoService.obtenerAreasInteresExalumno();
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
const obtenerAreaInteresExalumnoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const relacion = await areasInteresExalumnoService.obtenerAreaInteresExalumnoPorId(id);

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
const crearAreaInteresExalumno = async (req, res) => {
    try {
        const { IdExalumno, IdAreaTematica } = req.body;

        // Validaciones
        if (!IdExalumno) {
            return res.status(400).json({
                success: false,
                message: 'El IdExalumno es requerido'
            });
        }

        if (!IdAreaTematica) {
            return res.status(400).json({
                success: false,
                message: 'El IdAreaTematica es requerido'
            });
        }

        const nuevaRelacion = await areasInteresExalumnoService.crearAreaInteresExalumno({
            IdExalumno,
            IdAreaTematica
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
const actualizarAreaInteresExalumno = async (req, res) => {
    try {
        const { id } = req.params;
        const { IdExalumno, IdAreaTematica } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (IdExalumno !== undefined) datosActualizar.IdExalumno = IdExalumno;
        if (IdAreaTematica !== undefined) datosActualizar.IdAreaTematica = IdAreaTematica;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const relacionActualizada = await areasInteresExalumnoService.actualizarAreaInteresExalumno(id, datosActualizar);

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
const eliminarAreaInteresExalumno = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await areasInteresExalumnoService.eliminarAreaInteresExalumno(id);

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
// GET - OBTENER ÁREAS POR EXALUMNO
// ======================================================
const obtenerAreasPorExalumno = async (req, res) => {
    try {
        const { idExalumno } = req.params;

        if (!idExalumno) {
            return res.status(400).json({
                success: false,
                message: 'El ID del exalumno es requerido'
            });
        }

        const areas = await areasInteresExalumnoService.obtenerAreasPorExalumno(idExalumno);

        res.status(200).json({
            success: true,
            data: areas,
            message: 'Áreas obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener áreas por exalumno',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS POR ÁREA TEMÁTICA
// ======================================================
const obtenerExalumnosPorArea = async (req, res) => {
    try {
        const { idAreaTematica } = req.params;

        if (!idAreaTematica) {
            return res.status(400).json({
                success: false,
                message: 'El ID del área temática es requerido'
            });
        }

        const exalumnos = await areasInteresExalumnoService.obtenerExalumnosPorArea(idAreaTematica);

        res.status(200).json({
            success: true,
            data: exalumnos,
            message: 'Exalumnos obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener exalumnos por área',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerAreasInteresExalumno,
    obtenerAreaInteresExalumnoPorId,
    crearAreaInteresExalumno,
    actualizarAreaInteresExalumno,
    eliminarAreaInteresExalumno,
    obtenerAreasPorExalumno,
    obtenerExalumnosPorArea
};