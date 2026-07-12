// Controlador de Matching Mentoría (RF-06).
// Gestiona el ciclo de vida completo de los matches entre exalumnos y estudiantes.

const matchesMentoriaService = require('../../services/matching/matchesMentoriaService');
const { verificarToken } = require('../../utils/aprobacionToken');

// Página HTML mínima para las acciones hechas desde el correo (mismo estilo
// que la aprobación de cuentas).
const paginaResultado = (titulo, mensaje, color) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titulo} — Conectando Talento UCR</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;margin:0;padding:40px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.08)">
    <h1 style="color:${color};font-size:22px;margin:0 0 12px">${titulo}</h1>
    <p style="color:#444;line-height:1.5;margin:0">${mensaje}</p>
  </div>
</body></html>`;


// ======================================================
// POST - GENERAR MATCHES (al completar perfil)
// ======================================================

const generarMatches = async (req, res, next) => {
    try {
        const idUsuario = req.user.id;
        const rol = req.user.profile?.roles?.nombre?.toLowerCase();

        if (rol !== 'estudiante' && rol !== 'exalumno') {
            return res.status(403).json({
                success: false,
                message: 'Solo estudiantes y exalumnos pueden generar matches'
            });
        }

        const resultado = await matchesMentoriaService.generarMatchesPorUsuario(idUsuario, rol);

        res.status(200).json({
            success: true,
            data: resultado,
            message: `Se generaron ${resultado.generados} matches correctamente`
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - MIS MATCHES (usuario autenticado)
// ======================================================

const obtenerMisMatches = async (req, res, next) => {
    try {
        const idUsuario = req.user.id;
        const rol = req.user.profile?.roles?.nombre?.toLowerCase();

        const matches = await matchesMentoriaService.obtenerMisMatches(idUsuario, rol);

        res.status(200).json({
            success: true,
            data: matches,
            message: 'Matches obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// PUT - CONTACTAR (sugerido → contactado)
// ======================================================

const contactarMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID del match es requerido'
            });
        }

        const match = await matchesMentoriaService.contactarMatch(id, req.user.id);

        res.status(200).json({
            success: true,
            data: match,
            message: 'Conexión iniciada correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// PUT - ACEPTAR (contactado → activo)
// ======================================================

const aceptarMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID del match es requerido'
            });
        }

        const match = await matchesMentoriaService.aceptarMatch(id, req.user.id);

        res.status(200).json({
            success: true,
            data: match,
            message: 'Conexión aceptada correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - ACEPTAR DESDE EL CORREO (enlace firmado, sin sesión)
// El destinatario del correo de "nueva conexión" acepta con un clic.
// Rechazar no requiere acción (basta ignorar el correo).
// ======================================================

const aceptarDesdeCorreo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { u: idUsuario, token } = req.query;

        if (!id || !idUsuario || !verificarToken(idUsuario, token, `aceptar-match:${id}`)) {
            return res
                .status(403)
                .type('html')
                .send(paginaResultado('✗ Enlace inválido', 'Este enlace no es válido o fue alterado. Ingresá a la plataforma para gestionar tus conexiones.', '#dc2626'));
        }

        const match = await matchesMentoriaService.aceptarMatch(id, idUsuario);

        return res
            .status(200)
            .type('html')
            .send(paginaResultado(
                '✓ ¡Conexión aceptada!',
                `El match quedó activo (afinidad ${match.score_match ?? '—'}%). Ambas partes recibirán un correo con el contacto del otro para coordinar directamente.`,
                '#16a34a',
            ));
    } catch (error) {
        if (error.statusCode) {
            const yaProcesado = error.statusCode === 400;
            return res
                .status(error.statusCode)
                .type('html')
                .send(paginaResultado(
                    yaProcesado ? 'Esta solicitud ya fue gestionada' : '✗ No se pudo aceptar',
                    yaProcesado
                        ? 'La conexión ya fue aceptada o cerrada anteriormente. Podés ver su estado en tu panel de matches.'
                        : error.message,
                    yaProcesado ? '#b45309' : '#dc2626',
                ));
        }
        next(error);
    }
};


// ======================================================
// PUT - RECHAZAR (contactado → cerrado)
// ======================================================

const rechazarMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID del match es requerido'
            });
        }

        const match = await matchesMentoriaService.rechazarMatch(id, req.user.id);

        res.status(200).json({
            success: true,
            data: match,
            message: 'Conexión rechazada correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - TODOS LOS MATCHES (admin)
// ======================================================

const obtenerTodosLosMatches = async (req, res, next) => {
    try {
        const filtros = {};
        if (req.query.estado) filtros.estado = req.query.estado;

        const matches = await matchesMentoriaService.obtenerTodosLosMatches(filtros);

        res.status(200).json({
            success: true,
            data: matches,
            message: 'Matches obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// PUT - ACTUALIZAR MATCH (admin: notas + estado)
// ======================================================

const actualizarMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID del match es requerido'
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay datos para actualizar'
            });
        }

        const match = await matchesMentoriaService.actualizarMatch(id, req.body);

        res.status(200).json({
            success: true,
            data: match,
            message: 'Match actualizado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - EXPLICACIÓN DE MATCH CON IA
// ======================================================

const obtenerExplicacionIA = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID del match es requerido'
            });
        }

        const explicacion = await matchesMentoriaService.generarExplicacionIA(id);

        res.status(200).json({
            success: true,
            data: { explicacion },
            message: 'Explicación del match generada correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {
    generarMatches,
    obtenerMisMatches,
    contactarMatch,
    aceptarMatch,
    aceptarDesdeCorreo,
    rechazarMatch,
    obtenerTodosLosMatches,
    actualizarMatch,
    obtenerExplicacionIA,
};