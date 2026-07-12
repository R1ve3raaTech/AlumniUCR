const areasInteresExalumnoService = require('../../services/perfil/areasInteresExalumnoService');

// ======================================================
// GET - OBTENER TODAS LAS RELACIONES
// ======================================================
const obtenerAreasInteresExalumno = async (req, res, next) => {
    try {
        const relaciones = await areasInteresExalumnoService.obtenerAreasInteresExalumno();
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
const obtenerAreaInteresExalumnoPorId = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// POST - CREAR RELACIÓN
// ======================================================
const crearAreaInteresExalumno = async (req, res, next) => {
    try {
        const { id_exalumno, id_area_tematica } = req.body;

        // Validaciones
        if (!id_exalumno) {
            return res.status(400).json({
                success: false,
                message: 'El id_exalumno es requerido'
            });
        }

        if (!id_area_tematica) {
            return res.status(400).json({
                success: false,
                message: 'El id_area_tematica es requerido'
            });
        }

        const nuevaRelacion = await areasInteresExalumnoService.crearAreaInteresExalumno({
            id_exalumno,
            id_area_tematica
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
const actualizarAreaInteresExalumno = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_exalumno, id_area_tematica } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (id_exalumno !== undefined) datosActualizar.id_exalumno = id_exalumno;
        if (id_area_tematica !== undefined) datosActualizar.id_area_tematica = id_area_tematica;

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
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR RELACIÓN
// ======================================================
const eliminarAreaInteresExalumno = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - OBTENER ÁREAS POR EXALUMNO
// ======================================================
const obtenerAreasPorExalumno = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS POR ÁREA TEMÁTICA
// ======================================================
const obtenerExalumnosPorArea = async (req, res, next) => {
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
        next(error);
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
