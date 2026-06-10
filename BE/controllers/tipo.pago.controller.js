const tipoPagoService = require('../services/tipoPagoService');

// ======================================================
// OBTENER TODOS LOS TIPOS DE PAGO
// ======================================================

const obtenerTiposPago = async (req, res) => {
    try {
        const tiposPago = await tipoPagoService.obtenerTiposPago();

        res.status(200).json(tiposPago);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los tipos de pago',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER TIPO DE PAGO POR ID
// ======================================================

const obtenerTipoPagoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const tipoPago =
            await tipoPagoService.obtenerTipoPagoPorId(id);

        res.status(200).json(tipoPago);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el tipo de pago',
            error: error.message
        });
    }
};

// ======================================================
// CREAR TIPO DE PAGO
// ======================================================

const crearTipoPago = async (req, res) => {
    try {
        const nuevoTipoPago =
            await tipoPagoService.crearTipoPago(req.body);

        res.status(201).json({
            mensaje: 'Tipo de pago creado correctamente',
            data: nuevoTipoPago
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el tipo de pago',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR TIPO DE PAGO
// ======================================================

const actualizarTipoPago = async (req, res) => {
    try {
        const { id } = req.params;

        const tipoPagoActualizado =
            await tipoPagoService.actualizarTipoPago(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Tipo de pago actualizado correctamente',
            data: tipoPagoActualizado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar el tipo de pago',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR TIPO DE PAGO
// ======================================================

const eliminarTipoPago = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await tipoPagoService.eliminarTipoPago(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el tipo de pago',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR TIPOS DE PAGO POR DESCRIPCIÓN
// ======================================================

const buscarTiposPagoPorDescripcion = async (req, res) => {
    try {
        const { descripcion } = req.params;

        const tiposPago =
            await tipoPagoService.buscarTiposPagoPorDescripcion(
                descripcion
            );

        res.status(200).json(tiposPago);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar tipos de pago por descripción',
            error: error.message
        });
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