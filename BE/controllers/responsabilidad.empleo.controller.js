const responsabilidadEmpleoService = require('../services/responsabilidadEmpleoService');

// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerResponsabilidadesEmpleo = async (req, res) => {
    try {
        const relaciones =
            await responsabilidadEmpleoService.obtenerResponsabilidadesEmpleo();

        res.status(200).json(relaciones);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las relaciones responsabilidad-empleo',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerResponsabilidadEmpleoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const relacion =
            await responsabilidadEmpleoService.obtenerResponsabilidadEmpleoPorId(id);

        res.status(200).json(relacion);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener la relación responsabilidad-empleo',
            error: error.message
        });
    }
};

// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearResponsabilidadEmpleo = async (req, res) => {
    try {
        const nuevaRelacion =
            await responsabilidadEmpleoService.crearResponsabilidadEmpleo(req.body);

        res.status(201).json({
            mensaje: 'Relación responsabilidad-empleo creada correctamente',
            data: nuevaRelacion
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear la relación responsabilidad-empleo',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarResponsabilidadEmpleo = async (req, res) => {
    try {
        const { id } = req.params;

        const relacionActualizada =
            await responsabilidadEmpleoService.actualizarResponsabilidadEmpleo(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Relación responsabilidad-empleo actualizada correctamente',
            data: relacionActualizada
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar la relación responsabilidad-empleo',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarResponsabilidadEmpleo = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await responsabilidadEmpleoService.eliminarResponsabilidadEmpleo(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar la relación responsabilidad-empleo',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER RESPONSABILIDADES POR EMPLEO
// ======================================================

const obtenerResponsabilidadesPorEmpleo = async (req, res) => {
    try {
        const { idEmpleo } = req.params;

        const responsabilidades =
            await responsabilidadEmpleoService.obtenerResponsabilidadesPorEmpleo(
                idEmpleo
            );

        res.status(200).json(responsabilidades);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las responsabilidades del empleo',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER EMPLEOS POR RESPONSABILIDAD
// ======================================================

const obtenerEmpleosPorResponsabilidad = async (req, res) => {
    try {
        const { idResponsabilidad } = req.params;

        const empleos =
            await responsabilidadEmpleoService.obtenerEmpleosPorResponsabilidad(
                idResponsabilidad
            );

        res.status(200).json(empleos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los empleos asociados a la responsabilidad',
            error: error.message
        });
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