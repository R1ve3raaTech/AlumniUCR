const responsabilidadEmpleoService = require('../../services/matching/responsabilidadEmpleoService');

// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerResponsabilidadesEmpleo = async (req, res, next) => {
    try {
        const relaciones =
            await responsabilidadEmpleoService.obtenerResponsabilidadesEmpleo();

        res.status(200).json({
            success: true,
            data: relaciones,
            message: 'Relaciones responsabilidad-empleo obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerResponsabilidadEmpleoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const relacion =
            await responsabilidadEmpleoService.obtenerResponsabilidadEmpleoPorId(id);

        if (!relacion) {
            return res.status(404).json({
                success: false,
                message: 'Relación responsabilidad-empleo no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: relacion,
            message: 'Relación responsabilidad-empleo obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearResponsabilidadEmpleo = async (req, res, next) => {
    try {
        const { id_empleo, id_responsabilidad } = req.body;

        if (!id_empleo) {
            return res.status(400).json({
                success: false,
                message: 'El id_empleo es requerido'
            });
        }

        if (!id_responsabilidad) {
            return res.status(400).json({
                success: false,
                message: 'El id_responsabilidad es requerido'
            });
        }

        const nuevaRelacion =
            await responsabilidadEmpleoService.crearResponsabilidadEmpleo({
                id_empleo,
                id_responsabilidad
            });

        res.status(201).json({
            success: true,
            data: nuevaRelacion,
            message: 'Relación responsabilidad-empleo creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarResponsabilidadEmpleo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_empleo, id_responsabilidad } = req.body;

        const datosActualizar = {};
        if (id_empleo !== undefined) datosActualizar.id_empleo = id_empleo;
        if (id_responsabilidad !== undefined) datosActualizar.id_responsabilidad = id_responsabilidad;

        const relacionActualizada =
            await responsabilidadEmpleoService.actualizarResponsabilidadEmpleo(
                id,
                datosActualizar
            );

        res.status(200).json({
            success: true,
            data: relacionActualizada,
            message: 'Relación responsabilidad-empleo actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarResponsabilidadEmpleo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado =
            await responsabilidadEmpleoService.eliminarResponsabilidadEmpleo(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Relación responsabilidad-empleo eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER RESPONSABILIDADES POR EMPLEO
// ======================================================

const obtenerResponsabilidadesPorEmpleo = async (req, res, next) => {
    try {
        const { idEmpleo } = req.params;

        const responsabilidades =
            await responsabilidadEmpleoService.obtenerResponsabilidadesPorEmpleo(
                idEmpleo
            );

        res.status(200).json({
            success: true,
            data: responsabilidades,
            message: 'Responsabilidades del empleo obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER EMPLEOS POR RESPONSABILIDAD
// ======================================================

const obtenerEmpleosPorResponsabilidad = async (req, res, next) => {
    try {
        const { idResponsabilidad } = req.params;

        const empleos =
            await responsabilidadEmpleoService.obtenerEmpleosPorResponsabilidad(
                idResponsabilidad
            );

        res.status(200).json({
            success: true,
            data: empleos,
            message: 'Empleos asociados a la responsabilidad obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerResponsabilidadesEmpleo,
    obtenerResponsabilidadEmpleoPorId,
    crearResponsabilidadEmpleo,
    actualizarResponsabilidadEmpleo,
    eliminarResponsabilidadEmpleo,
    obtenerResponsabilidadesPorEmpleo,
    obtenerEmpleosPorResponsabilidad
};
