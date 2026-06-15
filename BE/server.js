require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const app = express();

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

app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth.routes');
const aplicantesEmpleoRoutes = require('./routes/aplicantes.empleo.routes');
const areasInteresRoutes = require('./routes/areas.interes.routes');
const areasInteresExalumnosRoutes = require('./routes/areas.interes.exalumnos.routes');
const areasInteresProyectoRoutes = require('./routes/areas.interes.proyecto.routes');
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

app.use('/api/auth', authRoutes);
app.use('/api/aplicantes', aplicantesEmpleoRoutes);
app.use('/api/areas-interes', areasInteresRoutes);
app.use('/api/areas-interes-exalumnos', areasInteresExalumnosRoutes);
app.use('/api/areas-interes-proyectos', areasInteresProyectoRoutes);
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

// Endpoint de prueba para confirmar conexión BE-FE
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend corriendo 🟢' });
});

// Error middleware (siempre al final)
const errorMiddleware = require('./middlewares/error.middleware');
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
