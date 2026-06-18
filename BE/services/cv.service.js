// Servicio del Currículum Vitae del Estudiante (RF-11).
// Cubre las 4 secciones del CV:
//   Sección 1 — Información Académica (informacion_estudiante + proyecto_graduacion)
//   Sección 2 — Experiencia y Proyectos (experiencia_estudiante + bullets)
//   Sección 3 — Habilidades e Idiomas (habilidades_estudiante)
//   Sección 4 — Certificaciones y Logros (certificaciones_estudiante)
// Incluye también una función que devuelve el CV completo en una sola consulta.

const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');


// ======================================================
// CV COMPLETO — una sola respuesta con todas las secciones
// ======================================================

const obtenerCvCompleto = async (idUsuario) => {

    const [
        infoRes,
        proyectoRes,
        experienciasRes,
        habilidadesRes,
        certificacionesRes,
    ] = await Promise.all([
        supabase
            .from('informacion_estudiante')
            .select('carne, ano_ingreso, id_nivel_academico, promedio_ponderado, habilidades, cursos_relevantes')
            .eq('id_usuario', idUsuario)
            .maybeSingle(),
        supabase
            .from('proyecto_graduacion')
            .select('id, titulo_proyecto, descripcion, id_tipo_proyecto, porcentaje_avance, proyecto_finalizado')
            .eq('id_estudiante', idUsuario)
            .maybeSingle(),
        supabase
            .from('experiencia_estudiante')
            .select('id, tipo, titulo, organizacion, fecha_inicio, fecha_fin, descripcion, bullets')
            .eq('id_usuario', idUsuario)
            .order('id', { ascending: true }),
        supabase
            .from('habilidades_estudiante')
            .select('id, tecnicas, blandas, idiomas')
            .eq('id_usuario', idUsuario)
            .maybeSingle(),
        supabase
            .from('certificaciones_estudiante')
            .select('id, nombre, institucion, fecha, url_verificacion')
            .eq('id_usuario', idUsuario)
            .order('id', { ascending: true }),
    ]);

    if (infoRes.error) throw mapDbError(infoRes.error);
    if (proyectoRes.error) throw mapDbError(proyectoRes.error);
    if (experienciasRes.error) throw mapDbError(experienciasRes.error);
    if (habilidadesRes.error) throw mapDbError(habilidadesRes.error);
    if (certificacionesRes.error) throw mapDbError(certificacionesRes.error);

    return {
        seccion1_academica: infoRes.data,
        seccion1_proyecto: proyectoRes.data,
        seccion2_experiencias: experienciasRes.data || [],
        seccion3_habilidades: habilidadesRes.data,
        seccion4_certificaciones: certificacionesRes.data || [],
    };
};


// ======================================================
// SECCIÓN 2 — EXPERIENCIA Y PROYECTOS
// ======================================================

const obtenerExperienciasPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from('experiencia_estudiante')
        .select('id, tipo, titulo, organizacion, fecha_inicio, fecha_fin, descripcion, bullets')
        .eq('id_usuario', idUsuario)
        .order('id', { ascending: true });

    if (error) throw mapDbError(error);

    return data;
};

const obtenerExperienciaPorId = async (id) => {

    const { data, error } = await supabase
        .from('experiencia_estudiante')
        .select('id, tipo, titulo, organizacion, fecha_inicio, fecha_fin, descripcion, bullets')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};

const crearExperiencia = async (experienciaData) => {

    const nuevaExperiencia = {
        id_usuario: experienciaData.id_usuario,
        tipo: experienciaData.tipo,
        titulo: experienciaData.titulo,
        organizacion: experienciaData.organizacion || null,
        fecha_inicio: experienciaData.fecha_inicio,
        fecha_fin: experienciaData.fecha_fin || null,
        descripcion: experienciaData.descripcion || null,
        // bullets: JSON-string con array de frases (máx 5, máx 120 chars c/u)
        // Ej: '["Desarrollé X", "Lideré Y"]'
        bullets: experienciaData.bullets || null,
    };

    const { data, error } = await supabase
        .from('experiencia_estudiante')
        .insert([nuevaExperiencia])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};

