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

/**
 * Envía al usuario el código de verificación para restablecer su contraseña.
 * @param {object} params
 * @param {string} params.correo  Destinatario.
 * @param {string} params.codigo  Código de 6 dígitos (vigencia ~10-15 min).
 * @returns {Promise<boolean>}
 */
const enviarCorreoRecuperacion = async ({ correo, codigo }) => {
  if (!resend) {
    console.warn(
      '⚠️  RESEND_API_KEY no configurada: no se envió el correo de recuperación. ' +
        `Código de verificación: ${codigo}`,
    );
    return false;
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#003445">Restablece tu contraseña</h2>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Alumni UCR. Usá este código de verificación en la página de recuperación:</p>
      <p style="margin:28px 0;text-align:center">
        <span style="display:inline-block;background:#f2f6f8;border:1px solid #d7e3e9;border-radius:12px;padding:16px 28px;font-size:34px;font-weight:bold;letter-spacing:10px;color:#003445">${codigo}</span>
      </p>
      <p style="font-size:13px;color:#666">El código expira en unos 10 minutos por seguridad. Si no solicitaste el cambio, ignorá este correo: tu contraseña no cambiará.</p>
    </div>`;

  try {
    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: correo,
      subject: `${codigo} es tu código para restablecer la contraseña — Alumni UCR`,
      html,
    });
    if (error) {
      console.error('🔴 Error al enviar el correo de recuperación:', error.message || error);
      // Fallback útil en desarrollo (sandbox de Resend): registrar el código.
      console.warn(`🔑 Código de verificación para ${correo}: ${codigo}`);
      return false;
    }
    console.log(`📧 Correo de recuperación enviado a ${correo}.`);
    return true;
  } catch (err) {
    console.error('🔴 Excepción al enviar el correo de recuperación:', err.message);
    console.warn(`🔑 Código de verificación para ${correo}: ${codigo}`);
    return false;
  }
};

/**
 * Envía al voluntario aprobado el enlace para definir su contraseña y entrar
 * a la plataforma (su cuenta se crea al aprobar la solicitud de colaboración).
 * @param {object} params
 * @param {string} params.nombre
 * @param {string} params.correo  Destinatario.
 * @param {string} params.url     Enlace para definir la contraseña (con token).
 * @returns {Promise<boolean>}
 */
const enviarCorreoBienvenidaVoluntario = async ({ nombre, correo, url }) => {
  if (!resend) {
    console.warn(
      '⚠️  RESEND_API_KEY no configurada: no se envió el correo de bienvenida del voluntario. ' +
        `Definir contraseña manualmente: ${url}`,
    );
    return false;
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#004C63">¡Tu solicitud fue aprobada!</h2>
      <p>Hola ${nombre || ''}, la administración de Alumni UCR aprobó tu solicitud de colaboración como voluntario.</p>
      <p>Ya creamos tu cuenta con este correo. Para empezar, definí tu contraseña:</p>
      <p style="margin:24px 0">
        <a href="${url}" style="background:#F34B26;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold">Definir mi contraseña</a>
      </p>
      <p style="font-size:13px;color:#666">Después podrás iniciar sesión en la plataforma y explorar los proyectos de los estudiantes. Si no enviaste esta solicitud, ignorá este correo.</p>
    </div>`;

  try {
    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: correo,
      subject: '¡Bienvenido a Alumni UCR! Definí tu contraseña para empezar',
      html,
    });
    if (error) {
      console.error('🔴 Error al enviar la bienvenida del voluntario:', error.message || error);
      console.warn(`🔗 Enlace para definir contraseña de ${correo}: ${url}`);
      return false;
    }
    console.log(`📧 Correo de bienvenida de voluntario enviado a ${correo}.`);
    return true;
  } catch (err) {
    console.error('🔴 Excepción al enviar la bienvenida del voluntario:', err.message);
    console.warn(`🔗 Enlace para definir contraseña de ${correo}: ${url}`);
    return false;
  }
};

