// Controlador de comprobantes de donación (RF-07 — Storage).
// NUEVO y aislado: no modifica el flujo de donaciones existente. El campo
// `comprobante` de la donación sigue siendo un string; ahora guarda la RUTA del
// archivo en el bucket privado `comprobantes` (antes era una URL de texto).
//
// - subirComprobante: recibe el archivo (multer, en memoria), lo sube al bucket
//   con el cliente service_role y devuelve la ruta.
// - obtenerUrlComprobante: genera una signed URL temporal para visualizarlo
//   (el bucket es privado → solo se ve con URL firmada).

const supabase = require('../config/supabase');

const BUCKET = 'comprobantes';

// Sube el archivo ya validado por multer (tamaño y tipo) al bucket privado.
const subirComprobante = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se recibió ningún archivo.' });
        }

        // Nombre único por usuario para evitar colisiones.
        const ext = (req.file.originalname.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
        const idUsuario = req.user?.id || 'anon';
        const ruta = `${idUsuario}/${Date.now()}.${ext}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(ruta, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false,
            });

        if (error) {
            return res.status(500).json({ success: false, message: `No se pudo subir el comprobante: ${error.message}` });
        }

        res.status(201).json({ success: true, data: { path: ruta }, message: 'Comprobante subido correctamente' });
    } catch (error) {
        next(error);
    }
};

// Devuelve una signed URL temporal (1 hora) para ver un comprobante del bucket privado.
const obtenerUrlComprobante = async (req, res, next) => {
    try {
        const ruta = req.query.path;
        if (!ruta) {
            return res.status(400).json({ success: false, message: 'El parámetro path es requerido.' });
        }

        const { data, error } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(ruta, 3600);

        if (error) {
            return res.status(404).json({ success: false, message: `No se pudo generar la URL: ${error.message}` });
        }

        res.status(200).json({ success: true, data: { url: data.signedUrl } });
    } catch (error) {
        next(error);
    }
};

module.exports = { subirComprobante, obtenerUrlComprobante };
