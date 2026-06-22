/**
 * Servicio de Inteligencia Artificial para el Chatbot de Soporte Global Adaptativo (Claude).
 * Selecciona dinámicamente el Prompt de Sistema según el rol y pathname del usuario.
 */
const claude = require('../config/claude');

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
`
};

/**
 * Retorna el prompt de sistema correspondiente según el rol y la ruta del usuario.
 */
const obtenerPromptDeSistema = (contexto) => {
  const rol = (contexto?.rol || 'visitante').toLowerCase().trim();
  const pathname = (contexto?.pathname || '/').toLowerCase().trim();

  // Caso 1: Administrador
  if (rol === 'admin') {
    return PROMPTS.ADMIN;
  }

  // Caso 2: Exalumno
  if (rol === 'exalumno') {
    return PROMPTS.EXALUMNO_GENERAL;
  }

  // Caso 3: Estudiante
  if (rol === 'estudiante') {
    // Si está editando proyectos, completando perfil académico o en la sección de proyectos
    if (
      pathname.includes('/proyectos') ||
      pathname.includes('/perfil-estudiante') ||
      pathname.includes('/completar-perfil')
    ) {
      return PROMPTS.ESTUDIANTE_PROYECTOS;
    }
    // Si está buscando mentores o en mentorías
    if (pathname.includes('/mentorias')) {
      return PROMPTS.ESTUDIANTE_MENTORIAS;
    }
    // Dashboard o página general de estudiante
    return PROMPTS.ESTUDIANTE_GENERAL;
  }

  // Caso 4: Por defecto (Público/Visitante)
  return PROMPTS.PUBLICO;
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

    return {
      id: match.id,
      nombre: match.nombre,
      correo: match.correo_electronico,
      onboarding: onboarding?.datos || {},
      proyecto: proyecto || {}
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

  // Obtener prompt del sistema según el rol y la ruta
  let promptSistema = obtenerPromptDeSistema(contexto);

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

Has recibido la solicitud de analizar el perfil y el match con el/la siguiente estudiante:
- Nombre Completo: ${estudiante.nombre}
- Carrera cursada: ${estudiante.onboarding.carrera || estudiante.proyecto.carrera || 'No especificada'}
- Sede: ${estudiante.onboarding.sede || 'No especificada'}
- Nivel Académico: ${estudiante.onboarding.nivel || 'No especificado'}

INFORMACIÓN DEL PROYECTO ACTUAL DEL ESTUDIANTE:
- Título del Proyecto: ${estudiante.proyecto.titulo_proyecto || estudiante.onboarding.proyectoTitulo || 'Sin título'}
- Descripción: ${estudiante.proyecto.descripcion || estudiante.onboarding.proyectoDescripcion || 'Sin descripción'}
- Porcentaje de Avance: ${estudiante.proyecto.porcentaje_avance || estudiante.onboarding.proyectoAvance || 0}%
- Áreas Temáticas: ${(estudiante.onboarding.proyectoAreas || []).join(', ') || 'No especificadas'}

GUSTOS, INTERESES Y HABILIDADES DEL ESTUDIANTE:
- Intereses Personales y Hobbies: ${(estudiante.onboarding.intereses || []).join(', ') || 'No especificados'}
- Habilidades Técnicas: ${estudiante.onboarding.habilidadesTecnicas || 'No especificadas'}
- Habilidades Blandas (Perfil Emocional): ${estudiante.onboarding.habilidadesBlandas || 'No especificadas'}
- Biografía / Resumen: ${estudiante.onboarding.resumen || 'No especificado'}

PERFIL DEL MENTOR EXALUMNO (TÚ):
- Empresa: ${exalumno?.empresa || 'No especificada'}
- Cargo: ${exalumno?.cargo || 'No especificado'}
- Años de Experiencia: ${exalumno?.anos_experiencia || 0} años
- Carreras UCR: ${(exalumno?.carreras || []).join(', ') || 'No especificadas'}
- Áreas de Especialidad: ${(exalumno?.areas || []).join(', ') || 'No especificadas'}
- Biografía/Trayectoria: ${exalumno?.biografia || 'No especificada'}

TU MISIÓN:
Genera un informe detallado, cálido, estructurado y sumamente motivador para el exalumno. Analiza las sinergias emocionales y profesionales entre ambos.

DEBES SEGUIR ESTRICTAMENTE ESTA ESTRUCTURA EN TU RESPUESTA:
1. **Presentación de la Ficha del Estudiante**: Breve resumen de quién es, su carrera, sede y su proyecto de graduación (TFG) actual.
2. **Gustos y Aficiones (El lado humano)**: Describe en detalle los intereses personales y gustos del estudiante (${(estudiante.onboarding.intereses || []).join(', ') || 'No especificados'}). Destaca sus pasiones extralaborales y qué le gusta hacer en su tiempo libre.
3. **Match Emocional y de Habilidades Blandas**: Analiza la afinidad de personalidad y compatibilidad emocional. Cruza las habilidades blandas del estudiante (${estudiante.onboarding.habilidadesBlandas || 'No especificadas'}) con tu biografía y experiencia como mentor. Explica el tipo de relación constructiva, empática y de apoyo mutuo que pueden formar.
4. **Sinergia Profesional y Propuesta de Mentoría**: Analiza la compatibilidad técnica y profesional. ¿Cómo tus conocimientos en ${exalumno?.areas?.join(', ') || 'tus especialidades'} y tu puesto de ${exalumno?.cargo || 'profesional'} en ${exalumno?.empresa || 'tu empresa'} pueden ayudar de manera directa a este estudiante en su proyecto de graduación y en su futura inserción laboral?
5. **Cómo Contactar**: Indica amigablemente que si la afinidad es alta, puede presionar el botón **"Ofrecer apoyo"** en la tarjeta del estudiante dentro del directorio para enviarle una solicitud de contacto formal y poder revelar su información de beca y correo electrónico.

Responde utilizando Markdown limpio con viñetas y negritas. Mantén un tono sumamente empático, integrador y entusiasta.
`;
      } else {
        return `No logré encontrar a ningún estudiante activo en el directorio que coincida con el nombre **"${nombreEstudiante}"**. Por favor, revisa que esté escrito tal como aparece en su perfil.`;
      }
    }
  }

  try {
    const response = await claude.messages.create({
      model: model,
      max_tokens: 1024,
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

module.exports = {
  generarRespuestaSoporte,
};
