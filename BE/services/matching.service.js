// Motor de Matching Interdisciplinario.
//
// Cruza, con datos REALES de la base, tres entidades:
//   - Proyectos de graduación (proyecto_graduacion) y sus áreas temáticas.
//   - Estudiantes dueños del proyecto (carrera/facultad).
//   - Exalumnos que ofrecen mentoría (informacion_exalumno) y sus áreas.
//
// Por cada proyecto recomienda mentores cuyas áreas coinciden, y marca la
// coincidencia como INTERDISCIPLINARIA cuando el mentor proviene de una
// facultad distinta a la del estudiante (colaboración entre disciplinas).

const supabase = require('../config/supabase');

const lanzarSi = (error, contexto) => {
  if (error) {
    const err = new Error(`Error al consultar ${contexto}: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }
};

const obtenerMatching = async () => {
  const [
    areasRes,
    proyectosRes,
    areasProyRes,
    areasExaRes,
    mentoresRes,
    usuariosRes,
    carrUsuRes,
    carrerasRes,
    facultadesRes,
  ] = await Promise.all([
    supabase.from('areas_interes').select('id,nombre'),
    supabase.from('proyecto_graduacion').select('id,titulo_proyecto,descripcion,porcentaje_avance,id_estudiante'),
    supabase.from('areas_interes_proyecto').select('id_proyecto,id_area_tematica'),
    supabase.from('areas_interes_exalumno').select('id_exalumno,id_area_tematica'),
    supabase.from('informacion_exalumno').select('id_usuario,empresa,cargo,anos_experiencia,ofrece_mentoria').eq('ofrece_mentoria', true),
    supabase.from('usuarios').select('id,nombre,id_rol'),
    supabase.from('carreras_usuario').select('id_usuario,id_carrera'),
    supabase.from('carreras').select('id,nombre,id_facultad'),
    supabase.from('facultades').select('id,nombre'),
  ]);

  lanzarSi(areasRes.error, 'áreas de interés');
  lanzarSi(proyectosRes.error, 'proyectos');
  lanzarSi(areasProyRes.error, 'áreas de proyectos');
  lanzarSi(areasExaRes.error, 'áreas de exalumnos');
  lanzarSi(mentoresRes.error, 'mentores');
  lanzarSi(usuariosRes.error, 'usuarios');
  lanzarSi(carrUsuRes.error, 'carreras de usuario');
  lanzarSi(carrerasRes.error, 'carreras');
  lanzarSi(facultadesRes.error, 'facultades');

  const areaNombre = new Map(areasRes.data.map((a) => [a.id, a.nombre]));
  const facultadNombre = new Map(facultadesRes.data.map((f) => [f.id, f.nombre]));
  const carreraInfo = new Map(carrerasRes.data.map((c) => [c.id, c]));
  const usuario = new Map(usuariosRes.data.map((u) => [u.id, u]));

  // Carrera/facultad por usuario (primera carrera declarada).
  const carreraDeUsuario = new Map();
  for (const cu of carrUsuRes.data) {
    if (carreraDeUsuario.has(cu.id_usuario)) continue;
    const c = carreraInfo.get(cu.id_carrera);
    if (c) {
      carreraDeUsuario.set(cu.id_usuario, {
        carrera: c.nombre,
        facultadId: c.id_facultad,
        facultad: facultadNombre.get(c.id_facultad) || null,
      });
    }
  }

  // Áreas (ids) por proyecto y por exalumno.
  const areasDeProyecto = new Map();
  for (const ap of areasProyRes.data) {
    if (!areasDeProyecto.has(ap.id_proyecto)) areasDeProyecto.set(ap.id_proyecto, new Set());
    areasDeProyecto.get(ap.id_proyecto).add(ap.id_area_tematica);
  }
  const areasDeExalumno = new Map();
  for (const ae of areasExaRes.data) {
    if (!areasDeExalumno.has(ae.id_exalumno)) areasDeExalumno.set(ae.id_exalumno, new Set());
    areasDeExalumno.get(ae.id_exalumno).add(ae.id_area_tematica);
  }

  let totalCoincidencias = 0;
  let totalInterdisciplinarias = 0;

  const proyectos = proyectosRes.data.map((p) => {
    const dueno = usuario.get(p.id_estudiante);
    const datosEstudiante = carreraDeUsuario.get(p.id_estudiante) || {};
    const areasIds = [...(areasDeProyecto.get(p.id) || [])];

    const mentores = mentoresRes.data
      .map((m) => {
        const mAreas = areasDeExalumno.get(m.id_usuario) || new Set();
        const comunes = areasIds.filter((a) => mAreas.has(a));
        if (comunes.length === 0) return null;

        const datosMentor = carreraDeUsuario.get(m.id_usuario) || {};
        const interdisciplinario =
          Boolean(datosEstudiante.facultadId) &&
          Boolean(datosMentor.facultadId) &&
          datosEstudiante.facultadId !== datosMentor.facultadId;

        return {
          id: m.id_usuario,
          nombre: usuario.get(m.id_usuario)?.nombre || 'Mentor',
          empresa: m.empresa,
          cargo: m.cargo,
          anosExperiencia: m.anos_experiencia,
          facultad: datosMentor.facultad,
          carrera: datosMentor.carrera,
          areasComunes: comunes.map((a) => areaNombre.get(a)),
          interdisciplinario,
          score: comunes.length + (interdisciplinario ? 1 : 0),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    totalCoincidencias += mentores.length;
    totalInterdisciplinarias += mentores.filter((m) => m.interdisciplinario).length;

    return {
      id: p.id,
      titulo: p.titulo_proyecto,
      descripcion: p.descripcion,
      avance: p.porcentaje_avance,
      estudiante: {
        nombre: dueno?.nombre || 'Estudiante',
        carrera: datosEstudiante.carrera || null,
        facultad: datosEstudiante.facultad || null,
      },
      areas: areasIds.map((a) => areaNombre.get(a)),
      mentores,
    };
  });

  return {
    resumen: {
      proyectos: proyectos.length,
      mentores: mentoresRes.data.length,
      coincidencias: totalCoincidencias,
      interdisciplinarias: totalInterdisciplinarias,
    },
    proyectos,
  };
};

module.exports = { obtenerMatching };
