const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const app = express();

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
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return true;
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
// ROUTES
// ======================================================

const authRoutes = require('./routes/auth.routes');
const aplicantesEmpleoRoutes = require('./routes/aplicantes.empleo.routes');
const areasInteresRoutes = require('./routes/areas.interes.routes');
const areasInteresExalumnosRoutes = require('./routes/areas.interes.exalumnos.routes');
const areasInteresProyectoRoutes = require('./routes/areas.interes.proyecto.routes');
const areasInteresEmpleoRoutes = require('./routes/areas.interes.empleo.routes');
const becaSocioeconomicaRoutes = require('./routes/beca.socioeconomica.routes');
const carrerasRoutes = require('./routes/carreras.routes');
const carrerasUsuarioRoutes = require('./routes/carreras.usuario.routes');
const certificacionesRoutes = require('./routes/certificaciones.estudiante.routes');
const donacionesRoutes = require('./routes/donaciones.routes');
const experienciaRoutes = require('./routes/experiencia.estudiante.routes');
const facultadesRoutes = require('./routes/facultades.routes');
const habilidadesRoutes = require('./routes/habilidades.estudiante.routes');
const informacionEstudianteRoutes = require('./routes/informacion.estudiante.routes');
const informacionExalumnoRoutes = require('./routes/informacion.exalumno.routes');
const necesidadesEspecificasRoutes = require('./routes/necesidades.especificas.routes');
const nivelAcademicoRoutes = require('./routes/nivel.academico.routes');
const proyectoGraduacionRoutes = require('./routes/proyecto.graduacion.routes');
const proyectoNecesidadRoutes = require('./routes/proyecto.necesidad.routes');
const puestoEmpleoRoutes = require('./routes/puesto.empleo.routes');
const reporteUsuarioRoutes = require('./routes/reporte.usuario.routes');
const responsabilidadRoutes = require('./routes/responsabilidad.routes');
const responsabilidadEmpleoRoutes = require('./routes/responsabilidad.empleo.routes');
const rolRoutes = require('./routes/rol.routes');
const sectorRoutes = require('./routes/sector.routes');
const sectorEmpleoRoutes = require('./routes/sector.empleo.routes');
const sectorExalumnoRoutes = require('./routes/sector.exalumno.routes');
const sedeUCRRoutes = require('./routes/sede.UCR.routes');
const tipoPagoRoutes = require('./routes/tipo.pago.routes');
const tipoProyectoRoutes = require('./routes/tipo.proyecto.routes');
const usersRoutes = require('./routes/users.routes');
const cvRoutes = require('./routes/cv.routes');
const voluntariosRoutes = require('./routes/voluntarios.routes');
const consultasRoutes = require('./routes/consultas.routes');
const matchingRoutes = require('./routes/matching.routes');
const claudeRoutes = require('./routes/claude.routes');
const replicateRoutes = require('./routes/replicate.routes');
const matchesMentoriaRoutes = require('./routes/matches.mentoria.routes');
const matchesPosicionesRoutes = require('./routes/matches.posiciones.routes');
const adminRoutes = require('./routes/admin.routes');
const perfilExalumnoRoutes = require('./routes/perfilExalumno.routes');
const directorioEstudiantesRoutes = require('./routes/directorioEstudiantes.routes');
const comprobantesRoutes = require('./routes/comprobantes.routes');
const statsRoutes = require('./routes/stats.routes');
const fidelizacionRoutes = require('./routes/fidelizacion.routes');

app.use('/api/auth', authRoutes);
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
app.use('/api/voluntarios', voluntariosRoutes);
app.use('/api/consultas-soporte', consultasRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/claude', claudeRoutes);
app.use('/api/replicate', replicateRoutes);
app.use('/api/matches-mentoria', matchesMentoriaRoutes);
app.use('/api/matches-posiciones', matchesPosicionesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/perfil-exalumno', perfilExalumnoRoutes);
app.use('/api/estudiantes', directorioEstudiantesRoutes);
app.use('/api/comprobantes', comprobantesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/fidelizacion', fidelizacionRoutes);
app.use('/api/perfil-onboarding', require('./routes/perfilOnboarding.routes'));
app.use('/api/reportes-anomalias', require('./routes/reportes.routes'));
app.use('/api/faqs', require('./routes/faqs.routes'));
app.use('/api/comunidad', require('./routes/comunidad.routes'));

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
const { enviarRecordatorioDonacionesPendientes } = require('./services/admin.service');
const { cerrarPosicionesVencidas } = require('./services/puestoEmpleoService');

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