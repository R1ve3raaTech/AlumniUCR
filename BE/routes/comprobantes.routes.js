// Rutas de comprobantes de donación (RF-07 — Storage). NUEVO y aislado.
// Se monta en /api/comprobantes (base propia) para no colisionar con las rutas
// de /api/donaciones de Adri.

const express = require('express');
const multer = require('multer');
const router = express.Router();
const comprobanteController = require('../controllers/comprobante.controller');
const autenticarUsuario = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

// Archivo en memoria, máx 5MB, solo imágenes y PDF.
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (TIPOS_PERMITIDOS.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG o PDF.'));
    },
});

// Envuelve multer para devolver errores claros (tamaño/tipo) como 400.
const recibirArchivo = (req, res, next) => {
    upload.single('archivo')(req, res, (err) => {
        if (err) {
            const msg = err.code === 'LIMIT_FILE_SIZE'
                ? 'El archivo supera el máximo permitido de 5MB.'
                : err.message;
            return res.status(400).json({ success: false, message: msg });
        }
        next();
    });
};

// POST /api/comprobantes — sube el comprobante (exalumno o voluntario). Devuelve la ruta.
router.post(
    '/',
    autenticarUsuario,
    exigirRol(['exalumno', 'voluntario']),
    recibirArchivo,
    comprobanteController.subirComprobante,
);

// GET /api/comprobantes/url?path=... — signed URL para ver el comprobante (admin, exalumno o voluntario).
router.get(
    '/url',
    autenticarUsuario,
    exigirRol(['admin', 'exalumno', 'voluntario']),
    comprobanteController.obtenerUrlComprobante,
);

module.exports = router;
