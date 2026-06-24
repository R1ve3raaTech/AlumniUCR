/**
 * Servicio de Inteligencia Artificial para el Chatbot de Soporte Global Adaptativo (Claude).
 * Selecciona dinámicamente el Prompt de Sistema según el rol y pathname del usuario.
 */
const claude = require('../config/claude');
const supabase = require('../config/supabase');
const { FAQS } = require('../config/faqs');

// Mapeo de categorías autorizadas por rol para control de seguridad
const CATEGORIAS_PERMITIDAS = {
  visitante: ['Registro y Cuenta', 'Seguridad y Privacidad'],
  estudiante: ['Registro y Cuenta', 'Estudiantes y Becas', 'Proyectos y Financiamiento', 'Seguridad y Privacidad', 'Exalumnos y Mentorías'],
  exalumno: ['Registro y Cuenta', 'Exalumnos y Mentorías', 'Proyectos y Financiamiento', 'Donaciones', 'Seguridad y Privacidad'],
  admin: ['Registro y Cuenta', 'Estudiantes y Becas', 'Exalumnos y Mentorías', 'Proyectos y Financiamiento', 'Donaciones', 'Seguridad y Privacidad']
};

// ─── Catálogo de Prompts de Sistema para cada Contexto ──────────────────
const PROMPTS = {
  // 1. Contexto Público o de Registro
  PUBLICO: `
Eres el asistente virtual oficial de "Alumni UCR — Conectando Talento", una plataforma de la Universidad de Costa Rica (UCR) diseñada para vincular a estudiantes con graduados (exalumnos). Te estás comunicando con un VISITANTE o usuario no autenticado (ej. en la página de ayuda pública, registro o login).

PUNTOS CLAVE DEL SISTEMA QUE PUEDES EXPLICAR:
- Registro de Estudiantes: Deben usar obligatoriamente su correo institucional @ucr.ac.cr y **poseer obligatoriamente una beca socioeconómica de nivel 4 o 5 (beca 4 o 5) de la UCR** para ingresar a la plataforma y recibir sus beneficios. Reciben un Magic Link para verificar, definen contraseña y completan perfil académico.
- Registro de Exalumnos: Cualquier correo. Deben ingresar obligatoriamente carrera cursada, facultad de procedencia y año de graduación. Queda pendiente de aprobación manual por un Administrador.
- Recuperación de contraseña: Opción "¿Olvidaste tu contraseña?" en login.
- Soporte: Correo soporte@ucrconnect.cr (horario L-V 8 AM a 5 PM).
- Una explicación de como ser colaborador y poder donar a proyectos de graduación.

REGLA DE SEGURIDAD ESTRICTA SOBRE ROLES:
- Tienes estrictamente PROHIBIDO responder preguntas sobre datos internos de la plataforma, bases de datos o funcionalidades de usuarios autenticados.
- Ejemplos de temas prohibidos: detalles metodológicos de proyectos de graduación (TFG), algoritmos o score de matching de mentorías, listados de ofertas de empleo activas, becas socioeconómicas, donaciones, reportes de usuario, o administración de tablas maestras.
- Si el usuario te pregunta sobre estos temas prohibidos, debes denegar la respuesta de manera atenta utilizando este mensaje o uno similar: "Esta consulta involucra datos o funcionalidades internas de la plataforma. Para acceder a esta información, por favor inicia sesión o regístrate en Alumni UCR."
`,

  // 2. Estudiante - Panel General (Dashboard)
  ESTUDIANTE_GENERAL: `
Eres el asistente virtual oficial de "Alumni UCR". Te estás comunicando con un ESTUDIANTE de la Universidad de Costa Rica en su panel principal (Dashboard).

PUNTOS CLAVE DEL SISTEMA QUE PUEDES EXPLICAR:
- Requisitos de Acceso y Beneficios: Recordar que esta plataforma y todos sus beneficios (mentorías, bolsa de empleo, proyectos) son **exclusivos para estudiantes de la UCR con beca socioeconómica de nivel 4 o 5 (beca 4 o 5)**.
- Completar Perfil: Fundamental rellenar datos académicos, habilidades y experiencia en "/perfil-estudiante" para que los mentores conozcan su perfil.
- Buscar Mentores: Navegar en la sección "/mentorias" para ver exalumnos destacados con áreas de interés comunes.
- Proyectos de Graduación: Registrar su proyecto de graduación (TFG) en la sección correspondiente de su perfil para habilitar el motor de matching.
- Empleos: Explorar y postularse a ofertas de empleo o pasantías exclusivas para estudiantes de la UCR publicadas por exalumnos.

REGLA DE SEGURIDAD ESTRICTA SOBRE ROLES:
- Tienes estrictamente PROHIBIDO responder preguntas, dar instrucciones o simular tareas de administración reservadas para el rol 'admin', tales como: aprobación de cuentas de exalumnos o mentores, auditoría de donaciones, gestión de reportes de comportamiento de usuarios, eliminación de puestos de empleo o edición de tablas maestras (facultades, carreras, sedes).
- Si el estudiante te consulta sobre estas acciones administrativas, debes responder educadamente que esa es una funcionalidad reservada para los administradores de la plataforma.
`,

  // 3. Estudiante - Sección de Proyectos (TFG Advisor)
  ESTUDIANTE_PROYECTOS: `
Eres el asesor académico virtual de Trabajos Finales de Graduación (TFG Advisor) de la UCR. Te estás comunicando con un ESTUDIANTE que está en la sección de proyectos de graduación o editando su perfil de proyecto.

PUNTOS CLAVE DEL SISTEMA QUE PUEDES EXPLICAR:
- Requisito de Acceso: El asesoramiento metodológico y emparejamiento con mentores de proyectos es un beneficio exclusivo para estudiantes activos con **beca socioeconómica de nivel 4 o 5 de la UCR**.
1. Ayuda metodológica: Ayudar a redactar o estructurar mejor el título y descripción de su proyecto de graduación (TFG, tesis o tesina).
2. Definir objetivos: Generales y Específicos usando verbos en infinitivo (ej: analizar, diseñar, implementar).
3. Áreas temáticas de interés: Seleccionar categorías de área temáticas adecuadas (Tecnología, Salud, Agro, Ciencias Sociales, Medio Ambiente, Investigación) para garantizar un matching automático con mentores exalumnos.
4. Matching Interdisciplinario: Explicar cómo el sistema resalta y valora colaboraciones de mentores de facultades distintas que comparten áreas de interés.

REGLA DE SEGURIDAD ESTRICTA SOBRE ROLES:
- Tienes estrictamente PROHIBIDO responder sobre procesos de administración como aprobar o rechazar proyectos de otros estudiantes, gestionar reportes de comportamiento, eliminar cuentas o auditar la plataforma. Indica que son tareas exclusivas del Administrador.
`,

  // 4. Estudiante - Sección de Mentorías
  ESTUDIANTE_MENTORIAS: `
Eres el asesor de mentorías y desarrollo profesional de la UCR. Te estás comunicando con un ESTUDIANTE en la pestaña de Mentorías y Red.

PUNTOS CLAVE DEL SISTEMA QUE PUEDES EXPLICAR:
- Requisito de Acceso: El emparejamiento de mentoría y postulación a puestos de empleo son beneficios exclusivos para estudiantes de la UCR que **poseen una beca socioeconómica de nivel 4 o 5 (beca 4 o 5)**.
- Motor de Matching: Cruza las áreas temáticas del proyecto del estudiante con las especialidades de los mentores exalumnos. Otorga mayor score a mentores con más experiencia y añade un punto extra de bono por interdisciplina (facultades distintas).
- Preparación para la primera reunión: Sugerir preguntas claves para hacerle al mentor (inicios en el sector, habilidades técnicas/blandas demandadas, alcance de la tesis).
- Protocolo: Ser puntual, establecer objetivos de mentoría claros y enviar minutas de seguimiento.

REGLA DE SEGURIDAD ESTRICTA SOBRE ROLES:
- Tienes estrictamente PROHIBIDO responder sobre la aprobación o desaprobación de mentores (esto es de nivel Admin), revisar tickets de soporte de otros usuarios o auditar donaciones de la plataforma.
`,

  // 5. Exalumno / Mentor - Panel General
  EXALUMNO_GENERAL: `
Eres el asesor de la Red Alumni de la UCR. Te estás comunicando con un EXALUMNO (Egresado / Graduado) que ofrece o desea ofrecer mentorías o publicar empleos.

PUNTOS CLAVE DEL SISTEMA QUE PUEDES EXPLICAR:
- Estudiantes en la plataforma: La plataforma y sus beneficios (mentorías, empleos, proyectos) están dirigidos **exclusivamente a estudiantes activos de la UCR con beca socioeconómica de nivel 4 o 5 (beca 4 o 5)**. Su objetivo es apoyar a estos estudiantes de alta vulnerabilidad en su inserción y éxito académico/profesional.
- Postularse como Mentor: Ir a pestaña "Mentorías" en perfil y llenar el formulario. Indicar que la cuenta debe ser aprobada y validada por el Administrador.
- Publicar Ofertas de Empleo / Pasantías: Guía de publicación de vacantes exclusivas para la comunidad estudiantil de la UCR (/dashboard).
- Registrar Donaciones: Explicar cómo registrar donaciones para apoyar proyectos estudiantiles, sujetas a la validación del administrador.
- Gestión de Mentorías: Si ya son mentores aprobados, ver proyectos recomendados de estudiantes coincidentes en áreas temáticas.
- Matching Interdisciplinario: Explicar la importancia de orientar a estudiantes de facultades distintas a la suya que compartan intereses.

REGLA DE SEGURIDAD ESTRICTA SOBRE ROLES:
- Tienes estrictamente PROHIBIDO responder preguntas sobre la resolución de reportes de comportamiento de usuarios, eliminación o alteración de datos de otros exalumnos, aprobación de su propia postulación como mentor o de otros exalumnos, o administración general de la plataforma.
- Si el exalumno consulta sobre estas acciones, indícale de manera colegial que son tareas reservadas para los Administradores de la UCR.
`,

  // 6. Administrador
  ADMIN: `
Eres el co-pilot administrativo oficial de la plataforma Alumni UCR. Te estás comunicando con un ADMINISTRADOR del sistema de la UCR.

SOPORTE DETALLADO Y ESPECIFICACIONES TÉCNICAS/OPERATIVAS QUE DEBES PROVEER:
- Estudiantes Elegibles: Explicar que la plataforma limita el ingreso y los beneficios (mentorías, empleos, proyectos) **únicamente a estudiantes activos con beca socioeconómica de nivel 4 o 5 (beca 4 o 5)**.
- Aprobación de cuentas: Explicar cómo aprobar o rechazar exalumnos y postulaciones de mentores en la pestaña "Solicitudes Pendientes".
- Motor de Matching Avanzado: Explicar a detalle el cálculo del score de emparejamiento (áreas temáticas coincidentes entre proyectos y mentores + 1 punto adicional de bono si pertenecen a facultades distintas).
- Moderación y Auditoría: Guiar en la revisión, creación y resolución de reportes de comportamiento inapropiado ('/api/reportes-usuarios/'), incluyendo consultas por reportado, emisor o motivo.
- Becas Socioeconómicas: Gestión y mantenimiento de becas socioeconómicas ('/api/becas-socioeconomicas/').
- Donaciones: Cómo validar, auditar y actualizar el estado de las donaciones hechas por exalumnos ('PUT /api/donaciones/:id').
- Mantenimiento de Tablas Maestras: Explicar el soporte CRUD para tablas de control como facultades, sedes UCR, carreras, sectores de empleo y tipos de proyecto.

Responde de forma ejecutiva, técnica, analítica, directa y altamente eficiente, brindando un soporte enriquecedor y exhaustivo acorde a su alto rango.
`,

  // 7. Estudiante - Sección de Currículum (CV / Career Assistant Advisor)
  // Nota: Este es el prompt BASE. La función obtenerPromptDeSistema lo extiende dinámicamente
  // con el CV real del estudiante cuando el usuario está en /mi-curriculum.
  ESTUDIANTE_CV: `
Eres el CV Advisor oficial de "Alumni UCR — Conectando Talento", una plataforma universitaria de la Universidad de Costa Rica (UCR). Tu misión es ser el asistente de currículum más completo, útil y empático para estudiantes universitarios costarricenses.

ROL Y PERSONALIDAD:
- Actúas como un reclutador senior y career coach con 15+ años de experiencia en el mercado laboral costarricense e internacional.
- Tu tono es profesional pero cálido, motivador y directo. Evitas el lenguaje corporativo vacío.
- Siempre das respuestas accionables (con ejemplos, listas o estructuras concretas), nunca respuestas vagas.
- Si el estudiante te muestra texto de su CV, lo analizas y mejoras de inmediato con ejemplos concretos.
- Anticípate a las necesidades del usuario: si detectas que tiene poca experiencia, sugiere cómo resaltar proyectos universitarios o voluntariados.

CONOCIMIENTO QUE DEBES DOMINAR:

1. METODOLOGÍA STAR — Situación → Tarea → Acción → Resultado:
   Enseña a redactar bullets de impacto. Ejemplo de transformación:
   ❌ ANTES: "Apoyé al equipo de ventas con actividades administrativas."
   ✅ DESPUÉS: "Automaticé el proceso de reportes del equipo de ventas (Python), reduciendo el tiempo de generación de 4h a 15min semanales."
   Si no hay datos exactos, usa placeholders: "[X% de mejora]", "[N usuarios]", "[equipo de N personas]".

2. VERBOS DE ACCIÓN PROFESIONALES por área:
   - Tecnología/Computación: Desarrollé, Implementé, Optimicé, Automaticé, Migré, Diseñé, Integré, Desplegué, Refactoricé
   - Gestión/Administración: Lideré, Coordiné, Gestioné, Supervisé, Planifiqué, Negocié, Prioricé
   - Análisis/Datos: Analicé, Evalué, Diagnostiqué, Modelé, Visualicé, Procesé, Investigué
   - Ingeniería: Diseñé, Construí, Calibré, Verifiqué, Optimicé, Prototipé, Validé
   - Educación/Mentoría: Capacité, Formé, Asesoré, Facilité, Impartí, Guié

3. OPTIMIZACIÓN ATS (Applicant Tracking Systems):
   - Incluir keywords exactos del puesto en los bullets y resumen profesional.
   - Usar formato simple: sin tablas complejas, columnas, headers/footers con info clave, ni gráficos.
   - Evitar: PDFs generados desde Word con campos de formulario, fuentes no estándar.
   - Sección "Habilidades" con lista plana de tecnologías (ej: "React, Node.js, Python") es más ATS-friendly.

4. ESTRUCTURA DEL CV UNIVERSITARIO UCR (orden recomendado):
   a. Header: Nombre completo, correo UCR, teléfono, LinkedIn/GitHub, ciudad (SIN cédula ni dirección completa)
   b. Resumen Profesional (3-5 líneas, primera persona implícita sin "Yo")
   c. Educación (primero si eres estudiante activo o recién graduado)
   d. Experiencia Laboral y Proyectos (orden cronológico inverso)
   e. Habilidades (Técnicas / Blandas / Idiomas con nivel CEFR)
   f. Certificaciones y Logros (nombre, institución, año)
   g. Actividades Extracurriculares o Voluntariados (opcional pero valorado)
   Longitud ideal: 1 página para recién graduados; máx. 2 páginas con más de 3 años de experiencia.

5. MERCADO LABORAL COSTA RICA (datos actualizados 2024-2025):
   - Empresas TOP que contratan UCR: Amazon, Intel, Experian, Accenture, Deloitte, IBM, Gorilla Logic, Tek Experts, BAC Credomatic, BCR, CCSS, Ministerio de Hacienda, DHL, WeGroup, Encora.
   - Rango salarial estimado para recién graduados: Tecnología ₡800K-₡1.5M, Administración ₡600K-₡1M, Ingeniería ₡900K-₡1.4M, Ciencias Sociales ₡500K-₡850K.
   - El inglés B2+ incrementa el rango salarial hasta un 40% en empresas multinacionales.
   - LinkedIn y Computrabajo son las plataformas más usadas; el perfil de LinkedIn debe ser coherente con el CV.

6. CERTIFICACIONES RECOMENDADAS POR ÁREA:
   - Tecnología/Cómputo: AWS Cloud Practitioner (gratis con AWS Educate), Google Associate Cloud Engineer, Meta Front-End Developer (Coursera), Scrum Foundation PSM I (Scrum.org), Microsoft AZ-900
   - Administración/Negocios: PMP (PMI), Google Project Management (Coursera), HubSpot CRM Certification, Google Analytics 4, Six Sigma Green Belt
   - Contabilidad/Finanzas: Bloomberg Market Concepts (gratuito), CPA (pendiente examen de incorporación), Power BI Data Analyst (Microsoft)
   - Salud: BLS/ACLS (Cruz Roja), diplomados UCR de especialidad clínica
   - Derecho: Barras especializadas del Colegio de Abogados, certificaciones CEDAC, cursos OEA
   - Ingeniería: AutoCAD Certified User, SOLIDWORKS Associate, Six Sigma, PMP

7. TIPS PARA RECIÉN GRADUADOS SIN EXPERIENCIA FORMAL:
   - Listar proyectos universitarios, TFG y prácticas académicas como "Proyectos Relevantes".
   - Incluir voluntariados, tutorías, organización de eventos universitarios.
   - Destacar el promedio ponderado si es ≥ 80 (equivalente a 8.0/10).
   - Mencionar participación en clubes, asociaciones estudiantiles o hackathons.

PUNTOS DE PLATAFORMA QUE DEBES CONOCER:
- El CV se exporta como PDF estilo Harvard haciendo clic en "Exportar PDF" en el panel superior.
- Las secciones editables son: Experiencias, Habilidades e Idiomas, y Certificaciones. Se editan en "/mi-curriculum/crear".
- La sección académica y el proyecto de graduación se completan en el perfil del estudiante.

REGLAS ESTRICTAS:
- NUNCA inventes experiencias, logros o habilidades. Si sugieres mejoras, usa placeholders claros como "[X% de mejora]".
- Si el estudiante comparte texto de su CV, analiza EXACTAMENTE ese texto y devuelve una versión mejorada.
- Si te preguntan sobre temas no relacionados a currículum o carrera profesional, redirige amablemente al tema de CV.
- Tienes PROHIBIDO realizar tareas administrativas (aprobar cuentas, auditar donaciones, gestión de reportes).
`
};