/**
 * Envía al exalumno el enlace para confirmar su cuenta (registro por
 * autodeclaración). Hasta confirmar, la cuenta queda pendiente.
 * @param {object} params
 * @param {string} params.nombre
 * @param {string} params.correo  Destinatario.
 * @param {string} params.url     Enlace de confirmación (con token).
 * @returns {Promise<boolean>}
 */
const enviarCorreoConfirmacionExalumno = async ({ nombre, correo, url }) => {
  if (!resend) {
    console.warn(
      '⚠️  RESEND_API_KEY no configurada: no se envió el correo de confirmación. ' +
        `Confirmar manualmente: ${url}`,
    );
    return false;
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#004C63">Confirma tu cuenta de exalumno</h2>
      <p>Hola ${nombre || ''}, gracias por unirte a la red Alumni UCR.</p>
      <p>Confirma tu correo para activar tu cuenta:</p>
      <p style="margin:24px 0">
        <a href="${url}" style="background:#F34B26;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold">Confirmar mi cuenta</a>
      </p>
      <p style="font-size:13px;color:#666">Si no creaste esta cuenta, ignora este correo.</p>
    </div>`;

  try {
    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: correo,
      subject: 'Confirma tu cuenta — Alumni UCR',
      html,
    });
    if (error) {
      console.error('🔴 Error al enviar el correo de confirmación:', error.message || error);
      console.warn(`🔗 Enlace de confirmación: ${url}`);
      return false;
    }
    console.log(`📧 Correo de confirmación enviado a ${correo}.`);
    return true;
  } catch (err) {
    console.error('🔴 Excepción al enviar el correo de confirmación:', err.message);
    console.warn(`🔗 Enlace de confirmación: ${url}`);
    return false;
  }
};

/**
 * RF-06: Notifica a la otra parte cuando alguien inicia una conexión (contactar).
 * @param {object} params
 * @param {string} params.nombre_remitente   Nombre de quien inició el contacto.
 * @param {string} params.correo_destinatario Correo de quien recibe la notificación.
 * @param {string} params.nombre_destinatario Nombre de quien recibe la notificación.
 * @param {string} params.rol_remitente      'estudiante' | 'exalumno'
 * @returns {Promise<boolean>}
 */
const enviarCorreoNuevoContacto = async ({ nombre_remitente, correo_destinatario, nombre_destinatario, rol_remitente, aceptar_url }) => {
  if (!resend) {
    console.warn(`⚠️  RESEND_API_KEY no configurada: no se envió notificación de contacto a ${correo_destinatario}.`);
    return false;
  }

  const tipoRemitente = rol_remitente === 'exalumno' ? 'un exalumno' : 'un estudiante';
  const botonAceptar = aceptar_url
    ? `<p style="margin:24px 0">
        <a href="${aceptar_url}" style="background:#16a34a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold">✓ Aceptar conexión</a>
      </p>`
    : '<p>Ingresa a la plataforma para aceptar esta solicitud.</p>';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#5b3df5">Nueva solicitud de conexión</h2>
      <p>Hola <strong>${nombre_destinatario || ''}</strong>,</p>
      <p><strong>${nombre_remitente}</strong> (${tipoRemitente}) ha iniciado una conexión contigo en Conectando Talento UCR.</p>
      <p>Al aceptar, ambos recibirán el correo del otro para coordinar directamente.</p>
      ${botonAceptar}
      <p style="font-size:13px;color:#666">Si no te interesa esta conexión, simplemente ignora este correo. También puedes gestionarla desde tu panel de matches en la plataforma.</p>
    </div>`;

  try {
    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: correo_destinatario,
      subject: `${nombre_remitente} quiere conectar contigo — Conectando Talento UCR`,
      html,
    });
    if (error) { console.error('🔴 Error al enviar notificación de contacto:', error.message || error); return false; }
    console.log(`📧 Notificación de contacto enviada a ${correo_destinatario}.`);
    return true;
  } catch (err) {
    console.error('🔴 Excepción al enviar notificación de contacto:', err.message);
    return false;
  }
};


