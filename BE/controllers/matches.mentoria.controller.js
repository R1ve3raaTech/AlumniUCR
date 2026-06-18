// Controlador de Matching Mentoría (RF-06).
// Gestiona el ciclo de vida completo de los matches entre exalumnos y estudiantes.

const matchesMentoriaService = require('../services/matchesMentoriaService');


// ======================================================
// POST - GENERAR MATCHES (al completar perfil)
// ======================================================

const generarMatches = async (req, res, next) => {
    try {
        const idUsuario = req.user.id;
        const rol = req.user.profile?.roles?.nombre?.toLowerCase();

        if (rol !== 'estudiante' && rol !== 'exalumno') {
            return res.status(403).json({
                success: false,
                message: 'Solo estudiantes y exalumnos pueden generar matches'
            });
        }

        const resultado = await matchesMentoriaService.generarMatchesPorUsuario(idUsuario, rol);

        res.status(200).json({
            success: true,
            data: resultado,
            message: `Se generaron ${resultado.generados} matches correctamente`
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - MIS MATCHES (usuario autenticado)
// ======================================================

const obtenerMisMatches = async (req, res, next) => {
    try {
        const idUsuario = req.user.id;
        const rol = req.user.profile?.roles?.nombre?.toLowerCase();

        const matches = await matchesMentoriaService.obtenerMisMatches(idUsuario, rol);

        res.status(200).json({
            success: true,
            data: matches,
            message: 'Matches obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// PUT - CONTACTAR (sugerido → contactado)
// ======================================================

const contactarMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID del match es requerido'
            });
        }

        const match = await matchesMentoriaService.contactarMatch(id, req.user.id);

        res.status(200).json({
            success: true,
            data: match,
            message: 'Conexión iniciada correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// PUT - ACEPTAR (contactado → activo)
// ======================================================

const aceptarMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID del match es requerido'
            });
        }

        const match = await matchesMentoriaService.aceptarMatch(id, req.user.id);

        res.status(200).json({
            success: true,
            data: match,
            message: 'Conexión aceptada correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// PUT - RECHAZAR (contactado → cerrado)
// ======================================================

const rechazarMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID del match es requerido'
            });
        }

        const match = await matchesMentoriaService.rechazarMatch(id, req.user.id);

        res.status(200).json({
            success: true,
            data: match,
            message: 'Conexión rechazada correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - TODOS LOS MATCHES (admin)
// ======================================================

const obtenerTodosLosMatches = async (req, res, next) => {
    try {
        const filtros = {};
        if (req.query.estado) filtros.estado = req.query.estado;

        const matches = await matchesMentoriaService.obtenerTodosLosMatches(filtros);

        res.status(200).json({
            success: true,
            data: matches,
            message: 'Matches obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// PUT - ACTUALIZAR MATCH (admin: notas + estado)
// ======================================================

const actualizarMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID del match es requerido'
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay datos para actualizar'
            });
        }

        const match = await matchesMentoriaService.actualizarMatch(id, req.body);

        res.status(200).json({
            success: true,
            data: match,
            message: 'Match actualizado correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {
    generarMatches,
    obtenerMisMatches,
    contactarMatch,
    aceptarMatch,
    rechazarMatch,
    obtenerTodosLosMatches,
    actualizarMatch,
};