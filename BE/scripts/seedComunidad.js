/**
 * Seed de demostración del espacio de Comunidad: 5 blogs (aprobados) + 5 eventos.
 * Idempotente: vacía las tablas blogs/eventos y reinserta el set de demo, de modo
 * que siempre quedan exactamente estos registros.
 *
 * Uso:  node scripts/seedComunidad.js   (desde la carpeta BE/)
 * Requiere SUPABASE_SECRET_KEY (service_role) en BE/.env.local y haber corrido
 * BE/db/blogs_eventos.sql en Supabase.
 */
require('dotenv').config({ path: '.env.local' });
const supabase = require('../config/supabase');

const BLOGS = [
  { autor_nombre: 'Gustavo Machado', autor_rol: 'exalumno', tipo: 'noticia', titulo: 'El futuro se construye con tecnología',
    contenido: 'Comparto los aprendizajes de mi charla sobre nube, IA y liderazgo técnico. La invitación es a que más egresados acompañemos a la próxima generación de la UCR: innovar, liderar y transformar.' },
  { autor_nombre: 'Carlos Jiménez', autor_rol: 'estudiante', tipo: 'comentario', titulo: 'Gracias a mi mentor',
    contenido: 'Quería agradecer públicamente a mi mentor por la guía en mi proyecto de graduación. La red Alumni hace una diferencia real para quienes tenemos beca y buscamos oportunidades.' },
  { autor_nombre: 'Mariana Castro Vega', autor_rol: 'exalumno', tipo: 'sugerencia', titulo: 'Más mentorías en agroindustria',
    contenido: 'Sugiero abrir más espacios de mentoría enfocados en agroindustria y sostenibilidad. Hay mucho talento estudiantil en estas áreas que podría beneficiarse de la experiencia de la red.' },
  { autor_nombre: 'Daniela Campos', autor_rol: 'estudiante', tipo: 'noticia', titulo: 'Nuestro proyecto fue seleccionado',
    contenido: 'Con mi equipo presentamos "Bienestar UCR" en la feria de innovación y fuimos seleccionados para la siguiente etapa. Gracias a la comunidad por el apoyo y la retroalimentación.' },
  { autor_nombre: 'Roberto Soto', autor_rol: 'exalumno', tipo: 'comentario', titulo: 'Construyamos red, no solo contactos',
    contenido: 'Más allá de buscar empleo o pasantías, los animo a construir relaciones genuinas. Una conversación honesta con un mentor puede cambiar el rumbo de una carrera. Acá estamos para apoyar.' },
];

const EVENTOS = [
  { titulo: 'Feria de Empleo Tech 2026', descripcion: 'Encuentro de egresados y estudiantes con empresas de tecnología. Oportunidades de empleo, pasantías y networking.', fecha: '2026-07-15', hora: '09:00', lugar: 'Auditorio de Ingeniería, UCR' },
  { titulo: 'Charla: IA aplicada en Costa Rica', descripcion: 'Casos reales de inteligencia artificial en la industria nacional, con panel de exalumnos líderes del sector.', fecha: '2026-07-22', hora: '14:00', lugar: 'Sala Multiusos, Facultad de Ciencias' },
  { titulo: 'Noche de Networking Alumni', descripcion: 'Espacio informal para conectar a estudiantes con mentores y profesionales de la red Alumni UCR.', fecha: '2026-08-05', hora: '18:00', lugar: 'Terraza del Edificio Administrativo' },
  { titulo: 'Taller de CV y entrevistas', descripcion: 'Taller práctico para mejorar tu currículum y prepararte para entrevistas, guiado por reclutadores egresados.', fecha: '2026-08-19', hora: '10:00', lugar: 'Laboratorio de la Escuela de Computación' },
  { titulo: 'Gala Alumni UCR 2026', descripcion: 'Encuentro anual de la comunidad: reconocimiento a egresados destacados y celebración de la red.', fecha: '2026-09-10', hora: '19:00', lugar: 'Teatro Universitario' },
];

const ID_NULO = '00000000-0000-0000-0000-000000000000';

const seed = async () => {
  // 1. Limpiar (deja exactamente el set de demo).
  await supabase.from('blogs').delete().neq('id', ID_NULO);
  await supabase.from('eventos').delete().neq('id', ID_NULO);

  // 2. Insertar blogs aprobados.
  const { error: eBlogs } = await supabase
    .from('blogs').insert(BLOGS.map((b) => ({ ...b, estado: 'aprobado' })));
  if (eBlogs) throw eBlogs;

  // 3. Insertar eventos aprobados.
  const { error: eEv } = await supabase
    .from('eventos').insert(EVENTOS.map((e) => ({ ...e, autor_nombre: 'Administración', estado: 'aprobado' })));
  if (eEv) throw eEv;

  console.log(`✅ Comunidad sembrada: ${BLOGS.length} blogs + ${EVENTOS.length} eventos.`);
};

seed()
  .then(() => { console.log('🟢 Seed de comunidad completado.'); process.exit(0); })
  .catch((err) => { console.error('🔴 Error en el seed de comunidad:', err.message); process.exit(1); });
