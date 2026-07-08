// Ejemplos ilustrativos por área temática — ayudan al estudiante a entender
// qué se espera en planteamiento del problema, objetivos y metodología.
// No son generados por IA (contenido estático, curado), y no se guardan como
// parte del proyecto — solo se muestran como referencia.

export interface EjemploArea {
  planteamiento: string;
  objetivos: string;
  metodologia: string;
}

const GENERICO: EjemploArea = {
  planteamiento: 'En los últimos años, [problema observado] ha generado [consecuencia relevante] dentro de [contexto/población]. A pesar de existir [soluciones actuales], estas presentan [limitación], lo que evidencia la necesidad de [propuesta general del proyecto].',
  objetivos: 'Objetivo general: Desarrollar [solución] para [beneficiario] que permita [resultado esperado].\nEspecíficos: Analizar [aspecto 1]; Diseñar [aspecto 2]; Evaluar [aspecto 3].',
  metodologia: 'El proyecto seguirá un enfoque [cuantitativo/cualitativo/mixto], con las etapas de: (1) levantamiento de requerimientos, (2) diseño de la solución, (3) implementación, (4) pruebas y validación con usuarios reales.',
};

export const EJEMPLOS_POR_AREA: Record<string, EjemploArea> = {
  'Tecnología e Innovación': {
    planteamiento: 'Las organizaciones de [sector] dependen de procesos manuales para [tarea], lo que provoca errores y pérdida de tiempo. No existe una herramienta accesible que automatice [proceso] para equipos pequeños.',
    objetivos: 'Objetivo general: Desarrollar un sistema web que automatice [proceso] para [tipo de organización].\nEspecíficos: Analizar los requerimientos funcionales del proceso actual; Diseñar la arquitectura del sistema; Implementar el módulo de [funcionalidad]; Evaluar la usabilidad con usuarios reales.',
    metodologia: 'Se utilizará una metodología ágil (Scrum), con sprints de dos semanas, entrevistas a usuarios para el levantamiento de requerimientos, y pruebas de usabilidad al finalizar cada iteración.',
  },
  'Salud y Bienestar': {
    planteamiento: 'La población de [grupo] presenta altos índices de [condición de salud], asociados a [factor de riesgo]. Los programas actuales de prevención no logran [resultado esperado] por [limitación].',
    objetivos: 'Objetivo general: Diseñar una estrategia de intervención para reducir [factor de riesgo] en [población].\nEspecíficos: Identificar los factores asociados a [condición]; Diseñar el programa de intervención; Evaluar su efectividad en una muestra piloto.',
    metodologia: 'Estudio de tipo cuasi-experimental con grupo control, aplicando instrumentos validados de recolección de datos antes y después de la intervención.',
  },
  'Educación y Pedagogía': {
    planteamiento: 'Los estudiantes de [nivel] muestran bajo rendimiento en [área], relacionado con [causa pedagógica]. Las estrategias actuales de enseñanza no atienden [necesidad específica].',
    objetivos: 'Objetivo general: Diseñar una estrategia didáctica para mejorar [habilidad] en estudiantes de [nivel].\nEspecíficos: Identificar las dificultades de aprendizaje actuales; Diseñar la propuesta didáctica; Evaluar su impacto en el rendimiento estudiantil.',
    metodologia: 'Investigación-acción con dos grupos (control y experimental), aplicando pre-test y post-test para medir el impacto de la estrategia.',
  },
  'Medio Ambiente y Sostenibilidad': {
    planteamiento: 'La zona de [ubicación] enfrenta [problema ambiental], que afecta a [ecosistema/comunidad]. No existen datos actualizados que permitan dimensionar el impacto real de este fenómeno.',
    objetivos: 'Objetivo general: Determinar el impacto de [factor] sobre [ecosistema] en [ubicación].\nEspecíficos: Analizar las condiciones actuales del ecosistema; Determinar los niveles de [contaminante/variable]; Comparar los resultados con estándares ambientales vigentes.',
    metodologia: 'Estudio de campo con muestreo en [n] puntos de la zona, análisis de laboratorio de las muestras, y comparación estadística con normativa ambiental costarricense.',
  },
  'Agro y Alimentación': {
    planteamiento: 'Los productores de [cultivo] en [región] enfrentan pérdidas por [plaga/problema], sin acceso a herramientas tecnológicas de monitoreo accesibles.',
    objetivos: 'Objetivo general: Implementar un sistema de monitoreo para la detección temprana de [plaga] en cultivos de [cultivo].\nEspecíficos: Identificar los indicadores tempranos de la plaga; Diseñar el sistema de sensores; Evaluar su precisión en campo.',
    metodologia: 'Fase experimental en parcela piloto, con recolección de datos mediante sensores IoT y análisis comparativo contra el método de monitoreo tradicional.',
  },
  'Ingeniería y Construcción': {
    planteamiento: 'Las edificaciones de [tipo] en [zona] presentan [problema estructural], asociado a [causa]. No se cuenta con un diagnóstico actualizado que oriente decisiones de mantenimiento.',
    objetivos: 'Objetivo general: Evaluar el estado estructural de [tipo de edificación] en [zona].\nEspecíficos: Identificar los daños estructurales visibles; Determinar las causas probables; Comparar con la normativa de construcción vigente.',
    metodologia: 'Inspección técnica in situ, ensayos no destructivos y análisis comparativo con el Código Sísmico de Costa Rica.',
  },
  'Investigación Científica': {
    planteamiento: 'Existe evidencia limitada sobre [fenómeno] en el contexto de [población/muestra], lo que dificulta la toma de decisiones basada en datos locales.',
    objetivos: 'Objetivo general: Analizar [fenómeno] en [contexto de estudio].\nEspecíficos: Identificar las variables asociadas al fenómeno; Determinar su comportamiento en la muestra estudiada; Comparar los hallazgos con estudios previos.',
    metodologia: 'Investigación de enfoque cuantitativo, con diseño no experimental, recolección de datos mediante [instrumento] y análisis estadístico descriptivo/inferencial.',
  },
};

export function obtenerEjemploPorArea(area: string): EjemploArea {
  return EJEMPLOS_POR_AREA[area] || GENERICO;
}