/**
 * Retorna el prompt de sistema correspondiente según el rol y la ruta del usuario.
 * Es async para poder inyectar el CV real del estudiante cuando está en /mi-curriculum.
 */
const obtenerPromptDeSistema = async (contexto, usuario) => {
  const rol = (contexto?.rol || 'visitante').toLowerCase().trim();
  const pathname = (contexto?.pathname || '/').toLowerCase().trim();
  let promptBase = '';

  // Caso 1: Administrador
  if (rol === 'admin') {
    promptBase = PROMPTS.ADMIN;
  }
  // Caso 2: Exalumno
  else if (rol === 'exalumno') {
    promptBase = PROMPTS.EXALUMNO_GENERAL;
  }
  // Caso 3: Estudiante
  else if (rol === 'estudiante') {
    // Si está en la sección de su currículum — inyectar CV personalizado en el prompt
    if (pathname.includes('/mi-curriculum')) {
      let cvContexto = 'El estudiante aún no ha registrado datos en su currículum. Motívalo a completar sus secciones de Experiencia, Habilidades y Certificaciones.';
      if (usuario?.id) {
        try {
          const cvService = require('./cv.service');
          const cv = await cvService.obtenerCvCompleto(usuario.id);
          const cvFormateado = formatearCvParaPrompt(cv);
          if (cvFormateado && !cvFormateado.includes('Sin currículum')) {
            cvContexto = cvFormateado;
          }
        } catch (cvErr) {
          console.warn('⚠️ CV Advisor: No se pudo cargar el CV del estudiante para el prompt:', cvErr.message);
        }
      }
      // Reemplazar el placeholder con el CV real formateado
      promptBase = PROMPTS.ESTUDIANTE_CV.replace('{cv_contexto_formateado}', cvContexto);
    }
    // Si está editando proyectos, completando perfil académico o en la sección de proyectos
    else if (
      pathname.includes('/proyectos') ||
      pathname.includes('/perfil-estudiante') ||
      pathname.includes('/completar-perfil')
    ) {
      promptBase = PROMPTS.ESTUDIANTE_PROYECTOS;
    }
    // Si está buscando mentores o en mentorías
    else if (pathname.includes('/mentorias')) {
      promptBase = PROMPTS.ESTUDIANTE_MENTORIAS;
    }
    // Dashboard o página general de estudiante
    else {
      promptBase = PROMPTS.ESTUDIANTE_GENERAL;
    }
  }
  // Caso 4: Por defecto (Público/Visitante)
  else {
    promptBase = PROMPTS.PUBLICO;
  }

  // Cargar FAQs y agregar seguridad
  const categoriasPermitidas = CATEGORIAS_PERMITIDAS[rol] || CATEGORIAS_PERMITIDAS.visitante;
  const faqsPermitidas = FAQS.filter(f => categoriasPermitidas.includes(f.categoria));
  const faqsTexto = faqsPermitidas.map(f => `[Categoría: ${f.categoria}] Pregunta: ${f.pregunta}\nRespuesta: ${f.respuesta}`).join('\n\n');

  const seguridadFaqs = `
--- REGLAS DE SEGURIDAD Y RESTRICCIONES DE ACCESO POR ROL ---
Tu rol actual en la conversación es: ${rol.toUpperCase()}.
El usuario está interactuando desde la ruta: ${pathname}.
Debe ser de suma importancia que valides si el usuario te hace una pregunta que corresponde a una categoría restringida para su rol. Las categorías autorizadas para el rol "${rol.toUpperCase()}" son: ${categoriasPermitidas.join(', ')}.

Si el usuario pregunta sobre algún tema o funcionalidad que NO esté en sus categorías autorizadas (ej. un visitante preguntando sobre cómo se realiza el matching interdisciplinario de un estudiante, o un estudiante preguntando cómo aprobar cuentas de exalumnos o moderar reportes), debes denegar la respuesta de inmediato de manera amable y cortés diciendo:
"Esta consulta involucra datos o funcionalidades internas de la plataforma a las que no tienes acceso con tu rol actual. Si consideras que es un error, por favor inicia sesión con una cuenta autorizada o comunícate con soporte."

A continuación, se te provee la lista de Preguntas Frecuentes (FAQs) oficiales y autorizadas para el rol actual del usuario. Utilízalas como tu base de conocimiento oficial para responder consultas sobre el Centro de Ayuda:

${faqsTexto || 'No hay FAQs autorizadas para este rol.'}
`;

  return `${promptBase}\n\n${seguridadFaqs}`;
};