const actualizarExperiencia = async (id, experienciaData) => {

    const datosActualizar = {};

    if (experienciaData.tipo !== undefined) datosActualizar.tipo = experienciaData.tipo;
    if (experienciaData.titulo !== undefined) datosActualizar.titulo = experienciaData.titulo;
    if (experienciaData.organizacion !== undefined) datosActualizar.organizacion = experienciaData.organizacion;
    if (experienciaData.fecha_inicio !== undefined) datosActualizar.fecha_inicio = experienciaData.fecha_inicio;
    if (experienciaData.fecha_fin !== undefined) datosActualizar.fecha_fin = experienciaData.fecha_fin;
    if (experienciaData.descripcion !== undefined) datosActualizar.descripcion = experienciaData.descripcion;
    if (experienciaData.bullets !== undefined) datosActualizar.bullets = experienciaData.bullets;
    datosActualizar.updated_at = new Date();

    const { data, error } = await supabase
        .from('experiencia_estudiante')
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};

const eliminarExperiencia = async (id) => {

    const { error } = await supabase
        .from('experiencia_estudiante')
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return { mensaje: 'Experiencia eliminada correctamente' };
};


// ======================================================
// SECCIÓN 3 — HABILIDADES E IDIOMAS
// ======================================================

const obtenerHabilidadesPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from('habilidades_estudiante')
        .select('id, tecnicas, blandas, idiomas')
        .eq('id_usuario', idUsuario)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};

const crearHabilidades = async (habilidadesData) => {

    const nuevasHabilidades = {
        id_usuario: habilidadesData.id_usuario,
        // tecnicas: JSON-string con nivel. Ej: '[{"nombre":"Python","nivel":"Avanzado"}]'
        tecnicas: habilidadesData.tecnicas || null,
        // blandas: texto libre separado por comas o JSON-string simple
        blandas: habilidadesData.blandas || null,
        // idiomas: JSON-string con nivel. Ej: '[{"idioma":"Inglés","nivel":"B2"}]'
        idiomas: habilidadesData.idiomas || null,
    };

    const { data, error } = await supabase
        .from('habilidades_estudiante')
        .insert([nuevasHabilidades])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};

const actualizarHabilidades = async (id, habilidadesData) => {

    const datosActualizar = {};

    if (habilidadesData.tecnicas !== undefined) datosActualizar.tecnicas = habilidadesData.tecnicas;
    if (habilidadesData.blandas !== undefined) datosActualizar.blandas = habilidadesData.blandas;
    if (habilidadesData.idiomas !== undefined) datosActualizar.idiomas = habilidadesData.idiomas;
    datosActualizar.updated_at = new Date();

    const { data, error } = await supabase
        .from('habilidades_estudiante')
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// SECCIÓN 4 — CERTIFICACIONES Y LOGROS
// ======================================================

const obtenerCertificacionesPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from('certificaciones_estudiante')
        .select('id, nombre, institucion, fecha, url_verificacion')
        .eq('id_usuario', idUsuario)
        .order('id', { ascending: true });

    if (error) throw mapDbError(error);

    return data;
};

const obtenerCertificacionPorId = async (id) => {

    const { data, error } = await supabase
        .from('certificaciones_estudiante')
        .select('id, nombre, institucion, fecha, url_verificacion')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};

const crearCertificacion = async (certificacionData) => {

    const nuevaCertificacion = {
        id_usuario: certificacionData.id_usuario,
        nombre: certificacionData.nombre,
        institucion: certificacionData.institucion || null,
        fecha: certificacionData.fecha || null,
        url_verificacion: certificacionData.url_verificacion || null,
    };

    const { data, error } = await supabase
        .from('certificaciones_estudiante')
        .insert([nuevaCertificacion])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};

