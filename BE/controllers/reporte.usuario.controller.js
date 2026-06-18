const reporteUsuarioService = require('../services/reporteUsuarioService');

// ======================================================
// OBTENER TODOS LOS REPORTES
// ======================================================

async function obtenerReportesUsuarios(req, res, next) {
    try {
        const reportes = await reporteUsuarioService.obtenerReportesUsuarios();

        res.status(200).json({
            success: true,
            data: reportes,
            message: 'Reportes obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER REPORTE POR ID
// ======================================================

async function obtenerReportePorId(req, res, next) {
    try {
        const { id } = req.params;

        const reporte = await reporteUsuarioService.obtenerReportePorId(id);

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: reporte,
            message: 'Reporte obtenido correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR REPORTE
// ======================================================

async function crearReporteUsuario(req, res, next) {
    try {
        const { id_usuario_reportado, id_usuario_emisor, motivo, descripcion } = req.body;

        if (!id_usuario_reportado) {
            return res.status(400).json({
                success: false,
                message: 'El id_usuario_reportado es requerido'
            });
        }

        if (!id_usuario_emisor) {
            return res.status(400).json({
                success: false,
                message: 'El id_usuario_emisor es requerido'
            });
        }

        if (!motivo) {
            return res.status(400).json({
                success: false,
                message: 'El motivo es requerido'
            });
        }

        const nuevoReporte = await reporteUsuarioService.crearReporteUsuario({
            id_usuario_reportado,
            id_usuario_emisor,
            motivo,
            descripcion
        });

        res.status(201).json({
            success: true,
            data: nuevoReporte,
            message: 'Reporte creado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR REPORTE
// ======================================================

async function actualizarReporteUsuario(req, res, next) {
    try {
        const { id } = req.params;
        const { id_usuario_reportado, id_usuario_emisor, motivo, descripcion, resuelto } = req.body;

        const datosActualizar = {};
        if (id_usuario_reportado !== undefined) datosActualizar.id_usuario_reportado = id_usuario_reportado;
        if (id_usuario_emisor !== undefined) datosActualizar.id_usuario_emisor = id_usuario_emisor;
        if (motivo !== undefined) datosActualizar.motivo = motivo;
        if (descripcion !== undefined) datosActualizar.descripcion = descripcion;
        if (resuelto !== undefined) datosActualizar.resuelto = resuelto;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const reporteActualizado = await reporteUsuarioService.actualizarReporteUsuario(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: reporteActualizado,
            message: 'Reporte actualizado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR REPORTE
// ======================================================

async function eliminarReporteUsuario(req, res, next) {
    try {
        const { id } = req.params;

        const resultado = await reporteUsuarioService.eliminarReporteUsuario(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Reporte eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER REPORTES POR USUARIO REPORTADO
// ======================================================

async function obtenerReportesPorUsuarioReportado(req, res, next) {
    try {
        const { idUsuarioReportado } = req.params;

        const reportes = await reporteUsuarioService.obtenerReportesPorUsuarioReportado(idUsuarioReportado);

        res.status(200).json({
            success: true,
            data: reportes,
            message: 'Reportes del usuario reportado obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER REPORTES POR USUARIO EMISOR
// ======================================================

async function obtenerReportesPorUsuarioEmisor(req, res, next) {
    try {
        const { idUsuarioEmisor } = req.params;

        const reportes = await reporteUsuarioService.obtenerReportesPorUsuarioEmisor(idUsuarioEmisor);

        res.status(200).json({
            success: true,
            data: reportes,
            message: 'Reportes del usuario emisor obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR REPORTES POR MOTIVO
// ======================================================

async function buscarReportesPorMotivo(req, res, next) {
    try {
        const { motivo } = req.params;

        const reportes = await reporteUsuarioService.buscarReportesPorMotivo(motivo);

        res.status(200).json({
            success: true,
            data: reportes,
            message: 'Búsqueda realizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerReportesUsuarios,
    obtenerReportePorId,
    crearReporteUsuario,
    actualizarReporteUsuario,
    eliminarReporteUsuario,
    obtenerReportesPorUsuarioReportado,
    obtenerReportesPorUsuarioEmisor,
    buscarReportesPorMotivo,
    reactivarUsuario,
    eliminarUsuarioPermanente,
};

// ======================================================
// PUT - REACTIVAR PERFIL (admin) — RF-09
// ======================================================

async function reactivarUsuario(req, res, next) {
    try {
        const { idUsuario } = req.params;
        if (!idUsuario) return res.status(400).json({ success: false, message: 'El ID del usuario es requerido' });
        const usuario = await reporteUsuarioService.reactivarUsuario(idUsuario);
        res.status(200).json({ success: true, data: usuario, message: 'Perfil reactivado correctamente' });
    } catch (error) { next(error); }
};


// ======================================================
// DELETE - ELIMINAR PERFIL PERMANENTEMENTE (admin) — RF-09
// ======================================================

async function eliminarUsuarioPermanente(req, res, next) {
    try {
        const { idUsuario } = req.params;
        if (!idUsuario) return res.status(400).json({ success: false, message: 'El ID del usuario es requerido' });
        const usuario = await reporteUsuarioService.eliminarUsuarioPermanente(idUsuario);
        res.status(200).json({ success: true, data: usuario, message: 'Perfil eliminado permanentemente' });
    } catch (error) { next(error); }
};
