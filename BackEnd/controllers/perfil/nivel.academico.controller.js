const nivelAcademicoService = require('../../services/perfil/nivelAcademicoService');

// ======================================================
// GET - OBTENER TODOS LOS NIVELES ACADÉMICOS
// ======================================================
const obtenerNivelesAcademicos = async (req, res, next) => {
    try {
        const niveles = await nivelAcademicoService.obtenerNivelesAcademicos();
        res.status(200).json({
            success: true,
            data: niveles,
            message: 'Niveles académicos obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER NIVEL ACADÉMICO POR ID
// ======================================================
const obtenerNivelAcademicoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const nivel = await nivelAcademicoService.obtenerNivelAcademicoPorId(id);

        if (!nivel) {
            return res.status(404).json({
                success: false,
                message: 'Nivel académico no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: nivel,
            message: 'Nivel académico obtenido correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerNivelesAcademicos,
    obtenerNivelAcademicoPorId
};