/**
 * RF-06: Notifica a ambas partes cuando el match queda activo (aceptar).
 * Incluye el correo de la otra parte para que puedan coordinarse directamente.
 * @param {object} params
 * @param {string} params.nombre_a    Nombre del exalumno.
 * @param {string} params.correo_a    Correo del exalumno.
 * @param {string} params.nombre_b    Nombre del estudiante.
 * @param {string} params.correo_b    Correo del estudiante.
 * @returns {Promise<boolean[]>}
 */
const enviarCorreoMatchActivo = async ({ nombre_a, correo_a, nombre_b, correo_b }) => {
  if (!resend) {
    console.warn(`⚠️  RESEND_API_KEY no configurada: no se enviaron correos de match activo.`);
    return [false, false];
  }

  const htmlParaA = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#16a34a">¡Conexión aceptada!</h2>
      <p>Hola <strong>${nombre_a}</strong>,</p>
      <p><strong>${nombre_b}</strong> aceptó tu solicitud de conexión en Conectando Talento UCR.</p>
      <p>Puedes contactarle directamente a: <strong>${correo_b}</strong></p>
      <p style="font-size:13px;color:#666">Recuerda que el objetivo es apoyar el proyecto de graduación de ${nombre_b}. ¡Mucho éxito!</p>
    </div>`;

  const htmlParaB = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#16a34a">¡Conexión activa con un exalumno!</h2>
      <p>Hola <strong>${nombre_b}</strong>,</p>
      <p>Aceptaste la conexión con <strong>${nombre_a}</strong> en Conectando Talento UCR.</p>
      <p>Puedes contactarle directamente a: <strong>${correo_a}</strong></p>
      <p style="font-size:13px;color:#666">¡Esta es una gran oportunidad para tu proyecto de graduación!</p>
    </div>`;

  try {
    const [resA, resB] = await Promise.all([
      resend.emails.send({ from: REMITENTE, to: correo_a, subject: `¡Conexión aceptada con ${nombre_b}! — Conectando Talento UCR`, html: htmlParaA }),
      resend.emails.send({ from: REMITENTE, to: correo_b, subject: `¡Conectado con ${nombre_a}! — Conectando Talento UCR`, html: htmlParaB }),
    ]);
    if (resA.error) console.error('🔴 Error correo match activo (exalumno):', resA.error.message);
    if (resB.error) console.error('🔴 Error correo match activo (estudiante):', resB.error.message);
    console.log(`📧 Correos de match activo enviados: ${correo_a}, ${correo_b}.`);
    return [!resA.error, !resB.error];
  } catch (err) {
    console.error('🔴 Excepción al enviar correos de match activo:', err.message);
    return [false, false];
  }
};


/**
 * RF-06: Notifica al admin cuando un match queda activo.
 * @param {object} params
 * @param {string} params.nombre_exalumno
 * @param {string} params.nombre_estudiante
 * @param {number} params.score_match
 * @returns {Promise<boolean>}
 */
