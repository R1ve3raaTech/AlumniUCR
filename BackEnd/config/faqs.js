// Preguntas frecuentes (FAQ) de Conectando Talento UCR.
// Fuente única, versionada, que sirve el endpoint público GET /api/faqs.
// Organizadas por gestión del modelo de negocio. Redacción seria, empática y
// con enfoque de accesibilidad (lenguaje claro, voseo cordial, sin tecnicismos
// innecesarios). Pensadas a partir de las dudas más usuales de estudiantes y
// visitantes de la plataforma.

const CATEGORIAS = [
  { key: 'registro', titulo: 'Registro y Cuenta', texto: 'Cómo registrarte, aprobación de cuenta e inicio de sesión.' },
  { key: 'estudiantes', titulo: 'Estudiantes y Becas', texto: 'Beca socioeconómica, perfil, CV con IA y tu dashboard.' },
  { key: 'mentorias', titulo: 'Exalumnos y Mentorías', texto: 'Postularte como mentor, matching y oportunidades.' },
  { key: 'proyectos', titulo: 'Proyectos y Financiamiento', texto: 'Registrar tu TFG, áreas temáticas y apoyo requerido.' },
  { key: 'donaciones', titulo: 'Donaciones', texto: 'Cómo aportar, comprobantes y transparencia de los fondos.' },
  { key: 'seguridad', titulo: 'Seguridad y Privacidad', texto: 'Protección de datos, reportes y accesibilidad.' },
];

