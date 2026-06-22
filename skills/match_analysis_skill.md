---
name: match-and-profile-analysis
description: Skill para el análisis profundo de compatibilidad y afinidad entre estudiantes y exalumnos mentores de la Universidad de Costa Rica (UCR). Utilizado para evaluar el alineamiento académico, profesional y personal entre perfiles de usuarios.
license: MIT
---

# Habilidad de Análisis de Compatibilidad y Matches de Usuario

Esta habilidad define las directrices, la lógica de negocio y las plantillas de prompts de sistema para realizar análisis profundos de afinidad y recomendación de perfiles entre estudiantes activos y exalumnos mentores en la plataforma "Alumni UCR — Conectando Talento".

## Objetivo de la Habilidad

El motor tradicional de emparejamiento calcula una coincidencia preliminar basada en reglas estáticas (carrera, áreas temáticas, sectores, tipo de apoyo). Esta habilidad permite extender ese análisis estático a través de un procesamiento de lenguaje natural (LLM) que analiza el currículum del estudiante, la biografía y trayectoria del mentor, identificando sinergias profundas a nivel de:
1. **Alineación Académica:** Carreras cruzadas, afinidad inter-facultades, metodologías del Trabajo Final de Graduación (TFG) o proyectos.
2. **Sinergia Profesional:** Habilidades técnicas en el CV del estudiante vs. experiencia en la industria del mentor, tecnologías compartidas y proyecciones de inserción laboral.
3. **Compatibilidad Humana/Blanda:** Hobbies, intereses extralaborales, habilidades blandas o socioemocionales compartidas o complementarias.

---

## Dimensiones de Análisis y Puntuación de Afinidad (0-100)

Para realizar una recomendación enriquecida, el sistema y el agente de IA evaluarán cuatro pilares, asignando hasta 25 puntos a cada uno:

### 1. Afinidad Académica e Interdisciplinariedad (Máx 25 puntos)
* **25 pts:** Misma carrera UCR y misma sede.
* **20 pts:** Misma carrera, distinta sede; o carreras altamente afines (ej. Computación y Ciencias de la Computación, o Eléctrica).
* **15 pts:** Carreras diferentes pero de la misma Facultad o áreas afines (ej. Ingeniería Industrial e Ingeniería Mecánica).
* **10 pts:** Interdisciplinario pero con coincidencia clara de área temática (ej. Estudiante de Biología con Mentor de Computación colaborando en Bioinformática) [+5 de bono interdisciplinario].
* **0-5 pts:** Carreras sin afinidad evidente.

### 2. Alineación del Proyecto/TFG y Habilidades Técnicas (Máx 25 puntos)
* **25 pts:** El proyecto de graduación del estudiante coincide directamente con el área de experiencia técnica actual del mentor o sector tecnológico.
* **20 pts:** El estudiante posee habilidades técnicas en su CV que corresponden con las herramientas que el mentor utiliza a diario en su puesto de trabajo.
* **15 pts:** El mentor trabaja en un área de la cual el estudiante posee interés formativo o certificaciones iniciales.
* **5-10 pts:** Afinidad técnica indirecta o básica.
* **0 pts:** Sin afinidad en tecnologías o proyectos.

### 3. Ajuste de Rol Profesional e Inserción Laboral (Máx 25 puntos)
* **25 pts:** El cargo deseado u objetivo profesional del estudiante en su currículum es el mismo o un nivel junior del rol actual o pasado del mentor (ej. estudiante aspira a "Analista de Datos Junior" y el mentor es "Lead Data Scientist").
* **20 pts:** El mentor trabaja en una de las empresas objetivo o tipos de organizaciones de interés del estudiante.
* **15 pts:** El mentor posee una amplia red de contactos o años de experiencia (10+) en el sector de inserción del estudiante.
* **5-10 pts:** Afinidad general de mercado.
* **0 pts:** Proyecciones profesionales no alineadas.

### 4. Compatibilidad de Intereses y Habilidades Blandas (Máx 25 puntos)
* **25 pts:** Comparten intereses personales/hobbies específicos (ej. voluntariado, deportes, música) y habilidades blandas complementarias (ej. estudiante busca desarrollar liderazgo y el mentor destaca en mentoría y liderazgo de equipos).
* **15 pts:** Intereses comunes en áreas de desarrollo general.
* **5-10 pts:** Habilidades blandas afines declaradas.
* **0 pts:** Sin intereses compartidos documentados.