const enviarCorreoMatchActivoAdmin = async ({ nombre_exalumno, nombre_estudiante, score_match }) => {
  if (!resend) {
    console.warn(`⚠️  RESEND_API_KEY no configurada: no se notificó al admin del match activo.`);
    return false;
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#5b3df5">Nuevo match activo</h2>
      <p>Se ha establecido una nueva conexión en Conectando Talento UCR:</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Exalumno</td><td><strong>${nombre_exalumno}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Estudiante</td><td><strong>${nombre_estudiante}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Score</td><td><strong>${score_match}/100</strong></td></tr>
      </table>
      <p style="font-size:13px;color:#666">Puedes ver el detalle en el panel de administración.</p>
    </div>`;

  try {
    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: CORREO_APROBADOR,
      subject: `Nuevo match activo: ${nombre_exalumno} ↔ ${nombre_estudiante}`,
      html,
    });
    if (error) { console.error('🔴 Error al notificar al admin del match activo:', error.message || error); return false; }
    console.log(`📧 Admin notificado del match activo: ${nombre_exalumno} ↔ ${nombre_estudiante}.`);
    return true;
  } catch (err) {
    console.error('🔴 Excepción al notificar al admin:', err.message);
    return false;
  }
};


/**
 * RF-08: Notifica al admin cuando llega una nueva donación (SLA: 24 horas hábiles).
 * @param {object} params
 * @param {string} params.nombre_exalumno
 * @param {number} params.monto
 * @param {string} params.moneda           'CRC' | 'USD'
 * @param {string} params.metodo_pago      'SINPE Móvil' | 'Transferencia bancaria (IBAN)'
 * @param {string} params.proyecto_titulo  Título del proyecto destino o 'Fondo general'
 * @returns {Promise<boolean>}
 */
const enviarCorreoNuevaDonacion = async ({ nombre_exalumno, monto, moneda, metodo_pago, proyecto_titulo }) => {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY no configurada: no se notificó al admin de la nueva donación.');
    return false;
  }
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#5b3df5">Nueva donación pendiente de verificación</h2>
      <p>Se recibió un comprobante de donación que requiere tu confirmación en menos de 24 horas hábiles:</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Donante</td><td><strong>${nombre_exalumno}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Monto</td><td><strong>${monto} ${moneda}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Método</td><td><strong>${metodo_pago}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Destino</td><td><strong>${proyecto_titulo}</strong></td></tr>
      </table>
      <p style="font-size:13px;color:#666">Ingresa al panel de administración para revisar el comprobante y confirmar o rechazar la donación.</p>
    </div>`;
  try {
    const { error } = await resend.emails.send({ from: REMITENTE, to: CORREO_APROBADOR, subject: `Nueva donación pendiente — ${nombre_exalumno} (${monto} ${moneda})`, html });
    if (error) { console.error('🔴 Error al notificar al admin de donación:', error.message || error); return false; }
    console.log(`📧 Admin notificado de nueva donación de ${nombre_exalumno}.`);
    return true;
  } catch (err) { console.error('🔴 Excepción al notificar donación al admin:', err.message); return false; }
};


/**
 * RF-07: Notifica al exalumno y al estudiante cuando el admin confirma la donación.
 * @param {object} params
 * @param {string} params.correo_exalumno
 * @param {string} params.nombre_exalumno
 * @param {string} params.correo_estudiante
 * @param {string} params.nombre_estudiante
 * @param {number} params.monto
 * @param {string} params.moneda
 * @param {string} params.proyecto_titulo
 * @param {string} params.mensaje           Mensaje personalizado del exalumno (opcional)
 * @returns {Promise<boolean[]>}
 */
const enviarCorreoConfirmacionDonacion = async ({ correo_exalumno, nombre_exalumno, correo_estudiante, nombre_estudiante, monto, moneda, proyecto_titulo, mensaje }) => {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY no configurada: no se enviaron correos de confirmación de donación.');
    return [false, false];
  }
  const htmlExalumno = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#16a34a">¡Tu donación fue confirmada!</h2>
      <p>Hola <strong>${nombre_exalumno}</strong>, tu donación ha sido verificada y registrada exitosamente.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Monto</td><td><strong>${monto} ${moneda}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Destino</td><td><strong>${proyecto_titulo}</strong></td></tr>
      </table>
      <p style="font-size:13px;color:#666">¡Gracias por tu generoso aporte a la comunidad UCR!</p>
    </div>`;
  const htmlEstudiante = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#16a34a">¡Recibiste una donación!</h2>
      <p>Hola <strong>${nombre_estudiante}</strong>, el exalumno <strong>${nombre_exalumno}</strong> realizó una donación para tu proyecto.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Monto</td><td><strong>${monto} ${moneda}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Proyecto</td><td><strong>${proyecto_titulo}</strong></td></tr>
        ${mensaje ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Mensaje</td><td><em>${mensaje}</em></td></tr>` : ''}
      </table>
      <p style="font-size:13px;color:#666">¡Mucho éxito en tu proyecto de graduación!</p>
    </div>`;
  try {
    const [resA, resB] = await Promise.all([
      resend.emails.send({ from: REMITENTE, to: correo_exalumno, subject: `Donación confirmada — ${monto} ${moneda}`, html: htmlExalumno }),
      resend.emails.send({ from: REMITENTE, to: correo_estudiante, subject: `¡Recibiste una donación de ${nombre_exalumno}!`, html: htmlEstudiante }),
    ]);
    if (resA.error) console.error('🔴 Error correo confirmación donación (exalumno):', resA.error.message);
    if (resB.error) console.error('🔴 Error correo confirmación donación (estudiante):', resB.error.message);
    console.log(`📧 Correos de confirmación de donación enviados: ${correo_exalumno}, ${correo_estudiante}.`);
    return [!resA.error, !resB.error];
  } catch (err) { console.error('🔴 Excepción correos confirmación donación:', err.message); return [false, false]; }
};


/**
 * RF-07: Notifica al exalumno cuando el admin rechaza su donación (con motivo).
 * @param {object} params
 * @param {string} params.correo_exalumno
 * @param {string} params.nombre_exalumno
 * @param {number} params.monto
 * @param {string} params.moneda
 * @param {string} params.motivo_rechazo
 * @returns {Promise<boolean>}
 */
const enviarCorreoRechazoDonacion = async ({ correo_exalumno, nombre_exalumno, monto, moneda, motivo_rechazo }) => {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY no configurada: no se envió correo de rechazo de donación.');
    return false;
  }
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#dc2626">Donación no pudo ser procesada</h2>
      <p>Hola <strong>${nombre_exalumno}</strong>, lamentablemente no pudimos procesar tu donación.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Monto</td><td><strong>${monto} ${moneda}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Motivo</td><td><strong>${motivo_rechazo}</strong></td></tr>
      </table>
      <p>Si crees que esto es un error, contáctanos respondiendo este correo.</p>
    </div>`;
  try {
    const { error } = await resend.emails.send({ from: REMITENTE, to: correo_exalumno, subject: `Donación no procesada — ${monto} ${moneda}`, html });
    if (error) { console.error('🔴 Error correo rechazo donación:', error.message || error); return false; }
    console.log(`📧 Correo de rechazo de donación enviado a ${correo_exalumno}.`);
    return true;
  } catch (err) { console.error('🔴 Excepción correo rechazo donación:', err.message); return false; }
};


