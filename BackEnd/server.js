const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// ======================================================
// CONFIGURACIÓN OBLIGATORIA
// ======================================================
// Se comprueba acá, antes de cargar rutas, para que el mensaje se vea claro en
// la terminal en vez de salir como un stack trace desde el fondo de un require.
//
// A diferencia de las credenciales de Supabase (que solo avisan y dejan
// arrancar con placeholders), esta clave falla CERRADO: firma los enlaces de
// restablecer contraseña y de aprobación de cuentas, así que arrancar con un
// valor por defecto conocido permitiría tomar cuentas ajenas.
if (!process.env.APPROVAL_SECRET && !process.env.SUPABASE_SECRET_KEY) {
  console.error('\x1b[31m%s\x1b[0m', [
    '',
    '🔴 No se puede arrancar: falta la clave para firmar los enlaces de correo.',
    '',
    '   Configurá APPROVAL_SECRET en BackEnd/.env.local (ver BackEnd/.env.example).',
    '   Generar un valor:',
    '     node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    '',
    '   Esta clave firma los tokens de restablecer contraseña, confirmar correo y',
    '   aprobar cuentas. Antes había un valor por defecto en el código, pero estaba',
    '   publicado en el repositorio: con él, cualquiera que supiera el id de un',
    '   usuario podía falsificar su enlace de reset y tomarle la cuenta.',
    '',
  ].join('\n'));
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Express va detrás del proxy del hosting (Vercel/Render), así que sin esto
// req.ip es la IP del proxy y TODOS los usuarios compartirían el mismo cupo
// de rate limit.
app.set('trust proxy', 1);

// ======================================================
// RED DE SEGURIDAD GLOBAL
// ======================================================
// Sin esto, cualquier excepción o promesa rechazada que escape de un
// try/catch tumba TODO el proceso (nodemon se queda en "app crashed" hasta
// el próximo cambio de archivo, dejando el BE caído para todo el equipo).
// Loggear y seguir vivo es preferible a caerse en un servidor de desarrollo
// compartido.
process.on('uncaughtException', (error) => {
  console.error('🔴 uncaughtException (el servidor sigue corriendo):', error);
});
process.on('unhandledRejection', (reason) => {
  console.error('🔴 unhandledRejection (el servidor sigue corriendo):', reason);
});

// CORS
// El frontend (Next.js) puede arrancar en distintos puertos locales (3000, 3001,
// 3002…) si el 3000 está ocupado. Para que el backend SIEMPRE conecte con el
// frontend, se acepta cualquier origen localhost/127.0.0.1 en desarrollo, además
// del FRONTEND_URL configurado (útil en producción).
const origenPermitido = (origin) => {
  // Peticiones sin origin (curl, Postman, health checks) se permiten.
  if (!origin) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (process.env.FRONTEND_URL) {
    // Acepta el dominio configurado con o sin "www.": Vercel redirige el apex
    // (alumniucr.com) a "www.alumniucr.com", así que el origen real que llega
    // al backend puede no coincidir exactamente con FRONTEND_URL si solo se
    // configuró una de las dos variantes.
    const sinWww = process.env.FRONTEND_URL.replace(/^(https?:\/\/)www\./, '$1');
    const conWww = sinWww.replace(/^(https?:\/\/)/, '$1www.');
    if (origin === sinWww || origin === conWww) return true;
  }
  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (origenPermitido(origin)) return callback(null, true);
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  }),
);

// Límite por defecto de Express (100kb) es insuficiente para payloads con foto
// de perfil en base64 (p. ej. PUT /api/perfil-exalumno) — rechazaba con
// PayloadTooLargeError en uso normal.
app.use(express.json({ limit: '10mb' }));

// ======================================================
// CABECERAS DE SEGURIDAD
// ======================================================
// Este backend solo sirve JSON, nunca HTML, asi que no necesita CSP (y
// activarla por defecto rompia nada pero tampoco aportaba). Si se desactiva
// crossOriginResourcePolicy porque el FE vive en otro dominio y debe poder
// leer las respuestas.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);

// ======================================================
// RATE LIMITING
// ======================================================
// No habia ninguno. Dos riesgos concretos que esto cierra:
//  1. Fuerza bruta sobre /auth/login y adivinado del codigo de 6 digitos de
//     recuperacion de contrasena (un millon de combinaciones es trivial sin
//     limite de intentos).
//  2. Coste: /claude y /replicate llaman a APIs que se pagan por uso y
//     /claude/chat es publico, asi que cualquiera podia gastar el
//     presupuesto de la asociacion desde una terminal.

const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // por IP: suficiente para un usuario que se equivoca varias veces
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    mensaje: 'Demasiados intentos. Esperá unos minutos antes de volver a probar.',
  },
});