---

## Plantilla de Prompt de Sistema para Análisis de Match Enriquecido

Cuando el backend o el agente de IA requiera analizar un par Estudiante ↔ Mentor, debe utilizar el siguiente prompt de sistema para estructurar la respuesta:

```text
Eres un asesor de carrera senior y especialista en mentorías de la Universidad de Costa Rica (UCR). Tu misión es analizar de forma exhaustiva, objetiva y empática la compatibilidad y afinidad entre un estudiante y un mentor exalumno.

DATOS DEL ESTUDIANTE:
- Nombre: {estudiante_nombre}
- Carrera y Facultad: {estudiante_carrera} ({estudiante_facultad})
- Sede UCR: {estudiante_sede}
- TFG/Proyecto: {estudiante_proyecto_titulo} - {estudiante_proyecto_descripcion}
- Habilidades Técnicas: {estudiante_habilidades_tecnicas}
- Habilidades Blandas: {estudiante_habilidades_blandas}
- Cargo Deseado/Objetivo en CV: {estudiante_cargo_deseado}
- Hobbies e Intereses: {estudiante_intereses}
- Resumen de Experiencia: {estudiante_experiencias_cv}

DATOS DEL MENTOR EXALUMNO:
- Nombre: {mentor_nombre}
- Empresa y Cargo Actual: {mentor_cargo} en {mentor_empresa}
- Trayectoria y Biografía: {mentor_biografia}
- Años de Experiencia: {mentor_anos_experiencia}
- Carreras Graduadas UCR: {mentor_carreras}
- Áreas de Especialidad declaradas: {mentor_areas}

Por favor, computa la afinidad detallando la puntuación de cada dimensión (sobre 25) y calcula el Score de Compatibilidad Total (0 a 100).
Debes estructurar tu respuesta en formato Markdown con las siguientes secciones obligatorias:

### 🌟 Análisis de Compatibilidad: {estudiante_nombre} ↔ {mentor_nombre}

**Score Total de Match de Afinidad: [X]/100**

1. **Alineación Académica e Interdisciplinariedad ([X]/25):**
   *Explica detalladamente la coincidencia de carreras, facultades o la sinergia interdisciplinaria que beneficia el proyecto del estudiante.*

2. **Sinergia Técnica y de Proyecto ([X]/25):**
   *Analiza la relación entre el TFG/Proyecto del estudiante y los conocimientos técnicos del mentor. Identifica qué tecnologías o metodologías del CV del estudiante se verán más potenciadas por este mentor.*

3. **Proyección Profesional y Mercado Laboral ([X]/25):**
   *Evalúa la distancia entre el cargo deseado del estudiante y el perfil laboral del mentor. Detalla cómo la red del mentor o su rol actual (ej: en {mentor_empresa}) acelera la inserción laboral del estudiante.*

4. **El Lado Humano: Afinidad Personal y Habilidades Blandas ([X]/25):**
   *Encuentra puntos de unión en pasatiempos, habilidades blandas complementarias y el tipo de relación humana de mentoría que pueden forjar.*

### 🛠️ Recomendaciones de Enfoque para la Mentoría:
- **Tema prioritario 1:** [Descripción del tema]
- **Tema prioritario 2:** [Descripción del tema]
- **Dinámica sugerida:** [Ej. Sesión de revisión metodológica de TFG, simulación de entrevistas técnicas, etc.]
```

---

## Directrices para el Código del Backend

1. **Consolidación de Datos:** Antes de realizar el análisis del match, el backend debe recuperar el perfil completo de onboarding del estudiante (`perfil_onboarding`), su CV generado (`experiencias_estudiante`, `habilidades_estudiante`, `certificaciones_estudiante`) y los detalles del mentor (`informacion_exalumno`, `carreras_usuario`, `areas_interes_exalumno`).
2. **Optimización de Costos:** Dado que el análisis LLM es detallado, este análisis enriquecido debe realizarse bajo demanda (ej. cuando el mentor hace clic en "Ver Análisis de Compatibilidad de IA" para un estudiante sugerido, o viceversa) y persistirse en caché o en la tabla `matches_mentoria` en un campo JSON llamado `analisis_ia` para evitar re-generaciones innecesarias.
3. **Privacidad:** Nunca compartas información de contacto directa (correo, teléfono) en el prompt de la IA para resguardar las políticas de privacidad antes de que el match se acepte.
