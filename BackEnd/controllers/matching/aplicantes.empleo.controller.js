const aplicantesService = require('../../services/matching/aplicantesService');


// ======================================================
// GET - OBTENER TODOS LOS APLICANTES (admin)
// ======================================================

const obtenerAplicantes = async (req, res, next) => {
    try {
        const aplicantes = await aplicantesService.obtenerAplicantes();
        res.status(200).json({
            success: true,
            data: aplicantes,
            message: 'Aplicantes obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - OBTENER APLICANTE POR ID
// ======================================================

const obtenerAplicantePorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const aplicante = await aplicantesService.obtenerAplicantePorId(id);

        if (!aplicante) {
            return res.status(404).json({
                success: false,
                message: 'Aplicante no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: aplicante,
            message: 'Aplicante obtenido correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// POST - CREAR APLICANTE (estudiante aplica a posición)
// ======================================================

const crearAplicante = async (req, res, next) => {
    try {
        const { id_empleo, mensaje_presentacion, id_curriculum_version } = req.body;

        if (!id_empleo) {
            return res.status(400).json({
                success: false,
                message: 'id_empleo es requerido'
            });
        }

        const nuevoAplicante = await aplicantesService.crearAplicante({
            id_usuario: req.user.id,
            id_empleo,
            estado: 'enviada',
            mensaje_presentacion,
            id_curriculum_version,
        });

        res.status(201).json({
            success: true,
            data: nuevoAplicante,
            message: 'Aplicación enviada correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// PUT - ACTUALIZAR APLICANTE (exalumno cambia estado)
// ======================================================

const actualizarAplicante = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay datos para actualizar'
            });
        }

        const actualizado = await aplicantesService.actualizarAplicante(id, req.body);

        res.status(200).json({
            success: true,
            data: actualizado,
            message: 'Aplicante actualizado correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// DELETE - ELIMINAR APLICANTE (admin)
// ======================================================

const eliminarAplicante = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await aplicantesService.eliminarAplicante(id);

        res.status(200).json({
            success: true,
            message: 'Aplicante eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - APLICANTES POR EMPLEO (exalumno)
// ======================================================

const obtenerAplicantesPorEmpleo = async (req, res, next) => {
    try {
        const { idEmpleo } = req.params;

        const aplicantes = await aplicantesService.obtenerAplicantesPorEmpleo(idEmpleo);

        res.status(200).json({
            success: true,
            data: aplicantes,
            message: 'Aplicantes obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - APLICANTES POR USUARIO (admin)
// ======================================================

const obtenerAplicantesPorUsuario = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;

        const aplicantes = await aplicantesService.obtenerAplicantesPorUsuario(idUsuario);

        res.status(200).json({
            success: true,
            data: aplicantes,
            message: 'Aplicantes obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// RF-13: GET - MIS APLICACIONES (estudiante)
// ======================================================

const obtenerMisAplicaciones = async (req, res, next) => {
    try {
        const aplicaciones = await aplicantesService.obtenerMisAplicaciones(req.user.id);

        res.status(200).json({
            success: true,
            data: aplicaciones,
            message: 'Tus aplicaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// RF-13: DELETE - RETIRAR APLICACIÓN (estudiante)
// Solo si estado = 'enviada'
// ======================================================

const retirarAplicacion = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const resultado = await aplicantesService.retirarAplicacion(id, req.user.id);

        res.status(200).json({
            success: true,
            message: resultado.mensaje
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// RF-13: GET - APLICANTES DE UNA POSICIÓN (exalumno)
// Con score de compatibilidad
// ======================================================

const obtenerAplicantesPorPosicion = async (req, res, next) => {
    try {
        const { idPosicion } = req.params;

        if (!idPosicion) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la posición es requerido'
            });
        }

        const aplicantes = await aplicantesService.obtenerAplicantesPorPosicion(idPosicion);

        res.status(200).json({
            success: true,
            data: aplicantes,
            message: 'Aplicantes de la posición obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// RF-13: PUT - SELECCIONAR CANDIDATO (exalumno)
// Notifica al seleccionado y descarta al resto automáticamente
// ======================================================

const seleccionarCandidato = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'El ID es requerido' });
        const resultado = await aplicantesService.seleccionarCandidato(id, req.user.id);
        res.status(200).json({ success: true, data: resultado, message: 'Candidato seleccionado correctamente' });
    } catch (error) { next(error); }
};


// ======================================================
// EXPORTAR CONTROLADORES
// ======================================================

module.exports = {
    obtenerAplicantes,
    obtenerAplicantePorId,
    crearAplicante,
    actualizarAplicante,
    eliminarAplicante,
    obtenerAplicantesPorEmpleo,
    obtenerAplicantesPorUsuario,
    // RF-13 nuevos
    obtenerMisAplicaciones,
    retirarAplicacion,
    obtenerAplicantesPorPosicion,
    seleccionarCandidato,
};