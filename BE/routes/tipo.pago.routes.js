const express = require('express');
const router = express.Router();
const tipoPagoController = require('../controllers/tipo.pago.controller');

router.get('/buscar/:descripcion', tipoPagoController.buscarTiposPagoPorDescripcion);
router.get('/', tipoPagoController.obtenerTiposPago);
router.get('/:id', tipoPagoController.obtenerTipoPagoPorId);
router.post('/', tipoPagoController.crearTipoPago);
router.put('/:id', tipoPagoController.actualizarTipoPago);
router.delete('/:id', tipoPagoController.eliminarTipoPago);

module.exports = router;