const limiteIA = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    mensaje: 'Demasiadas consultas al asistente. Esperá un momento e intentá de nuevo.',
  },
});

// Limite general, holgado: corta scraping y bucles accidentales del FE sin
// molestar el uso normal de la plataforma.
const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    mensaje: 'Demasiadas peticiones. Esperá un momento e intentá de nuevo.',
  },
});

app.use('/api', limiteGeneral);

// ======================================================
// ROUTES
// ======================================================

const authRoutes = require('./routes/auth/auth.routes');
const aplicantesEmpleoRoutes = require('./routes/matching/aplicantes.empleo.routes');
const areasInteresRoutes = require('./routes/perfil/areas.interes.routes');
const areasInteresExalumnosRoutes = require('./routes/perfil/areas.interes.exalumnos.routes');
const areasInteresProyectoRoutes = require('./routes/curriculum/areas.interes.proyecto.routes');
const areasInteresEmpleoRoutes = require('./routes/matching/areas.interes.empleo.routes');
const becaSocioeconomicaRoutes = require('./routes/perfil/beca.socioeconomica.routes');
const carrerasRoutes = require('./routes/perfil/carreras.routes');
const carrerasUsuarioRoutes = require('./routes/perfil/carreras.usuario.routes');
const certificacionesRoutes = require('./routes/perfil/certificaciones.estudiante.routes');
const donacionesRoutes = require('./routes/donaciones/donaciones.routes');
const experienciaRoutes = require('./routes/perfil/experiencia.estudiante.routes');
const facultadesRoutes = require('./routes/perfil/facultades.routes');
const habilidadesRoutes = require('./routes/perfil/habilidades.estudiante.routes');
const informacionEstudianteRoutes = require('./routes/perfil/informacion.estudiante.routes');
const informacionExalumnoRoutes = require('./routes/perfil/informacion.exalumno.routes');
const necesidadesEspecificasRoutes = require('./routes/perfil/necesidades.especificas.routes');
const nivelAcademicoRoutes = require('./routes/perfil/nivel.academico.routes');
const proyectoGraduacionRoutes = require('./routes/curriculum/proyecto.graduacion.routes');
const proyectoNecesidadRoutes = require('./routes/curriculum/proyecto.necesidad.routes');
const puestoEmpleoRoutes = require('./routes/matching/puesto.empleo.routes');
const reporteUsuarioRoutes = require('./routes/admin/reporte.usuario.routes');
const responsabilidadRoutes = require('./routes/voluntariado/responsabilidad.routes');
const responsabilidadEmpleoRoutes = require('./routes/matching/responsabilidad.empleo.routes');
const rolRoutes = require('./routes/auth/rol.routes');
const sectorRoutes = require('./routes/perfil/sector.routes');
const sectorEmpleoRoutes = require('./routes/matching/sector.empleo.routes');
const sectorExalumnoRoutes = require('./routes/perfil/sector.exalumno.routes');
const sedeUCRRoutes = require('./routes/perfil/sede.UCR.routes');
const tipoPagoRoutes = require('./routes/donaciones/tipo.pago.routes');
const tipoProyectoRoutes = require('./routes/curriculum/tipo.proyecto.routes');
const usersRoutes = require('./routes/auth/users.routes');
const cvRoutes = require('./routes/curriculum/cv.routes');
const voluntariosRoutes = require('./routes/voluntariado/voluntarios.routes');
const consultasRoutes = require('./routes/admin/consultas.routes');
const matchingRoutes = require('./routes/matching/matching.routes');
const claudeRoutes = require('./routes/common/claude.routes');
const replicateRoutes = require('./routes/common/replicate.routes');
const matchesMentoriaRoutes = require('./routes/matching/matches.mentoria.routes');
const matchesPosicionesRoutes = require('./routes/matching/matches.posiciones.routes');
const adminRoutes = require('./routes/admin/admin.routes');
const perfilExalumnoRoutes = require('./routes/perfil/perfilExalumno.routes');
const directorioEstudiantesRoutes = require('./routes/perfil/directorioEstudiantes.routes');
const comprobantesRoutes = require('./routes/donaciones/comprobantes.routes');
const statsRoutes = require('./routes/common/stats.routes');
const fidelizacionRoutes = require('./routes/fidelizacion/fidelizacion.routes');