/**
 * RF-10/RF-13: Notifica al candidato seleccionado para una posición.
 * @param {object} params
 * @param {string} params.correo_estudiante
 * @param {string} params.nombre_estudiante
 * @param {string} params.titulo_puesto
 * @param {string} params.empresa
 * @param {string} params.nombre_exalumno
 * @returns {Promise<boolean>}
 */
const enviarCorreoSeleccionAplicante = async ({ correo_estudiante, nombre_estudiante, titulo_puesto, empresa, nombre_exalumno }) => {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY no configurada: no se envió correo de selección.');
    return false;
  }
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#16a34a">¡Fuiste seleccionado!</h2>
      <p>Hola <strong>${nombre_estudiante}</strong>, ¡excelentes noticias!</p>
      <p><strong>${nombre_exalumno}</strong> te seleccionó para la posición:</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Puesto</td><td><strong>${titulo_puesto}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Empresa</td><td><strong>${empresa || 'No especificada'}</strong></td></tr>
      </table>
      <p>Ingresa a la plataforma para ver los detalles de contacto y coordinar los próximos pasos.</p>
      <p style="font-size:13px;color:#666">¡Mucho éxito!</p>
    </div>`;
  try {
    const { error } = await resend.emails.send({ from: REMITENTE, to: correo_estudiante, subject: `¡Fuiste seleccionado para ${titulo_puesto}!`, html });
    if (error) { console.error('🔴 Error correo selección aplicante:', error.message || error); return false; }
    console.log(`📧 Correo de selección enviado a ${correo_estudiante}.`);
    return true;
  } catch (err) { console.error('🔴 Excepción correo selección aplicante:', err.message); return false; }
};


/**
 * RF-10/RF-13: Notifica a los aplicantes descartados (anónimo — no revela quién fue seleccionado).
 * @param {object} params
 * @param {string} params.correo_estudiante
 * @param {string} params.nombre_estudiante
 * @param {string} params.titulo_puesto
 * @returns {Promise<boolean>}
 */
const enviarCorreoDescarteAplicante = async ({ correo_estudiante, nombre_estudiante, titulo_puesto }) => {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY no configurada: no se envió correo de descarte.');
    return false;
  }
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#5b3df5">Actualización sobre tu aplicación</h2>
      <p>Hola <strong>${nombre_estudiante}</strong>,</p>
      <p>La posición <strong>${titulo_puesto}</strong> ya fue cubierta por otro candidato.</p>
      <p>No te desanimes — sigue explorando otras oportunidades en Conectando Talento UCR.</p>
      <p style="font-size:13px;color:#666">¡Mucho ánimo en tu búsqueda!</p>
    </div>`;
  try {
    const { error } = await resend.emails.send({ from: REMITENTE, to: correo_estudiante, subject: `Tu aplicación a ${titulo_puesto} — Actualización`, html });
    if (error) { console.error('🔴 Error correo descarte aplicante:', error.message || error); return false; }
    console.log(`📧 Correo de descarte enviado a ${correo_estudiante}.`);
    return true;
  } catch (err) { console.error('🔴 Excepción correo descarte aplicante:', err.message); return false; }
};