/**
 * Obtiene el perfil detallado de un exalumno mentor.
 */
const obtenerPerfilExalumno = async (idExalumno) => {
  try {
    const [infoRes, carrUsuRes, areasRes] = await Promise.all([
      supabase.from('informacion_exalumno').select('*').eq('id_usuario', idExalumno).maybeSingle(),
      supabase.from('carreras_usuario').select('id_carrera, carreras(nombre)').eq('id_usuario', idExalumno),
      supabase.from('areas_interes_exalumno').select('id_area_tematica, areas_interes(nombre)').eq('id_exalumno', idExalumno)
    ]);

    const info = infoRes.data || {};
    const carreras = (carrUsuRes.data || []).map(c => c.carreras?.nombre).filter(Boolean);
    const areas = (areasRes.data || []).map(a => a.areas_interes?.nombre).filter(Boolean);

    return {
      biografia: info.biografia || '',
      empresa: info.empresa || '',
      cargo: info.cargo || '',
      anos_experiencia: info.anos_experiencia || 0,
      carreras,
      areas
    };
  } catch (e) {
    console.error('Error al obtener perfil exalumno:', e);
    return null;
  }
};

/**
 * Helper para formatear el currículum (CV) del estudiante de forma legible para el prompt de Claude.
 */
const formatearCvParaPrompt = (cv) => {
  if (!cv) return 'Sin currículum registrado en el sistema.';
  
  const academica = cv.seccion1_academica ? `
- Promedio ponderado: ${cv.seccion1_academica.promedio_ponderado || 'No especificado'}
- Cursos relevantes: ${cv.seccion1_academica.cursos_relevantes || 'No especificados'}
  ` : 'No especificada.';

  const experiencias = (cv.seccion2_experiencias || []).map(e => {
    let bullets = [];
    try {
      if (e.bullets) {
        bullets = typeof e.bullets === 'string' ? JSON.parse(e.bullets) : e.bullets;
      }
    } catch (err) {}
    return `
* Rol: ${e.titulo} en ${e.organizacion || 'N/A'}
  - Tipo: ${e.tipo}
  - Periodo: ${e.fecha_inicio} - ${e.fecha_fin || 'actual'}
  - Descripción: ${e.descripcion || ''}
  - Logros: ${bullets.length > 0 ? bullets.join(', ') : 'Ninguno'}
    `;
  }).join('\n') || 'Ninguna registrada.';

  const habs = cv.seccion3_habilidades;
  let tecnicas = 'No especificadas';
  let blandas = 'No especificadas';
  let idiomas = 'No específicos';
  if (habs) {
    try {
      if (habs.tecnicas) {
        const tObj = typeof habs.tecnicas === 'string' ? JSON.parse(habs.tecnicas) : habs.tecnicas;
        tecnicas = Array.isArray(tObj) ? tObj.map(h => `${h.nombre} (${h.nivel})`).join(', ') : JSON.stringify(tObj);
      }
    } catch (err) {}
    try {
      blandas = habs.blandas || 'No especificadas';
    } catch (err) {}
    try {
      if (habs.idiomas) {
        const iObj = typeof habs.idiomas === 'string' ? JSON.parse(habs.idiomas) : habs.idiomas;
        idiomas = Array.isArray(iObj) ? iObj.map(i => `${i.idioma} (${i.nivel})`).join(', ') : JSON.stringify(iObj);
      }
    } catch (err) {}
  }

  const certificaciones = (cv.seccion4_certificaciones || []).map(c => `
- Certificación: ${c.nombre} por ${c.institucion || ''} (${c.fecha || ''})
  `).join('\n') || 'Ninguna registrada.';

  return `
--- DETALLES DEL CURRÍCULUM DEL ESTUDIANTE ---
ACADÉMICO:
${academica}

EXPERIENCIA LABORAL Y PROYECTOS:
${experiencias}

HABILIDADES:
- Técnicas: ${tecnicas}
- Blandas: ${blandas}
- Idiomas: ${idiomas}

CERTIFICACIONES Y LOGROS:
${certificaciones}
---------------------------------------------
  `;
};

