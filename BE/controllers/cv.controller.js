// Controlador del Currículum Vitae del Estudiante (RF-11).
// Expone dos tipos de endpoints:
//   1. CV completo en una sola respuesta (GET /mi-curriculum)
//   2. Endpoints por sección para que el FE pueda hacer operaciones granulares

const cvService = require('../services/cv.service');

// ======================================================
// GET - CV COMPLETO (todas las secciones en una sola respuesta)
// ======================================================

const obtenerMiCurriculum = async (req, res, next) => {
    try {
        const idUsuario = req.user.id;

        const cv = await cvService.obtenerCvCompleto(idUsuario);

        res.status(200).json({
            success: true,
            data: cv,
            message: 'Currículum obtenido correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// SECCIÓN 2 — EXPERIENCIA Y PROYECTOS
// ======================================================

const obtenerMisExperiencias = async (req, res, next) => {
    try {
        const idUsuario = req.user.id;

        const experiencias = await cvService.obtenerExperienciasPorUsuario(idUsuario);

        res.status(200).json({
            success: true,
            data: experiencias,
            message: 'Experiencias obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const obtenerExperienciaPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const experiencia = await cvService.obtenerExperienciaPorId(id);

        if (!experiencia) {
            return res.status(404).json({
                success: false,
                message: 'Experiencia no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: experiencia,
            message: 'Experiencia obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const crearExperiencia = async (req, res, next) => {
    try {
        const { tipo, titulo, organizacion, fecha_inicio, fecha_fin, descripcion, bullets } = req.body;

        if (!tipo || !titulo || !fecha_inicio) {
            return res.status(400).json({
                success: false,
                message: 'Los campos tipo, título y fecha de inicio son obligatorios'
            });
        }

        const experiencia = await cvService.crearExperiencia({
            id_usuario: req.user.id,
            tipo,
            titulo,
            organizacion,
            fecha_inicio,
            fecha_fin,
            descripcion,
            bullets,
        });

        res.status(201).json({
            success: true,
            data: experiencia,
            message: 'Experiencia creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const actualizarExperiencia = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const experiencia = await cvService.actualizarExperiencia(id, req.body);

        res.status(200).json({
            success: true,
            data: experiencia,
            message: 'Experiencia actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const eliminarExperiencia = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const resultado = await cvService.eliminarExperiencia(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: resultado.mensaje
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// SECCIÓN 3 — HABILIDADES E IDIOMAS
// ======================================================

const obtenerMisHabilidades = async (req, res, next) => {
    try {
        const idUsuario = req.user.id;

        const habilidades = await cvService.obtenerHabilidadesPorUsuario(idUsuario);

        res.status(200).json({
            success: true,
            data: habilidades,
            message: 'Habilidades obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const crearHabilidades = async (req, res, next) => {
    try {
        const { tecnicas, blandas, idiomas } = req.body;

        const habilidades = await cvService.crearHabilidades({
            id_usuario: req.user.id,
            tecnicas,
            blandas,
            idiomas,
        });

        res.status(201).json({
            success: true,
            data: habilidades,
            message: 'Habilidades creadas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const actualizarHabilidades = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const habilidades = await cvService.actualizarHabilidades(id, req.body);

        res.status(200).json({
            success: true,
            data: habilidades,
            message: 'Habilidades actualizadas correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// SECCIÓN 4 — CERTIFICACIONES Y LOGROS
// ======================================================

const obtenerMisCertificaciones = async (req, res, next) => {
    try {
        const idUsuario = req.user.id;

        const certificaciones = await cvService.obtenerCertificacionesPorUsuario(idUsuario);

        res.status(200).json({
            success: true,
            data: certificaciones,
            message: 'Certificaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const obtenerCertificacionPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const certificacion = await cvService.obtenerCertificacionPorId(id);

        if (!certificacion) {
            return res.status(404).json({
                success: false,
                message: 'Certificación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: certificacion,
            message: 'Certificación obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const crearCertificacion = async (req, res, next) => {
    try {
        const { nombre, institucion, fecha, url_verificacion } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la certificación es obligatorio'
            });
        }

        const certificacion = await cvService.crearCertificacion({
            id_usuario: req.user.id,
            nombre,
            institucion,
            fecha,
            url_verificacion,
        });

        res.status(201).json({
            success: true,
            data: certificacion,
            message: 'Certificación creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const actualizarCertificacion = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const certificacion = await cvService.actualizarCertificacion(id, req.body);

        res.status(200).json({
            success: true,
            data: certificacion,
            message: 'Certificación actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const eliminarCertificacion = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const resultado = await cvService.eliminarCertificacion(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: resultado.mensaje
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// RF-12 — IA DE ADAPTACIÓN DE CV
// ======================================================

const adaptarCvConIA = async (req, res, next) => {
    try {
        const { idPosicion } = req.params;
        if (!idPosicion) return res.status(400).json({ success: false, message: 'El ID de la posición es requerido' });
        const resultado = await cvService.adaptarCvConIA(req.user.id, idPosicion);
        res.status(200).json({ success: true, data: resultado, message: 'Sugerencias generadas correctamente' });
    } catch (error) { next(error); }
};

const guardarVersionCv = async (req, res, next) => {
    try {
        const { id_posicion, nombre_version, contenido_adaptado, sugerencias_ia } = req.body;
        if (!id_posicion || !nombre_version || !contenido_adaptado)
            return res.status(400).json({ success: false, message: 'id_posicion, nombre_version y contenido_adaptado son requeridos' });
        const version = await cvService.guardarVersionCv(req.user.id, id_posicion, nombre_version, contenido_adaptado, sugerencias_ia);
        res.status(201).json({ success: true, data: version, message: 'Versión guardada correctamente' });
    } catch (error) { next(error); }
};

const obtenerMisVersionesCv = async (req, res, next) => {
    try {
        const versiones = await cvService.obtenerVersionesCv(req.user.id);
        res.status(200).json({ success: true, data: versiones, message: 'Versiones obtenidas correctamente' });
    } catch (error) { next(error); }
};

const obtenerVersionCvPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'El ID es requerido' });
        const version = await cvService.obtenerVersionCvPorId(id);
        if (!version) return res.status(404).json({ success: false, message: 'Versión no encontrada' });
        res.status(200).json({ success: true, data: version, message: 'Versión obtenida correctamente' });
    } catch (error) { next(error); }
};

const eliminarVersionCv = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'El ID es requerido' });
        const resultado = await cvService.eliminarVersionCv(id);
        res.status(200).json({ success: true, message: resultado.mensaje });
    } catch (error) { next(error); }
};


// ======================================================
// EXPORTAR CONTROLADORES
// ======================================================

module.exports = {
    // CV completo
    obtenerMiCurriculum,
    // Sección 2 — Experiencia
    obtenerMisExperiencias,
    obtenerExperienciaPorId,
    crearExperiencia,
    actualizarExperiencia,
    eliminarExperiencia,
    // Sección 3 — Habilidades
    obtenerMisHabilidades,
    crearHabilidades,
    actualizarHabilidades,
    // Sección 4 — Certificaciones
    obtenerMisCertificaciones,
    obtenerCertificacionPorId,
    crearCertificacion,
    actualizarCertificacion,
    eliminarCertificacion,
    // RF-12 — IA + Versiones
    adaptarCvConIA,
    guardarVersionCv,
    obtenerMisVersionesCv,
    obtenerVersionCvPorId,
    eliminarVersionCv,
};