const actualizarCertificacion = async (id, certificacionData) => {

    const datosActualizar = {};

    if (certificacionData.nombre !== undefined) datosActualizar.nombre = certificacionData.nombre;
    if (certificacionData.institucion !== undefined) datosActualizar.institucion = certificacionData.institucion;
    if (certificacionData.fecha !== undefined) datosActualizar.fecha = certificacionData.fecha;
    if (certificacionData.url_verificacion !== undefined) datosActualizar.url_verificacion = certificacionData.url_verificacion;
    datosActualizar.updated_at = new Date();

    const { data, error } = await supabase
        .from('certificaciones_estudiante')
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};

const eliminarCertificacion = async (id) => {

    const { error } = await supabase
        .from('certificaciones_estudiante')
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return { mensaje: 'Certificación eliminada correctamente' };
};


// ======================================================
// RF-12 — IA DE ADAPTACIÓN DE CV
// Motor: Claude API (claude-sonnet-4-6) como reclutador senior
// ======================================================

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT_SISTEMA = `Eres un reclutador profesional senior especializado en ayudar a estudiantes universitarios
a adaptar su currículum vitae para posiciones específicas.

Reglas estrictas:
- Verbos de acción al inicio de cada bullet (Desarrollé, Lideré, Optimicé, Implementé)
- Cuantifica logros; si no hay datos, sugiere placeholders ("X% de mejora", "N usuarios")
- Alinea keywords exactos del puesto (optimización ATS)
- Elimina relleno: "responsable de...", "apoyé en..."
- Prioriza experiencias relevantes al puesto
- Tono: profesional, directo, primera persona implícita (sin "yo")
- NUNCA inventes experiencias, habilidades o logros que no existan en el CV original
- Si falta información, indica qué falta en lugar de inventar

Responde ÚNICAMENTE en JSON sin backticks:
{
  "sugerencias": [
    {
      "seccion": "experiencia|habilidades|certificaciones",
      "id_item": "id del item original o null",
      "campo": "bullets|tecnicas|blandas|idiomas|nombre",
      "original": "texto original",
      "sugerido": "texto mejorado",
      "razon": "explicación breve"
    }
  ],
  "resumen": "párrafo explicando los cambios principales"
}`;

const construirPromptUsuario = (cv, posicion) => {
    const experiencias = (cv.seccion2_experiencias || []).map(e => ({
        id: e.id, tipo: e.tipo, titulo: e.titulo, organizacion: e.organizacion,
        fecha_inicio: e.fecha_inicio, fecha_fin: e.fecha_fin || 'actual',
        bullets: e.bullets ? JSON.parse(e.bullets) : [],
        descripcion: e.descripcion,
    }));
    const habilidades = cv.seccion3_habilidades ? {
        tecnicas: cv.seccion3_habilidades.tecnicas ? JSON.parse(cv.seccion3_habilidades.tecnicas) : [],
        blandas: cv.seccion3_habilidades.blandas || '',
        idiomas: cv.seccion3_habilidades.idiomas ? JSON.parse(cv.seccion3_habilidades.idiomas) : [],
    } : {};
    return `CV DEL ESTUDIANTE:
${JSON.stringify({ experiencias, habilidades, certificaciones: cv.seccion4_certificaciones || [] }, null, 2)}

POSICIÓN:
Título: ${posicion.titulo_puesto}
Tipo: ${posicion.tipo}
Empresa: ${posicion.empresa || 'No especificada'}
Descripción: ${posicion.descripcion || 'No especificada'}
Habilidades requeridas: ${posicion.habilidades ? JSON.parse(posicion.habilidades).join(', ') : 'No especificadas'}
Responsabilidades: ${(posicion.responsabilidades || []).map(r => r.nombre).join(', ')}
Sectores: ${(posicion.sectores || []).map(s => s.nombre).join(', ')}

Analiza el CV y sugiere mejoras para esta posición.`;
};