const FAQS = [
  // ── Registro y Cuenta ──────────────────────────────────────────────
  { categoria: 'Registro y Cuenta', pregunta: '¿Quiénes pueden registrarse en la plataforma?', respuesta: 'Pueden registrarse estudiantes activos de la UCR con beca socioeconómica de nivel 4 o 5, y personas graduadas (exalumnos) que deseen aportar como mentores, empleadores o donantes. Cada rol tiene su propio proceso de registro.' },
  { categoria: 'Registro y Cuenta', pregunta: '¿Qué correo necesito para registrarme como estudiante?', respuesta: 'Necesitás tu correo institucional @ucr.ac.cr. Es la forma de confirmar que sos estudiante activo de la Universidad y proteger la autenticidad de la red.' },
  { categoria: 'Registro y Cuenta', pregunta: '¿Los exalumnos también necesitan correo institucional?', respuesta: 'No. Los exalumnos pueden registrarse con cualquier correo, pero deben indicar su carrera, facultad de procedencia y año de graduación para validar su vínculo con la UCR.' },
  { categoria: 'Registro y Cuenta', pregunta: '¿Cuánto tarda en aprobarse mi cuenta?', respuesta: 'Las cuentas de exalumno pasan por una revisión manual del equipo administrativo. Te avisamos por correo apenas se apruebe o si necesitamos algún dato adicional. Agradecemos tu paciencia durante este paso.' },
  { categoria: 'Registro y Cuenta', pregunta: '¿Por qué mi cuenta aparece como "pendiente"?', respuesta: 'Significa que tu registro se recibió correctamente y está en revisión. Es un paso normal y necesario para garantizar la seguridad de toda la comunidad.' },
  { categoria: 'Registro y Cuenta', pregunta: 'Olvidé mi contraseña, ¿cómo la recupero?', respuesta: 'En la pantalla de inicio de sesión usá la opción "¿Olvidaste tu contraseña?" para recibir un enlace de restablecimiento en tu correo. Seguí los pasos y podrás definir una nueva contraseña.' },
  { categoria: 'Registro y Cuenta', pregunta: '¿Puedo cambiar mi correo después de registrarme?', respuesta: 'Tu correo es tu identificador principal, por eso no se cambia de forma automática. Si lo necesitás, escribinos desde el Centro de Soporte y te acompañamos en el proceso.' },
  { categoria: 'Registro y Cuenta', pregunta: '¿El registro tiene algún costo?', respuesta: 'No. El acceso a la plataforma es completamente gratuito para estudiantes y exalumnos de la UCR. Nuestro objetivo es abrir oportunidades, no crear barreras.' },
  { categoria: 'Registro y Cuenta', pregunta: 'Me registré pero no recibí el correo de confirmación, ¿qué hago?', respuesta: 'Revisá primero tu carpeta de spam o correo no deseado. Si pasados unos minutos no llega, podés solicitar el reenvío o contactarnos y lo resolvemos juntos.' },
  { categoria: 'Registro y Cuenta', pregunta: '¿Puedo tener una cuenta de estudiante y de exalumno a la vez?', respuesta: 'Cada persona usa un solo perfil según su situación actual. Cuando te gradúes, podemos ayudarte a migrar tu perfil a exalumno conservando tu historial.' },

  // ── Estudiantes y Becas ────────────────────────────────────────────
  { categoria: 'Estudiantes y Becas', pregunta: '¿Por qué se pide beca de nivel 4 o 5?', respuesta: 'La plataforma prioriza el acompañamiento a estudiantes en mayor vulnerabilidad socioeconómica, para ampliar sus oportunidades profesionales con el apoyo de la red Alumni. Es parte de nuestro compromiso con la equidad.' },
  { categoria: 'Estudiantes y Becas', pregunta: '¿Dónde verifico mi nivel de beca?', respuesta: 'Tu nivel de beca lo asigna la Oficina de Becas de la UCR y podés consultarlo en tu expediente estudiantil institucional. Si tenés dudas sobre tu categoría, la Oficina de Becas es la fuente oficial.' },
  { categoria: 'Estudiantes y Becas', pregunta: '¿Mi información socioeconómica es pública?', respuesta: 'No. Datos sensibles como tu nivel de beca o tu promedio nunca se muestran en el directorio. La plataforma exhibe únicamente tu talento y tus proyectos.' },
  { categoria: 'Estudiantes y Becas', pregunta: '¿Cómo completo mi perfil de estudiante?', respuesta: 'Llenás un formulario inicial una sola vez, y esos datos se reflejan automáticamente en tu perfil, CV, matches y directorio. Así evitás repetir información y mantenés todo coherente.' },
  { categoria: 'Estudiantes y Becas', pregunta: '¿Qué es el CV con IA?', respuesta: 'Es una herramienta que te ayuda a redactar y mejorar tu currículum con sugerencias, plantillas y un asistente. Su meta es que destaques con claridad ante mentores y empresas.' },
  { categoria: 'Estudiantes y Becas', pregunta: '¿Puedo subir mi propia foto de perfil?', respuesta: 'Sí. Podés subirla desde tu galería o un enlace y ajustarla a un recorte circular. Queda vinculada a tu perfil de forma privada y segura.' },
  { categoria: 'Estudiantes y Becas', pregunta: '¿Qué encuentro en mi dashboard?', respuesta: 'Un resumen práctico de todas tus secciones: avance de tu perfil, CV, matches, directorio y reportes, además de próximos pasos sugeridos y un recordatorio para tu bienestar.' },
  { categoria: 'Estudiantes y Becas', pregunta: '¿Para qué sirve registrar mi proyecto de graduación?', respuesta: 'Al registrarlo aparecés en el directorio de talento y mejorás tus coincidencias con mentores y oportunidades afines a tu TFG. Es una forma de que la red te encuentre.' },
  { categoria: 'Estudiantes y Becas', pregunta: '¿Cómo busco mentores o apoyo?', respuesta: 'En el Centro de Matches definís qué necesitás —mentoría, pasantía o empleo— y la plataforma te sugiere perfiles afines de la red para que conectes con ellos.' },
  { categoria: 'Estudiantes y Becas', pregunta: 'Si pierdo la beca, ¿pierdo el acceso?', respuesta: 'Cualquier cambio en tu situación se evalúa con respeto y caso por caso. Escribinos desde el Centro de Soporte y te orientamos sobre tus opciones con total apertura.' },

  // ── Exalumnos y Mentorías ──────────────────────────────────────────
  { categoria: 'Exalumnos y Mentorías', pregunta: '¿Cómo me postulo como mentor?', respuesta: 'Completá tu perfil de exalumno e indicá que ofrecés mentoría. Tu postulación queda sujeta a la aprobación del equipo administrativo, que valida tu trayectoria.' },
  { categoria: 'Exalumnos y Mentorías', pregunta: '¿A quién voy a guiar como mentor?', respuesta: 'Acompañarás a estudiantes de la UCR con beca de nivel 4 o 5, aportando tu experiencia profesional y académica. Tu guía puede marcar una diferencia real en su futuro.' },
  { categoria: 'Exalumnos y Mentorías', pregunta: '¿Cómo funciona el matching?', respuesta: 'Se cruzan la carrera, las áreas temáticas y el tipo de apoyo. Además se otorga una puntuación extra al matching interdisciplinario, cuando el mentor proviene de otra facultad.' },
  { categoria: 'Exalumnos y Mentorías', pregunta: '¿Puedo ofrecer empleo o pasantías?', respuesta: 'Sí. Desde tu perfil podés publicar oportunidades laborales y de pasantía dirigidas a la comunidad estudiantil, ampliando las puertas para las nuevas generaciones.' },
  { categoria: 'Exalumnos y Mentorías', pregunta: '¿Cuántos estudiantes puedo mentorear?', respuesta: 'Para cuidar la calidad y el compromiso del acompañamiento, se recomienda mantener un número limitado de conexiones activas al mismo tiempo.' },
  { categoria: 'Exalumnos y Mentorías', pregunta: 'Un estudiante me envió una solicitud, ¿qué hago?', respuesta: 'Recibirás una notificación y podrás aceptar o declinar la conexión. Si la aceptás, se habilita el contacto para coordinar la mentoría con tranquilidad.' },
  { categoria: 'Exalumnos y Mentorías', pregunta: '¿Puedo rechazar una conexión?', respuesta: 'Sí, con total libertad. Una conexión rechazada no podrá volver a solicitarse al mismo estudiante, de modo que tu decisión siempre se respeta.' },
  { categoria: 'Exalumnos y Mentorías', pregunta: '¿Qué se espera de mí como mentor?', respuesta: 'Puntualidad, profesionalismo y respeto. Sugerimos acordar objetivos claros desde el inicio y dar seguimiento con minutas breves para que el proceso sea provechoso.' },
  { categoria: 'Exalumnos y Mentorías', pregunta: '¿Mi cuenta de exalumno necesita aprobación cada vez?', respuesta: 'No. La aprobación es única, al validar tu perfil por primera vez. Luego podés operar con normalidad sin nuevas revisiones.' },
  { categoria: 'Exalumnos y Mentorías', pregunta: '¿Puedo dejar de ser mentor temporalmente?', respuesta: 'Sí. Podés pausar tu disponibilidad cuando lo necesités, sin perder tu perfil ni tu historial. Tu tiempo y tus circunstancias importan.' },

  // ── Proyectos y Financiamiento ─────────────────────────────────────
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Qué tipo de proyectos puedo publicar?', respuesta: 'Tu Trabajo Final de Graduación (TFG), tu Trabajo Comunal Universitario (TCU) o proyectos de curso vinculados a tu formación. Lo importante es que reflejen tu talento.' },
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Cómo registro mi proyecto?', respuesta: 'Desde el Directorio de Talento completás el título, el tipo, el área temática y el apoyo que buscás. La información se guarda automáticamente mientras editás.' },
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Por qué importan las áreas temáticas?', respuesta: 'Permiten que el motor de matching te conecte con mentores y oportunidades realmente afines a tu proyecto. Elegirlas bien mejora la calidad de tus coincidencias.' },
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Quién puede ver mi proyecto?', respuesta: 'Solo mentores y empresas validadas de la red pueden ver tu ficha pública. Tu información sensible permanece privada en todo momento.' },
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Puedo solicitar financiamiento para mi proyecto?', respuesta: 'Sí. Podés indicar una meta de apoyo o patrocinio, y los aportes se gestionan con transparencia a través de la Fundación Alumni UCR.' },
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Cómo se muestra el avance de mi proyecto?', respuesta: 'Con un porcentaje y una barra de progreso que vos mismo actualizás para reflejar tu estado real. Es una forma honesta de comunicar tu avance.' },
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Puedo tener varios proyectos?', respuesta: 'Podés destacar tu proyecto actual y conservar un historial de proyectos previos en tu ficha, mostrando tu evolución a lo largo del tiempo.' },
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Qué es el matching interdisciplinario?', respuesta: 'Es una mayor puntuación cuando colaboran personas de distintas facultades. Fomenta soluciones más completas, creativas e innovadoras para tu proyecto.' },
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Cómo recibo apoyo de un exalumno para mi TFG?', respuesta: 'Definí el apoyo requerido en tu ficha (mentoría, pasantía, patrocinio) y los perfiles afines podrán ofrecerte su acompañamiento o recursos.' },
  { categoria: 'Proyectos y Financiamiento', pregunta: '¿Puedo editar mi proyecto luego de publicarlo?', respuesta: 'Sí, cuando quieras. Los cambios se reflejan al instante en tu ficha y en el directorio, para que tu información esté siempre al día.' },

  // ── Donaciones ─────────────────────────────────────────────────────
  { categoria: 'Donaciones', pregunta: '¿Quién puede donar?', respuesta: 'Principalmente exalumnos y aliados de la red que deseen apoyar a estudiantes y sus proyectos. Cada aporte, grande o pequeño, suma a la comunidad.' },
  { categoria: 'Donaciones', pregunta: '¿Cómo registro una donación?', respuesta: 'Desde tu panel de exalumno podés registrar el aporte y adjuntar el comprobante correspondiente para su verificación.' },
  { categoria: 'Donaciones', pregunta: '¿A dónde va mi donación?', respuesta: 'Se canaliza a través de la Fundación Alumni UCR hacia el apoyo de estudiantes con beca y sus iniciativas académicas, con criterios claros de asignación.' },
  { categoria: 'Donaciones', pregunta: '¿Mi donación es confidencial?', respuesta: 'Sí. El monto de tu donación es privado y no se expone públicamente en el directorio. Respetamos tu generosidad y tu privacidad.' },
  { categoria: 'Donaciones', pregunta: '¿Recibo un comprobante?', respuesta: 'Tu registro queda asociado a tu comprobante, y el equipo administrativo lo verifica para mantener la transparencia de los fondos.' },
  { categoria: 'Donaciones', pregunta: '¿Puedo donar a un proyecto específico?', respuesta: 'Sí, podés dirigir tu aporte a una iniciativa o meta concreta cuando esté disponible, para acompañar de cerca lo que más te motiva.' },
  { categoria: 'Donaciones', pregunta: '¿Cuánto tarda en confirmarse mi donación?', respuesta: 'Tras registrarla, el equipo la revisa y verifica el comprobante. Te mantenemos informado del estado durante el proceso.' },
  { categoria: 'Donaciones', pregunta: '¿Las donaciones tienen seguimiento?', respuesta: 'Sí. La administración da seguimiento a cada aporte para asegurar su correcta aplicación y rendir cuentas a la comunidad.' },
  { categoria: 'Donaciones', pregunta: '¿Puedo colaborar si no soy exalumno?', respuesta: 'Si querés aportar y no calzás en los roles actuales, escribinos desde el Centro de Soporte y te orientamos sobre cómo sumar tu apoyo.' },
  { categoria: 'Donaciones', pregunta: '¿Cómo sé que mi aporte tuvo impacto?', respuesta: 'La plataforma comparte indicadores del impacto de la red para que veas el efecto colectivo de las donaciones en la comunidad estudiantil.' },

  // ── Seguridad y Privacidad ─────────────────────────────────────────
  { categoria: 'Seguridad y Privacidad', pregunta: '¿Cómo protegen mis datos personales?', respuesta: 'Tu información sensible (promedio, nivel de beca, datos socioeconómicos) nunca es pública. La plataforma solo muestra tu talento y tus proyectos.' },
  { categoria: 'Seguridad y Privacidad', pregunta: '¿Cómo reporto a otra persona?', respuesta: 'Desde la sección Reportes podés enviar una denuncia, queja o sugerencia. Llega directo al administrador, que la revisa con seriedad y confidencialidad.' },
  { categoria: 'Seguridad y Privacidad', pregunta: '¿Mi reporte es anónimo?', respuesta: 'Podés enviarlo de forma anónima si así lo preferís; la persona reportada nunca sabrá quién la reportó. Tu seguridad es prioritaria.' },
  { categoria: 'Seguridad y Privacidad', pregunta: '¿Qué pasa si reportan a alguien varias veces?', respuesta: 'Tres reportes sobre un mismo perfil generan una suspensión temporal automática, como medida para proteger a la comunidad mientras se revisa el caso.' },
  { categoria: 'Seguridad y Privacidad', pregunta: '¿Cómo recupero el acceso a mi cuenta?', respuesta: 'Usá la opción de restablecer contraseña desde el inicio de sesión. Si el problema persiste con tu correo @ucr.ac.cr, el Centro de Informática de la UCR puede ayudarte.' },
  { categoria: 'Seguridad y Privacidad', pregunta: '¿La plataforma es accesible para personas con discapacidad?', respuesta: 'Trabajamos con foco en accesibilidad: navegación por teclado, contraste adecuado y textos legibles para lectores de pantalla. Si encontrás una barrera, contanos y la corregimos.' },
  { categoria: 'Seguridad y Privacidad', pregunta: '¿Qué hago si veo contenido inapropiado?', respuesta: 'Reportalo de inmediato desde la sección Reportes. Revisamos cada caso con respeto, seriedad y confidencialidad para mantener un espacio sano.' },
  { categoria: 'Seguridad y Privacidad', pregunta: '¿Comparten mi información con terceros?', respuesta: 'No comercializamos tus datos. Se utilizan únicamente para el funcionamiento de la red y el motor de matching, conforme a su propósito.' },
  { categoria: 'Seguridad y Privacidad', pregunta: '¿Cómo cuido mi propia seguridad en la red?', respuesta: 'Usá una contraseña fuerte y única, no la compartas y cerrá sesión en equipos ajenos. Ante cualquier actividad sospechosa, avisanos cuanto antes.' },
  { categoria: 'Seguridad y Privacidad', pregunta: '¿Puedo solicitar la eliminación de mi cuenta?', respuesta: 'Sí. Si deseás dar de baja tu cuenta, escribinos desde el Centro de Soporte y gestionamos tu solicitud con el cuidado que merece tu información.' },
];

module.exports = { CATEGORIAS, FAQS };
