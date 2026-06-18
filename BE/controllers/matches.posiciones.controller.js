// Controlador de Matching Extendido — Posiciones (RF-10/13).

const matchesPosicionesService = require('../services/matchesPosicionesService');


// ======================================================
// POST - GENERAR MATCHES DE POSICIONES (estudiante)
// Llamar desde el FE al completar perfil o actualizar CV/habilidades
// ======================================================

const generarMatchesPosiciones = async (req, res, next) => {
    try {
        const idEstudiante = req.user.id;

        const resultado = await matchesPosicionesService.generarMatchesPosicionesPorEstudiante(idEstudiante);

        res.status(200).json({
            success: true,
            data: resultado,
            message: `Se generaron ${resultado.generados} matches con posiciones correctamente`
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - MIS MATCHES DE POSICIONES (score > 50)
// Se muestra junto con los matches de mentoría en /mis-matches
// ======================================================

const obtenerMisMatchesPosiciones = async (req, res, next) => {
    try {
        const idEstudiante = req.user.id;

        const matches = await matchesPosicionesService.obtenerMisMatchesPosiciones(idEstudiante);

        res.status(200).json({
            success: true,
            data: matches,
            message: 'Matches de posiciones obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {
    generarMatchesPosiciones,
    obtenerMisMatchesPosiciones,
};