const adaptarCvConIA = async (idEstudiante, idPosicion) => {
    const cv = await obtenerCvCompleto(idEstudiante);
    if (!cv.seccion2_experiencias?.length && !cv.seccion3_habilidades) {
        const err = new Error('El CV no tiene suficiente información. Completa al menos una experiencia o habilidades.');
        err.statusCode = 400;
        throw err;
    }
    const [puestoRes, respRes, sectRes] = await Promise.all([
        supabase.from('puestos_empleo').select('*').eq('id', idPosicion).maybeSingle(),
        supabase.from('responsabilidades_empleo').select('responsabilidades(nombre)').eq('id_empleo', idPosicion),
        supabase.from('sectores_empleo').select('sectores(nombre)').eq('id_empleo', idPosicion),
    ]);
    if (!puestoRes.data) {
        const err = new Error('Posición no encontrada'); err.statusCode = 404; throw err;
    }
    const posicion = {
        ...puestoRes.data,
        responsabilidades: respRes.data?.map(r => r.responsabilidades) || [],
        sectores: sectRes.data?.map(s => s.sectores) || [],
    };
    const mensaje = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: PROMPT_SISTEMA,
        messages: [{ role: 'user', content: construirPromptUsuario(cv, posicion) }],
    });
    let sugerencias;
    try {
        sugerencias = JSON.parse(mensaje.content[0].text.replace(/```json|```/g, '').trim());
    } catch (e) {
        const err = new Error('Error al procesar la respuesta de la IA. Intenta de nuevo.');
        err.statusCode = 500; throw err;
    }
    return { sugerencias, cv_original: cv, posicion: { id: posicion.id, titulo_puesto: posicion.titulo_puesto, empresa: posicion.empresa } };
};


// ======================================================
// RF-12 — GESTIÓN DE VERSIONES (cv_versiones)
// ======================================================

const guardarVersionCv = async (idEstudiante, idPosicion, nombreVersion, contenidoAdaptado, sugerenciasIa) => {
    const { count } = await supabase.from('cv_versiones').select('id', { count: 'exact', head: true }).eq('id_estudiante', idEstudiante);
    if (count >= 10) {
        const err = new Error('Límite de 10 versiones alcanzado. Elimina una antes de guardar.');
        err.statusCode = 400; throw err;
    }
    const { data, error } = await supabase.from('cv_versiones').upsert({
        id_estudiante: idEstudiante,
        id_posicion: idPosicion,
        nombre_version: nombreVersion,
        contenido_adaptado: typeof contenidoAdaptado === 'string' ? contenidoAdaptado : JSON.stringify(contenidoAdaptado),
        sugerencias_ia: sugerenciasIa ? JSON.stringify(sugerenciasIa) : null,
        updated_at: new Date(),
    }, { onConflict: 'id_estudiante,id_posicion' }).select().single();
    if (error) throw mapDbError(error);
    return data;
};

const obtenerVersionesCv = async (idEstudiante) => {
    const { data, error } = await supabase.from('cv_versiones')
        .select('id, nombre_version, created_at, updated_at, puestos_empleo(id, titulo_puesto, empresa)')
        .eq('id_estudiante', idEstudiante)
        .order('updated_at', { ascending: false });
    if (error) throw mapDbError(error);
    return data;
};

const obtenerVersionCvPorId = async (id) => {
    const { data, error } = await supabase.from('cv_versiones').select('*').eq('id', id).maybeSingle();
    if (error) throw mapDbError(error);
    return data;
};

const eliminarVersionCv = async (id) => {
    const { error } = await supabase.from('cv_versiones').delete().eq('id', id);
    if (error) throw mapDbError(error);
    return { mensaje: 'Versión eliminada correctamente' };
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    // CV completo
    obtenerCvCompleto,
    // Sección 2 — Experiencia
    obtenerExperienciasPorUsuario,
    obtenerExperienciaPorId,
    crearExperiencia,
    actualizarExperiencia,
    eliminarExperiencia,
    // Sección 3 — Habilidades
    obtenerHabilidadesPorUsuario,
    crearHabilidades,
    actualizarHabilidades,
    // Sección 4 — Certificaciones
    obtenerCertificacionesPorUsuario,
    obtenerCertificacionPorId,
    crearCertificacion,
    actualizarCertificacion,
    eliminarCertificacion,
    // RF-12 — IA + Versiones
    adaptarCvConIA,
    guardarVersionCv,
    obtenerVersionesCv,
    obtenerVersionCvPorId,
    eliminarVersionCv,
};