const tipoPagoService = require('../services/tipoPagoService');

// ======================================================
// OBTENER TODOS LOS TIPOS DE PAGO
// ======================================================

const obtenerTiposPago = async (req, res, next) => {
    try {
        const tiposPago = await tipoPagoService.obtenerTiposPago();

        res.status(200).json({
            success: true,
            data: tiposPago,
            message: 'Tipos de pago obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER TIPO DE PAGO POR ID
// ======================================================

const obtenerTipoPagoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tipoPago =
            await tipoPagoService.obtenerTipoPagoPorId(id);

        if (!tipoPago) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de pago no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: tipoPago,
            message: 'Tipo de pago obtenido correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR TIPO DE PAGO
// ======================================================

const crearTipoPago = async (req, res, next) => {
    try {
        const { descripcion } = req.body;

        if (!descripcion) {
            return res.status(400).json({
                success: false,
                message: 'La descripción es requerida'
            });
        }

        const nuevoTipoPago = await tipoPagoService.crearTipoPago({
            descripcion: descripcion.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevoTipoPago,
            message: 'Tipo de pago creado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR TIPO DE PAGO
// ======================================================

const actualizarTipoPago = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { descripcion } = req.body;

        if (!descripcion) {
            return res.status(400).json({
                success: false,
                message: 'La descripción es requerida'
            });
        }

        const tipoPagoActualizado =
            await tipoPagoService.actualizarTipoPago(id, {
                descripcion: descripcion.trim()
            });

        res.status(200).json({
            success: true,
            data: tipoPagoActualizado,
            message: 'Tipo de pago actualizado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR TIPO DE PAGO
// ======================================================

const eliminarTipoPago = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado =
            await tipoPagoService.eliminarTipoPago(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Tipo de pago eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR TIPOS DE PAGO POR DESCRIPCIÓN
// ======================================================

const buscarTiposPagoPorDescripcion = async (req, res, next) => {
    try {
        const { descripcion } = req.params;

        const tiposPago =
            await tipoPagoService.buscarTiposPagoPorDescripcion(
                descripcion
            );

        res.status(200).json({
            success: true,
            data: tiposPago,
            message: 'Tipos de pago obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerTiposPago,
    obtenerTipoPagoPorId,
    crearTipoPago,
    actualizarTipoPago,
    eliminarTipoPago,
    buscarTiposPagoPorDescripcion
};
