const express = require('express');
const router = express.Router();
const tipoPagoController = require('../controllers/tipo.pago.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

router.get('/buscar/:descripcion', autenticarUsuario, exigirRol(['admin', 'exalumno', 'voluntario']), tipoPagoController.buscarTiposPagoPorDescripcion);
router.get('/', autenticarUsuario, exigirRol(['admin', 'exalumno', 'voluntario']), tipoPagoController.obtenerTiposPago);
router.get('/:id', autenticarUsuario, exigirRol(['admin', 'exalumno', 'voluntario']), tipoPagoController.obtenerTipoPagoPorId);
router.post('/', autenticarUsuario, exigirRol('admin'), tipoPagoController.crearTipoPago);
router.put('/:id', autenticarUsuario, exigirRol('admin'), tipoPagoController.actualizarTipoPago);
router.delete('/:id', autenticarUsuario, exigirRol('admin'), tipoPagoController.eliminarTipoPago);

module.exports = router;