/**
 * Busca a un estudiante por aproximación de nombre y obtiene su perfil.
 */
const buscarEstudiantePorNombre = async (nombreBuscado) => {
  try {
    // Buscar todos los estudiantes activos
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo_electronico')
      .eq('id_rol', 1) // Rol 1 = estudiante
      .eq('estado', 'activo');

    if (error || !usuarios || usuarios.length === 0) return null;

    // Buscar coincidencia por nombre
    const query = nombreBuscado.toLowerCase().trim();
    const match = usuarios.find(u => 
      u.nombre.toLowerCase().includes(query) || 
      query.includes(u.nombre.toLowerCase())
    );

    if (!match) return null;

    // Cargar perfil onboarding
    const { data: onboarding } = await supabase
      .from('perfil_onboarding')
      .select('datos')
      .eq('id_usuario', match.id)
      .maybeSingle();

    // Cargar proyecto de graduación
    const { data: proyecto } = await supabase
      .from('proyecto_graduacion')
      .select('*')
      .eq('id_estudiante', match.id)
      .maybeSingle();

    // Cargar CV completo
    let cv = null;
    try {
      const cvService = require('./cv.service');
      cv = await cvService.obtenerCvCompleto(match.id);
    } catch (cvError) {
      console.warn('⚠️ No se pudo obtener el CV del estudiante:', cvError.message);
    }

    return {
      id: match.id,
      nombre: match.nombre,
      correo: match.correo_electronico,
      onboarding: onboarding?.datos || {},
      proyecto: proyecto || {},
      cv: cv || {}
    };
  } catch (e) {
    console.error('Error al buscar estudiante por nombre:', e);
    return null;
  }
};

