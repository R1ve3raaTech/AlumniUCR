const donacionesService = require('../services/donacionesService');

// ======================================================
// GET - OBTENER TODAS LAS DONACIONES
// ======================================================
const obtenerDonaciones = async (req, res) => {
    try {
        const donaciones = await donacionesService.obtenerDonaciones();
        res.status(200).json({
            success: true,
            data: donaciones,
            message: 'Donaciones obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener donaciones',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER DONACIÓN POR ID
// ======================================================
const obtenerDonacionPorId = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener donación',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR DONACIÓN
// ======================================================
const crearDonacion = async (req, res) => {
    try {
        const {
            IdUsuarioExalumno,
            IdTipoPago,
            Monto,
            IdProyecto,
            Moneda,
            FechaHoraTransferencia,
            NumeroReferencia,
            Comprobante,
            Mensaje,
            Estado
        } = req.body;

        // Validaciones
        if (!IdUsuarioExalumno) {
            return res.status(400).json({
                success: false,
                message: 'El IdUsuarioExalumno es requerido'
            });
        }

        if (!IdTipoPago) {
            return res.status(400).json({
                success: false,
                message: 'El IdTipoPago es requerido'
            });
        }

        if (!Monto || Monto <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a 0'
            });
        }

        if (!IdProyecto) {
            return res.status(400).json({
                success: false,
                message: 'El IdProyecto es requerido'
            });
        }

        if (!Moneda) {
            return res.status(400).json({
                success: false,
                message: 'La moneda es requerida'
            });
        }

        if (!FechaHoraTransferencia) {
            return res.status(400).json({
                success: false,
                message: 'La fecha y hora de transferencia es requerida'
            });
        }

        if (!NumeroReferencia) {
            return res.status(400).json({
                success: false,
                message: 'El número de referencia es requerido'
            });
        }

        const nuevaDonacion = await donacionesService.crearDonacion({
            IdUsuarioExalumno,
            IdTipoPago,
            Monto,
            IdProyecto,
            Moneda,
            FechaHoraTransferencia,
            NumeroReferencia,
            Comprobante: Comprobante ? Comprobante.trim() : null,
            Mensaje: Mensaje ? Mensaje.trim() : null,
            Estado: Estado || 'pendiente'
        });

        res.status(201).json({
            success: true,
            data: nuevaDonacion,
            message: 'Donación creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear donación',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR DONACIÓN
// ======================================================
const actualizarDonacion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            IdUsuarioExalumno,
            IdTipoPago,
            Monto,
            IdProyecto,
            Moneda,
            FechaHoraTransferencia,
            NumeroReferencia,
            Comprobante,
            Mensaje,
            Estado
        } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (IdUsuarioExalumno !== undefined) datosActualizar.IdUsuarioExalumno = IdUsuarioExalumno;
        if (IdTipoPago !== undefined) datosActualizar.IdTipoPago = IdTipoPago;
        if (Monto !== undefined) {
            if (Monto <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El monto debe ser mayor a 0'
                });
            }
            datosActualizar.Monto = Monto;
        }
        if (IdProyecto !== undefined) datosActualizar.IdProyecto = IdProyecto;
        if (Moneda !== undefined) datosActualizar.Moneda = Moneda;
        if (FechaHoraTransferencia !== undefined) datosActualizar.FechaHoraTransferencia = FechaHoraTransferencia;
        if (NumeroReferencia !== undefined) datosActualizar.NumeroReferencia = NumeroReferencia;
        if (Comprobante !== undefined) datosActualizar.Comprobante = Comprobante ? Comprobante.trim() : null;
        if (Mensaje !== undefined) datosActualizar.Mensaje = Mensaje ? Mensaje.trim() : null;
        if (Estado !== undefined) datosActualizar.Estado = Estado;

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
        res.status(500).json({
            success: false,
            message: 'Error al actualizar donación',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR DONACIÓN
// ======================================================
const eliminarDonacion = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al eliminar donación',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER DONACIONES POR USUARIO
// ======================================================
const obtenerDonacionesPorUsuario = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener donaciones por usuario',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER DONACIONES POR PROYECTO
// ======================================================
const obtenerDonacionesPorProyecto = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener donaciones por proyecto',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER DONACIONES POR ESTADO
// ======================================================
const obtenerDonacionesPorEstado = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener donaciones por estado',
            error: error.message
        });
    }
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
    obtenerDonacionesPorEstado
};