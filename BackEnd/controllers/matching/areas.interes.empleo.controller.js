const areasInteresEmpleoService = require('../../services/matching/areasInteresEmpleoService');


// ======================================================
// GET - OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerAreasInteresEmpleo = async (req, res, next) => {
    try {
        const relaciones = await areasInteresEmpleoService.obtenerAreasInteresEmpleo();
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

const obtenerAreaInteresEmpleoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'El ID es requerido' });
        }

        const relacion = await areasInteresEmpleoService.obtenerAreaInteresEmpleoPorId(id);

        if (!relacion) {
            return res.status(404).json({ success: false, message: 'Relación no encontrada' });
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

const crearAreaInteresEmpleo = async (req, res, next) => {
    try {
        const { id_empleo, id_area_tematica } = req.body;

        if (!id_empleo) {
            return res.status(400).json({ success: false, message: 'El id_empleo es requerido' });
        }

        if (!id_area_tematica) {
            return res.status(400).json({ success: false, message: 'El id_area_tematica es requerido' });
        }

        const nuevaRelacion = await areasInteresEmpleoService.crearAreaInteresEmpleo({
            id_empleo,
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

const actualizarAreaInteresEmpleo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_empleo, id_area_tematica } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'El ID es requerido' });
        }

        const datosActualizar = {};
        if (id_empleo !== undefined) datosActualizar.id_empleo = id_empleo;
        if (id_area_tematica !== undefined) datosActualizar.id_area_tematica = id_area_tematica;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({ success: false, message: 'Debe proporcionar al menos un campo para actualizar' });
        }

        const relacionActualizada = await areasInteresEmpleoService.actualizarAreaInteresEmpleo(id, datosActualizar);

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

const eliminarAreaInteresEmpleo = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'El ID es requerido' });
        }

        await areasInteresEmpleoService.eliminarAreaInteresEmpleo(id);

        res.status(200).json({
            success: true,
            message: 'Relación eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - OBTENER ÁREAS POR EMPLEO
// ======================================================

const obtenerAreasPorEmpleo = async (req, res, next) => {
    try {
        const { idEmpleo } = req.params;

        if (!idEmpleo) {
            return res.status(400).json({ success: false, message: 'El ID del empleo es requerido' });
        }

        const areas = await areasInteresEmpleoService.obtenerAreasPorEmpleo(idEmpleo);

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
// GET - OBTENER EMPLEOS POR ÁREA TEMÁTICA
// ======================================================

const obtenerEmpleosPorArea = async (req, res, next) => {
    try {
        const { idAreaTematica } = req.params;

        if (!idAreaTematica) {
            return res.status(400).json({ success: false, message: 'El ID del área temática es requerido' });
        }

        const empleos = await areasInteresEmpleoService.obtenerEmpleosPorArea(idAreaTematica);

        res.status(200).json({
            success: true,
            data: empleos,
            message: 'Empleos obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================

module.exports = {
    obtenerAreasInteresEmpleo,
    obtenerAreaInteresEmpleoPorId,
    crearAreaInteresEmpleo,
    actualizarAreaInteresEmpleo,
    eliminarAreaInteresEmpleo,
    obtenerAreasPorEmpleo,
    obtenerEmpleosPorArea,
};