/**
 * RF-09: Notifica al admin cuando un perfil es suspendido automáticamente (3 reportes).
 * @param {object} params
 * @param {string} params.nombre_usuario
 * @param {string} params.correo_usuario
 * @param {string} params.id_usuario
 * @param {number} params.cantidad_reportes
 * @returns {Promise<boolean>}
 */
const enviarCorreoSuspensionAutomatica = async ({ nombre_usuario, correo_usuario, id_usuario, cantidad_reportes }) => {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY no configurada: no se notificó al admin de la suspensión automática.');
    return false;
  }
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#dc2626">Perfil suspendido automáticamente</h2>
      <p>Un perfil ha sido suspendido automáticamente por acumular ${cantidad_reportes} reportes:</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Usuario</td><td><strong>${nombre_usuario}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Correo</td><td><strong>${correo_usuario}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">ID</td><td><strong>${id_usuario}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Reportes</td><td><strong>${cantidad_reportes}</strong></td></tr>
      </table>
      <p>Ingresa al panel de administración para revisar los reportes y decidir si reactivar o eliminar permanentemente el perfil.</p>
    </div>`;
  try {
    const { error } = await resend.emails.send({ from: REMITENTE, to: CORREO_APROBADOR, subject: `Perfil suspendido automáticamente — ${nombre_usuario}`, html });
    if (error) { console.error('🔴 Error al notificar suspensión al admin:', error.message || error); return false; }
    console.log(`📧 Admin notificado de suspensión automática de ${nombre_usuario}.`);
    return true;
  } catch (err) { console.error('🔴 Excepción al notificar suspensión:', err.message); return false; }
};


module.exports = {
  enviarCorreoAprobacion,
  enviarCorreoRecuperacion,
  enviarCorreoConfirmacionExalumno,
  enviarCorreoBienvenidaVoluntario,
  enviarCorreoNuevoContacto,
  enviarCorreoMatchActivo,
  enviarCorreoMatchActivoAdmin,
  enviarCorreoNuevaDonacion,
  enviarCorreoConfirmacionDonacion,
  enviarCorreoRechazoDonacion,
  enviarCorreoSeleccionAplicante,
  enviarCorreoDescarteAplicante,
  enviarCorreoSuspensionAutomatica,
  CORREO_APROBADOR,
};