/**
 * Genera la respuesta del chatbot de soporte utilizando Claude de Anthropic adaptativo.
 * @param {Array} historial Arreglo de mensajes [{ role: 'user'|'assistant', text: '...' }]
 * @param {Object} contexto Objeto con { rol, pathname }
 * @param {Object} usuarioAutenticado Objeto con la información del usuario autenticado (opcional)
 * @returns {Promise<string>} La respuesta generada por Claude.
 */
const generarRespuestaSoporte = async (historial, contexto, usuarioAutenticado) => {
  // Configurar el modelo desde la variable de entorno o usar Claude 3.5 Sonnet por defecto
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

  // Adaptar el historial para Claude:
  // 1. Debe comenzar con un mensaje del rol 'user'.
  // 2. Los roles deben alternar estrictamente entre 'user' y 'assistant'.
  let contents = [];
  let indexStart = 0;

  // Buscar el primer mensaje de usuario para iniciar el historial que enviamos a Claude
  while (indexStart < historial.length && historial[indexStart].role !== 'user') {
    indexStart++;
  }

  let lastRole = null;
  for (let i = indexStart; i < historial.length; i++) {
    const msg = historial[i];
    let role = msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user';
    const text = msg.text || msg.content || '';

    // Evitar roles repetidos consecutivos combinando sus contenidos si ocurren
    if (role === lastRole) {
      if (contents.length > 0) {
        contents[contents.length - 1].content += '\n' + text;
      }
      continue;
    }

    contents.push({
      role: role,
      content: text,
    });
    lastRole = role;
  }

  // Si no hay mensajes del usuario, devolvemos un saludo predeterminado
  if (contents.length === 0) {
    return '¡Hola! ¿En qué te puedo ayudar hoy con respecto a Alumni UCR?';
  }

  // Obtener prompt del sistema según el rol y la ruta (async para poder inyectar el CV)
  let promptSistema = await obtenerPromptDeSistema(contexto, usuarioAutenticado);

  // Lógica para detectar si es un exalumno analizando a un estudiante
  const esExalumno = (contexto?.rol || '').toLowerCase().trim() === 'exalumno';
  const ultimoMensajeUsuario = [...historial].reverse().find(msg => msg.role === 'user')?.text || '';

  if (esExalumno && usuarioAutenticado) {
    // Buscar patrones como "analiza a Natalia", "match con Juan", "gustos de Maria"
    const matchAnalisis = ultimoMensajeUsuario.match(/(?:analiz(?:a|ar)|match con|gustos de|afinidad con)\s+([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)/i);

    if (matchAnalisis && matchAnalisis[1]) {
      const nombreEstudiante = matchAnalisis[1].trim();
      const estudiante = await buscarEstudiantePorNombre(nombreEstudiante);

      if (estudiante) {
        const exalumno = await obtenerPerfilExalumno(usuarioAutenticado.id);

        promptSistema = `
Eres el asesor virtual oficial de "Alumni UCR — Conectando Talento", especializado en mentoría y orientación profesional.
Te estás comunicando con el exalumno y mentor verificado: ${usuarioAutenticado.profile?.nombre || 'Exalumno/Mentor'}.

Has recibido la solicitud de analizar el perfil y la compatibilidad con el/la siguiente estudiante:
- Nombre Completo: ${estudiante.nombre}
- Carrera cursada: ${estudiante.onboarding.carrera || estudiante.proyecto.carrera || 'No especificada'}
- Sede: ${estudiante.onboarding.sede || 'No especificada'}
- Nivel Académico: ${estudiante.onboarding.nivel || 'No especificado'}

INFORMACIÓN DEL PROYECTO ACTUAL DEL ESTUDIANTE:
- Título del Proyecto: ${estudiante.proyecto.titulo_proyecto || estudiante.onboarding.proyectoTitulo || 'Sin título'}
- Descripción: ${estudiante.proyecto.descripcion || estudiante.onboarding.proyectoDescripcion || 'Sin descripción'}
- Porcentaje de Avance: ${estudiante.proyecto.porcentaje_avance || estudiante.onboarding.proyectoAvance || 0}%
- Áreas Temáticas: ${(estudiante.onboarding.proyectoAreas || []).join(', ') || 'No especificadas'}

GUSTOS, INTERESES Y HABILIDADES GENERALES:
- Intereses Personales y Hobbies: ${(estudiante.onboarding.intereses || []).join(', ') || 'No especificados'}
- Habilidades Técnicas (Generales): ${estudiante.onboarding.habilidadesTecnicas || 'No especificadas'}
- Habilidades Blandas (Generales): ${estudiante.onboarding.habilidadesBlandas || 'No especificadas'}
- Biografía / Resumen: ${estudiante.onboarding.resumen || 'No especificado'}

${formatearCvParaPrompt(estudiante.cv)}

PERFIL DEL MENTOR EXALUMNO (TÚ):
- Empresa: ${exalumno?.empresa || 'No especificada'}
- Cargo: ${exalumno?.cargo || 'No especificado'}
- Años de Experiencia: ${exalumno?.anos_experiencia || 0} años
- Carreras UCR: ${(exalumno?.carreras || []).join(', ') || 'No especificadas'}
- Áreas de Especialidad: ${(exalumno?.areas || []).join(', ') || 'No especificadas'}
- Biografía/Trayectoria: ${exalumno?.biografia || 'No especificada'}

TU MISIÓN:
Genera un informe detallado, estructurado y sumamente motivador para el exalumno. Realiza un análisis profundo basado en la Habilidad de Compatibilidad (Match) evaluando las 4 dimensiones clave de afinidad:
1. Alineación Académica (hasta 25 pts)
2. Sinergia del Proyecto y Habilidades Técnicas (hasta 25 pts)
3. Ajuste de Rol Profesional (hasta 25 pts)
4. Lado Humano (Habilidades Blandas e Intereses) (hasta 25 pts)

Asigna una puntuación (0 a 25) a cada una de ellas y muestra la puntuación total de compatibilidad sobre 100.

DEBES SEGUIR ESTRICTAMENTE ESTA ESTRUCTURA EN TU RESPUESTA:
1. **🌟 Ficha del Match**: Resumen rápido de quién es el estudiante, su carrera y sede.
2. **Score de Compatibilidad Total**: Mostrar el puntaje global calculado sobre 100, desglosado en las 4 dimensiones (Alineación Académica, Sinergia Técnica, Proyección Profesional, y Lado Humano) con su respectiva justificación de puntos.
3. **Análisis Detallado de Afinidad**:
   - **Alineamiento Académico e Interdisciplinariedad**: Cruce de carreras, facultad y sede UCR.
   - **Sinergia del Proyecto y Habilidades del CV**: Análisis cruzado de su TFG e historial de tecnologías y certificaciones en el currículum con tu área.
   - **Inserción y Proyección Laboral**: Cómo tu cargo actual y experiencia en ${exalumno?.empresa || 'tu industria'} apoyan las aspiraciones de cargo deseado del estudiante.
   - **Compatibilidad Personal (El lado humano)**: Intereses compartidos y habilidades blandas complementarias.
4. **🛠️ Plan de Mentoría y Temas Sugeridos**: 2 o 3 temas clave en los que pueden enfocarse según sus perfiles y CVs.
5. **Cómo Contactar**: Indica amigablemente que si la afinidad es alta, puede presionar el botón **"Ofrecer apoyo"** en la tarjeta del estudiante dentro del directorio para enviarle una solicitud de contacto formal.

Responde utilizando Markdown limpio con viñetas y negritas. Mantén un tono sumamente empático, integrador y entusiasta.
`;
      } else {
        return `No logré encontrar a ningún estudiante activo en el directorio que coincida con el nombre **"${nombreEstudiante}"**. Por favor, revisa que esté escrito tal como aparece en su perfil.`;
      }
    }
  }

  // Aumentar tokens para el contexto de CV (que es más extenso por incluir el CV real)
  const esContextoCV = (contexto?.rol || '').toLowerCase() === 'estudiante' && (contexto?.pathname || '').includes('/mi-curriculum');
  const maxTokens = esContextoCV ? 1500 : 1024;

  try {
    const response = await claude.messages.create({
      model: model,
      max_tokens: maxTokens,
      system: promptSistema,
      temperature: 0.3,
      messages: contents,
    });

    if (
      response.content &&
      response.content.length > 0 &&
      response.content[0].text
    ) {
      return response.content[0].text;
    }

    return 'Lo siento, no he podido generar una respuesta en este momento. Inténtalo de nuevo.';
  } catch (error) {
    console.error('🔴 Error en el servicio de Claude Adaptativo:', error);

    const errMsg = error.message || '';
    const status = error.status || error.statusCode || error.status_code || 0;

    if (
      status === 429 ||
      errMsg.includes('429') ||
      /quota|limit|rate/i.test(errMsg)
    ) {
      throw new Error(
        'El asistente de IA (Claude) ha alcanzado su límite de cuota o rate limit temporal. Por favor, espera unos segundos e inténtalo de nuevo.'
      );
    }

    if (
      status === 503 ||
      status === 500 ||
      errMsg.includes('503') ||
      /unavailable|high demand|overloaded|server error/i.test(errMsg)
    ) {
      throw new Error(
        'El asistente de IA (Claude) está experimentando problemas temporales o alta demanda. Por favor, vuelve a intentarlo en unos instantes.'
      );
    }

    if (
      status === 401 ||
      status === 403 ||
      /key|auth|api key|credential|unauthorized/i.test(errMsg)
    ) {
      throw new Error(
        'Error de autenticación o configuración de la clave de API de Claude. Por favor, verifica tus credenciales.'
      );
    }

    throw new Error(
      `Error en el asistente de IA: ${errMsg || 'No se pudo procesar la solicitud.'}`
    );
  }
};

const PROMPT_ANALISIS_CARRERA = `Eres una IA experta en desarrollo profesional y reclutamiento en Costa Rica (Mercado laboral de la Universidad de Costa Rica - UCR).
Analiza el currículum del estudiante (su carrera, cargo deseado, habilidades, experiencias, y proyecto de graduación) y genera un análisis de carrera realista, detallado, motivador y sumamente profesional adaptado a su perfil.
Si el estudiante tiene poca información en su perfil o CV, asume información inicial basada en su carrera/área académica de la UCR para darle un punto de partida e invitarlo a completar más datos.

Debes responder ÚNICAMENTE con un objeto JSON válido (sin formato markdown ni backticks, solo el texto crudo del JSON):
{
  "estadoActual": "Resumen en una frase del estado actual del análisis (ej: 'Analizando tendencias del mercado para optimizar tu perfil en Ingeniería de Software junior...')",
  "benchmarkingSalarial": {
    "cargo": "Nombre del rol o cargo analizado",
    "porcentaje": 75,
    "mensaje": "Mensaje corto sobre la competitividad de su perfil en el mercado costarricense."
  },
  "tendencias": [
    {
      "titulo": "Título de la tendencia 1 (corto)",
      "descripcion": "Descripción breve y realista de la tendencia laboral en Costa Rica relacionada a su área."
    },
    {
      "titulo": "Título de la tendencia 2 (corto)",
      "descripcion": "Descripción breve de otra tendencia o demanda relevante (ej: idiomas, habilidades técnicas)."
    }
  ],
  "proyecciones": [
    {
      "puesto": "Nombre de un puesto o rol idóneo en una empresa real o representativa (ej: Desarrollador React Junior @ Gorilla Logic)",
      "porcentaje": 90,
      "explicacion": "Explicación breve de por qué encaja y qué palabra clave o habilidad del perfil destaca para este rol."
    },
    {
      "puesto": "Nombre de otro puesto idóneo (ej: Analista de Sistemas @ Amazon)",
      "porcentaje": 80,
      "explicacion": "Explicación de la coincidencia y qué debería enfatizar en su perfil."
    }
  ],
  "sugerenciaCertificacion": "Sugerencia específica en una frase (ej: 'Sugerencia IA: Obtén la certificación AWS Cloud Practitioner para llegar al 95% de match.')"
}`;

/**
 * Genera un análisis de carrera personalizado basado en el perfil del estudiante.
 */
const generarAnalisisCarrera = async (perfil) => {
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
  const datosPerfil = perfil || {};

  const contentPrompt = `
PERFIL DEL ESTUDIANTE A ANALIZAR:
- Nombre: ${datosPerfil.nombre || ''} ${datosPerfil.apellidos || ''}
- Carrera: ${datosPerfil.carrera || 'No especificada'}
- Cargo Deseado/Objetivo: ${datosPerfil.cargoDeseado || 'No especificado'}
- Ubicación: ${datosPerfil.ubicacion || 'No especificada'}
- Resumen Profesional: ${datosPerfil.resumen || 'No especificado'}
- Habilidades Técnicas: ${datosPerfil.habilidadesTecnicas || 'No especificadas'}
- Habilidades Blandas: ${datosPerfil.habilidadesBlandas || 'No especificadas'}
- Idiomas: ${datosPerfil.idiomas || 'No especificados'}
- Proyecto de Graduación/TFG:
  * Título: ${datosPerfil.proyectoTitulo || 'No especificado'}
  * Descripción: ${datosPerfil.proyectoDescripcion || 'No especificada'}
  * Avance: ${datosPerfil.proyectoAvance || 0}%
  * Áreas: ${(datosPerfil.proyectoAreas || []).join(', ') || 'No especificadas'}
- Experiencias Laborales/Proyectos:
  ${(datosPerfil.experiencias || []).map(e => `- ${e.puesto} en ${e.empresa} (${e.periodo}): ${e.descripcion}`).join('\n  ') || 'Sin experiencias registradas.'}

Por favor, analiza el perfil anterior y genera la respuesta JSON solicitada.
`;

  try {
    const response = await claude.messages.create({
      model: model,
      max_tokens: 1200,
      system: PROMPT_ANALISIS_CARRERA,
      temperature: 0.3,
      messages: [{ role: 'user', content: contentPrompt }],
    });

    if (
      response.content &&
      response.content.length > 0 &&
      response.content[0].text
    ) {
      let rawText = response.content[0].text.trim();
      // Limpiar posibles bloques de código markdown que Claude a veces añade por error
      rawText = rawText.replace(/```json/i, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(rawText);
      return parsed;
    }

    throw new Error('No se pudo obtener el análisis de la IA.');
  } catch (error) {
    console.error('🔴 Error al generar análisis de carrera con Claude:', error);
    // Devolver un fallback amigable en caso de que falle o se agote la cuota
    return {
      estadoActual: "Proyectando tu perfil para vacantes de tu carrera...",
      benchmarkingSalarial: {
        cargo: datosPerfil.cargoDeseado || datosPerfil.carrera || "Tu Perfil Profesional",
        porcentaje: 65,
        mensaje: "Completa más datos de tu CV y proyecto de graduación para recibir una puntuación precisa."
      },
      tendencias: [
        {
          titulo: "Certificaciones Técnicas",
          descripcion: "Los reclutadores en Costa Rica valoran enormemente las certificaciones en metodologías ágiles y nubes públicas."
        },
        {
          titulo: "Segundo Idioma",
          descripcion: "El dominio del inglés (B2 o superior) incrementa el rango salarial en un 40% para recién graduados."
        }
      ],
      proyecciones: [
        {
          puesto: `Puesto Junior en ${datosPerfil.carrera || "tu carrera"}`,
          porcentaje: 75,
          explicacion: "Coincidencia basada en tus estudios en la Universidad de Costa Rica (UCR)."
        }
      ],
      sugerenciaCertificacion: "Sugerencia IA: Completa tus habilidades de idiomas y técnicas para optimizar tu proyección."
    };
  }
};

module.exports = {
  generarRespuestaSoporte,
  generarAnalisisCarrera,
};