// limiteAuth va primero: login, recuperacion y registro son el objetivo de
// fuerza bruta y de spam de correos.
app.use('/api/auth', limiteAuth, authRoutes);
app.use('/api/aplicantes', aplicantesEmpleoRoutes);
app.use('/api/areas-interes', areasInteresRoutes);
app.use('/api/areas-interes-exalumnos', areasInteresExalumnosRoutes);
app.use('/api/areas-interes-proyectos', areasInteresProyectoRoutes);
app.use('/api/areas-interes-empleo', areasInteresEmpleoRoutes);
app.use('/api/becas-socioeconomicas', becaSocioeconomicaRoutes);
app.use('/api/carreras', carrerasRoutes);
app.use('/api/carreras-usuarios', carrerasUsuarioRoutes);
app.use('/api/certificaciones', certificacionesRoutes);
app.use('/api/donaciones', donacionesRoutes);
app.use('/api/experiencias', experienciaRoutes);
app.use('/api/facultades', facultadesRoutes);
app.use('/api/habilidades', habilidadesRoutes);
app.use('/api/informacion-estudiantes', informacionEstudianteRoutes);
app.use('/api/informacion-exalumnos', informacionExalumnoRoutes);
app.use('/api/necesidades-especificas', necesidadesEspecificasRoutes);
app.use('/api/niveles-academicos', nivelAcademicoRoutes);
app.use('/api/proyectos-graduacion', proyectoGraduacionRoutes);
app.use('/api/proyectos-necesidades', proyectoNecesidadRoutes);
app.use('/api/puestos-empleo', puestoEmpleoRoutes);
app.use('/api/reportes-usuarios', reporteUsuarioRoutes);
app.use('/api/responsabilidades', responsabilidadRoutes);
app.use('/api/responsabilidades-empleo', responsabilidadEmpleoRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/sectores', sectorRoutes);
app.use('/api/sectores-empleo', sectorEmpleoRoutes);
app.use('/api/sectores-exalumnos', sectorExalumnoRoutes);
app.use('/api/sedes-ucr', sedeUCRRoutes);
app.use('/api/tipos-pago', tipoPagoRoutes);
app.use('/api/tipos-proyecto', tipoProyectoRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cv', cvRoutes);
// Alta publica de voluntarios: limitada para evitar spam de solicitudes.
app.use('/api/voluntarios', limiteAuth, voluntariosRoutes);
app.use('/api/consultas-soporte', consultasRoutes);
app.use('/api/matching', matchingRoutes);
// limiteIA: /claude/chat es PUBLICO (sin auth), asi que sin limite cualquiera
// podia gastar el presupuesto de la API de Anthropic.
app.use('/api/claude', limiteIA, claudeRoutes);
app.use('/api/replicate', limiteIA, replicateRoutes);
app.use('/api/matches-mentoria', matchesMentoriaRoutes);
app.use('/api/matches-posiciones', matchesPosicionesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/perfil-exalumno', perfilExalumnoRoutes);
app.use('/api/estudiantes', directorioEstudiantesRoutes);
app.use('/api/comprobantes', comprobantesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/fidelizacion', fidelizacionRoutes);
app.use('/api/perfil-onboarding', require('./routes/perfil/perfilOnboarding.routes'));
app.use('/api/reportes-anomalias', require('./routes/admin/reportes.routes'));
app.use('/api/faqs', require('./routes/common/faqs.routes'));
app.use('/api/comunidad', require('./routes/comunidad/comunidad.routes'));

// Endpoint de prueba para confirmar conexión BE-FE
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend corriendo 🟢' });
});

// Error middleware (siempre al final)
const errorMiddleware = require('./middlewares/error.middleware');
app.use(errorMiddleware);

// ======================================================
// CRON JOBS
// ======================================================

const cron = require('node-cron');
const { enviarRecordatorioDonacionesPendientes } = require('./services/admin/admin.service');
const { cerrarPosicionesVencidas } = require('./services/matching/puestoEmpleoService');

// RF-08.2 — cada hora revisa donaciones pendientes > 24h y reenvía el correo al admin.
cron.schedule('0 * * * *', async () => {
  try {
    const resultado = await enviarRecordatorioDonacionesPendientes();
    if (resultado.recordatorios > 0) {
      console.log(`⏰ Recordatorio de donaciones: ${resultado.recordatorios} enviado(s) de ${resultado.total_vencidas} vencida(s).`);
    }
  } catch (error) {
    console.error('⚠️ Error al ejecutar el cron de recordatorio de donaciones:', error.message);
  }
});

// RF-10 — cada hora cierra automáticamente las posiciones (empleo/pasantía) cuya fecha límite ya pasó.
cron.schedule('0 * * * *', async () => {
  try {
    const resultado = await cerrarPosicionesVencidas();
    if (resultado.cerradas > 0) {
      console.log(`🔒 Posiciones cerradas automáticamente por cron: ${resultado.cerradas}.`);
    }
  } catch (error) {
    console.error('⚠️ Error al ejecutar el cron de cierre de posiciones vencidas:', error.message);
  }
});

// ======================================================
// SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;