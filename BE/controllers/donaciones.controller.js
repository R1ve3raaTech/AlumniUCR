const donacionesService = require('../services/donacionesService');

// ======================================================
// GET - OBTENER TODAS LAS DONACIONES
// ======================================================
const obtenerDonaciones = async (req, res, next) => {
    try {
        const donaciones = await donacionesService.obtenerDonaciones();
        res.status(200).json({
            success: true,
            data: donaciones,
            message: 'Donaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER DONACIÓN POR ID
// ======================================================
const obtenerDonacionPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const donacion = await donacionesService.obtenerDonacionPorId(id);

        if (!donacion) {
            return res.status(404).json({
                success: false,
                message: 'Donación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: donacion,
            message: 'Donación obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// POST - CREAR DONACIÓN
// ======================================================
const crearDonacion = async (req, res, next) => {
    try {
        const {
            id_usuario_exalumno,
            id_tipo_pago,
            monto,
            id_proyecto,
            moneda,
            fecha_hora_transferencia,
            numero_referencia,
            comprobante,
            mensaje,
            estado
        } = req.body;

        // Validaciones
        if (!id_usuario_exalumno) {
            return res.status(400).json({
                success: false,
                message: 'El IdUsuarioExalumno es requerido'
            });
        }

        if (!id_tipo_pago) {
            return res.status(400).json({
                success: false,
                message: 'El IdTipoPago es requerido'
            });
        }

        if (!monto || monto <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a 0'
            });
        }

        if (!id_proyecto) {
            return res.status(400).json({
                success: false,
                message: 'El IdProyecto es requerido'
            });
        }

        if (!moneda) {
            return res.status(400).json({
                success: false,
                message: 'La moneda es requerida'
            });
        }

        if (!fecha_hora_transferencia) {
            return res.status(400).json({
                success: false,
                message: 'La fecha y hora de transferencia es requerida'
            });
        }

        if (!numero_referencia) {
            return res.status(400).json({
                success: false,
                message: 'El número de referencia es requerido'
            });
        }

        const nuevaDonacion = await donacionesService.crearDonacion({
            id_usuario_exalumno,
            id_tipo_pago,
            monto,
            id_proyecto,
            moneda,
            fecha_hora_transferencia,
            numero_referencia,
            comprobante: comprobante ? comprobante.trim() : null,
            mensaje: mensaje ? mensaje.trim() : null,
            estado: estado || 'pendiente'
        });

        res.status(201).json({
            success: true,
            data: nuevaDonacion,
            message: 'Donación creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR DONACIÓN
// ======================================================
const actualizarDonacion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            id_usuario_exalumno,
            id_tipo_pago,
            monto,
            id_proyecto,
            moneda,
            fecha_hora_transferencia,
            numero_referencia,
            comprobante,
            mensaje,
            estado
        } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (id_usuario_exalumno !== undefined) datosActualizar.id_usuario_exalumno = id_usuario_exalumno;
        if (id_tipo_pago !== undefined) datosActualizar.id_tipo_pago = id_tipo_pago;
        if (monto !== undefined) {
            if (monto <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El monto debe ser mayor a 0'
                });
            }
            datosActualizar.monto = monto;
        }
        if (id_proyecto !== undefined) datosActualizar.id_proyecto = id_proyecto;
        if (moneda !== undefined) datosActualizar.moneda = moneda;
        if (fecha_hora_transferencia !== undefined) datosActualizar.fecha_hora_transferencia = fecha_hora_transferencia;
        if (numero_referencia !== undefined) datosActualizar.numero_referencia = numero_referencia;
        if (comprobante !== undefined) datosActualizar.comprobante = comprobante ? comprobante.trim() : null;
        if (mensaje !== undefined) datosActualizar.mensaje = mensaje ? mensaje.trim() : null;
        if (estado !== undefined) datosActualizar.estado = estado;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const donacionActualizada = await donacionesService.actualizarDonacion(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: donacionActualizada,
            message: 'Donación actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR DONACIÓN
// ======================================================
const eliminarDonacion = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await donacionesService.eliminarDonacion(id);

        res.status(200).json({
            success: true,
            message: 'Donación eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER DONACIONES POR USUARIO
// ======================================================
const obtenerDonacionesPorUsuario = async (req, res, next) => {
    try {
        const { idUsuarioExalumno } = req.params;

        if (!idUsuarioExalumno) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const donaciones = await donacionesService.obtenerDonacionesPorUsuario(idUsuarioExalumno);

        res.status(200).json({
            success: true,
            data: donaciones,
            message: 'Donaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER DONACIONES POR PROYECTO
// ======================================================
const obtenerDonacionesPorProyecto = async (req, res, next) => {
    try {
        const { idProyecto } = req.params;

        if (!idProyecto) {
            return res.status(400).json({
                success: false,
                message: 'El ID del proyecto es requerido'
            });
        }

        const donaciones = await donacionesService.obtenerDonacionesPorProyecto(idProyecto);

        res.status(200).json({
            success: true,
            data: donaciones,
            message: 'Donaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER DONACIONES POR ESTADO
// ======================================================
const obtenerDonacionesPorEstado = async (req, res, next) => {
    try {
        const { estado } = req.params;

        if (!estado) {
            return res.status(400).json({
                success: false,
                message: 'El estado es requerido'
            });
        }

        const donaciones = await donacionesService.obtenerDonacionesPorEstado(estado);

        res.status(200).json({
            success: true,
            data: donaciones,
            message: 'Donaciones obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
// ======================================================
// PUT - CONFIRMAR DONACIÓN (admin) — RF-07
// ======================================================

const confirmarDonacion = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'El ID es requerido' });
        const donacion = await donacionesService.confirmarDonacion(id, req.user.id);
        res.status(200).json({ success: true, data: donacion, message: 'Donación confirmada correctamente' });
    } catch (error) { next(error); }
};


// ======================================================
// PUT - RECHAZAR DONACIÓN (admin) — RF-07
// ======================================================

const rechazarDonacion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { motivo_rechazo } = req.body;
        if (!id) return res.status(400).json({ success: false, message: 'El ID es requerido' });
        if (!motivo_rechazo) return res.status(400).json({ success: false, message: 'El motivo de rechazo es obligatorio' });
        const donacion = await donacionesService.rechazarDonacion(id, req.user.id, motivo_rechazo);
        res.status(200).json({ success: true, data: donacion, message: 'Donación rechazada correctamente' });
    } catch (error) { next(error); }
};


// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================

module.exports = {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion,
    obtenerDonacionesPorUsuario,
    obtenerDonacionesPorProyecto,
    obtenerDonacionesPorEstado,
    confirmarDonacion,
    rechazarDonacion,
};
