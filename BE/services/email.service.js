// Servicio de envío de correos (Resend).
//
// Se usa para notificar al administrador de aprobaciones cada vez que se registra
// un estudiante o exalumno. Si RESEND_API_KEY no está configurada, las funciones
// no fallan: registran una advertencia y devuelven false, de modo que el registro
// del usuario sigue funcionando (la cuenta queda en estado 'pendiente').

const { Resend } = require('resend');

// Correo fijo que recibe y aprueba/rechaza la creación de cada cuenta.
const CORREO_APROBADOR = process.env.APROBACION_CORREO || 'cjimenezrfwd@gmail.com';

// Remitente. En sandbox de Resend (sin dominio verificado) debe usarse
// onboarding@resend.dev y solo se puede enviar al correo dueño de la cuenta.
const REMITENTE = process.env.RESEND_FROM || 'Conectando Talento UCR <onboarding@resend.dev>';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Envía al correo aprobador un mensaje con los enlaces para aprobar o rechazar
 * la creación de la cuenta recién registrada.
 *
 * @param {object} params
 * @param {string} params.nombre       Nombre del usuario registrado.
 * @param {string} params.correo       Correo del usuario registrado.
 * @param {string} params.rol          'Estudiante' | 'Exalumno'.
 * @param {string} params.aprobarUrl   URL que aprueba la cuenta.
 * @param {string} params.rechazarUrl  URL que rechaza la cuenta.
 * @returns {Promise<boolean>} true si se envió; false si no había API key o falló.
 */
const enviarCorreoAprobacion = async ({ nombre, correo, rol, aprobarUrl, rechazarUrl }) => {
  if (!resend) {
    console.warn(
      '⚠️  RESEND_API_KEY no configurada: no se envió el correo de aprobación. ' +
        `Aprobar manualmente: ${aprobarUrl}`,
    );
    return false;
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#5b3df5">Nueva solicitud de cuenta</h2>
      <p>Se registró un nuevo usuario y requiere tu aprobación:</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Nombre</td><td><strong>${nombre}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Correo</td><td><strong>${correo}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Rol</td><td><strong>${rol}</strong></td></tr>
      </table>
      <p style="margin:24px 0">
        <a href="${aprobarUrl}" style="background:#16a34a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;margin-right:12px">✓ Aprobar cuenta</a>
        <a href="${rechazarUrl}" style="background:#dc2626;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">✗ Rechazar cuenta</a>
      </p>
      <p style="font-size:12px;color:#999">Si no reconoces esta solicitud, puedes ignorar este correo o rechazarla.</p>
    </div>`;

  try {
    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: CORREO_APROBADOR,
      subject: `Aprobación de cuenta — ${nombre} (${rol})`,
      html,
    });
    if (error) {
      console.error('🔴 Error al enviar el correo de aprobación:', error.message || error);
      return false;
    }
    console.log(`📧 Correo de aprobación enviado a ${CORREO_APROBADOR} para ${correo}.`);
    return true;
  } catch (err) {
    console.error('🔴 Excepción al enviar el correo de aprobación:', err.message);
    return false;
  }
};

module.exports = { enviarCorreoAprobacion, CORREO_APROBADOR };
