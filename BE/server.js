<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta base - Health check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        mensaje: 'Bienvenido a la API de Conectando Talento UCR',
        version: '1.0.0',
        estado: 'Activa'
    });
});

// Importar enrutadores de la API
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const cvRoutes = require('./routes/cv.routes');

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cv', cvRoutes);

// Manejo centralizado de errores (Debe registrarse al final de todas las rutas)
app.use(errorMiddleware);

// Iniciar el servidor Express
const server = app.listen(PORT, () => {
    console.log(`\n\x1b[32m%s\x1b[0m`, `🚀 Servidor Express corriendo en el puerto ${PORT}`);
    console.log(`\x1b[36m%s\x1b[0m`, `👉 URL local: http://localhost:${PORT}`);
});

module.exports = { app, server };
=======
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth.routes');
// const usersRoutes = require('./routes/users.routes');  // pendiente
// const cvRoutes = require('./routes/cv.routes');         // pendiente

app.use('/api/auth', authRoutes);
// app.use('/api/users', usersRoutes);
// app.use('/api/cv', cvRoutes);

const aplicantesEmpleoRoutes        = require('./routes/aplicantes.empleo.routes');
const areasInteresRoutes            = require('./routes/areas.interes.routes');
const areasInteresExalumnosRoutes   = require('./routes/areas.interes.exalumnos.routes');
const areasInteresProyectoRoutes    = require('./routes/areas.interes.proyecto.routes');
const becaSocioeconomicaRoutes      = require('./routes/beca.socioeconomica.routes');
const carrerasRoutes                = require('./routes/carreras.routes');
const carrerasUsuarioRoutes         = require('./routes/carreras.usuario.routes');
const certificacionesRoutes         = require('./routes/certificaciones.estudiante.routes');
const donacionesRoutes              = require('./routes/donaciones.routes');
const experienciaRoutes             = require('./routes/experiencia.estudiante.routes');
const facultadesRoutes              = require('./routes/facultades.routes');
const habilidadesRoutes             = require('./routes/habilidades.estudiante.routes');
const informacionEstudianteRoutes   = require('./routes/informacion.estudiante.routes');
const informacionExalumnoRoutes     = require('./routes/informacion.exalumno.routes');
const necesidadesEspecificasRoutes  = require('./routes/necesidades.especificas.routes');
const proyectoGraduacionRoutes      = require('./routes/proyecto.graduacion.routes');
const proyectoNecesidadRoutes       = require('./routes/proyecto.necesidad.routes');
const puestoEmpleoRoutes            = require('./routes/puesto.empleo.routes');
const reporteUsuarioRoutes          = require('./routes/reporte.usuario.routes');
const responsabilidadRoutes         = require('./routes/responsabilidad.routes');
const responsabilidadEmpleoRoutes   = require('./routes/responsabilidad.empleo.routes');
const rolRoutes                     = require('./routes/rol.routes');
const sectorRoutes                  = require('./routes/sector.routes');
const sectorEmpleoRoutes            = require('./routes/sector.empleo.routes');
const sectorExalumnoRoutes          = require('./routes/sector.exalumno.routes');
const sedeUCRRoutes                 = require('./routes/sede.UCR.routes');
const tipoPagoRoutes                = require('./routes/tipo.pago.routes');
const tipoProyectoRoutes            = require('./routes/tipo.proyecto.routes');

app.use('/api/aplicantes',               aplicantesEmpleoRoutes);
app.use('/api/areas-interes',            areasInteresRoutes);
app.use('/api/areas-interes-exalumnos',  areasInteresExalumnosRoutes);
app.use('/api/areas-interes-proyectos',  areasInteresProyectoRoutes);
app.use('/api/becas-socioeconomicas',    becaSocioeconomicaRoutes);
app.use('/api/carreras',                 carrerasRoutes);
app.use('/api/carreras-usuarios',        carrerasUsuarioRoutes);
app.use('/api/certificaciones',          certificacionesRoutes);
app.use('/api/donaciones',               donacionesRoutes);
app.use('/api/experiencias',             experienciaRoutes);
app.use('/api/facultades',               facultadesRoutes);
app.use('/api/habilidades',              habilidadesRoutes);
app.use('/api/informacion-estudiantes',  informacionEstudianteRoutes);
app.use('/api/informacion-exalumnos',    informacionExalumnoRoutes);
app.use('/api/necesidades-especificas',  necesidadesEspecificasRoutes);
app.use('/api/proyectos-graduacion',     proyectoGraduacionRoutes);
app.use('/api/proyectos-necesidades',    proyectoNecesidadRoutes);
app.use('/api/puestos-empleo',           puestoEmpleoRoutes);
app.use('/api/reportes-usuarios',        reporteUsuarioRoutes);
app.use('/api/responsabilidades',        responsabilidadRoutes);
app.use('/api/responsabilidades-empleo', responsabilidadEmpleoRoutes);
app.use('/api/roles',                    rolRoutes);
app.use('/api/sectores',                 sectorRoutes);
app.use('/api/sectores-empleo',          sectorEmpleoRoutes);
app.use('/api/sectores-exalumnos',       sectorExalumnoRoutes);
app.use('/api/sedes-ucr',                sedeUCRRoutes);
app.use('/api/tipos-pago',               tipoPagoRoutes);
app.use('/api/tipos-proyecto',           tipoProyectoRoutes);

// Endpoint de prueba para confirmar conexión BE-FE
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend corriendo 🟢' });
});

// Error middleware (siempre al final)
//const errorMiddleware = require('./middlewares/error.middleware');
//app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
>>>>>>> 44b165e2569b85063492ede8c6ac7eb7fc71c82f
